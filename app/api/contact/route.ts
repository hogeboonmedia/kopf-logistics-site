/**
 * POST /api/contact — Unified submit endpoint for ALL audience-specific forms
 * (general contact, agent application, shipper inquiry, driver application).
 *
 * Each form on the site posts to this same endpoint with a `source` field
 * identifying which form it came from. Audience-specific extra fields (truck
 * type, company name, employment type, etc.) are passed in `extra_fields` —
 * a free-form JSON object that gets persisted as JSONB and rendered in the
 * notification email.
 *
 * Pipeline (early-reject ordering = save the most expensive checks for last):
 *   1. Honeypot (`website` field) — instant 200 silent drop.
 *   2. Rate limit (10/hour/IP).
 *   3. Marissa-editable blocklists (country, IP, keyword) — silent 200 drop.
 *   4. Cloudflare Turnstile token verification.
 *   5. Field validation.
 *   6. CleanTalk Anti-Spam Cloud check — silent 200 drop if `block`.
 *   7. Mailgun send + DB insert with disposition AND source tag.
 *
 * Every submission is persisted to `contact_submissions` regardless of
 * outcome — Marissa audits at /admin/inquiries (filterable by source).
 */

import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailgun";
import { isDbConfigured, sql } from "@/lib/db/client";
import { readGeo } from "@/lib/request-geo";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkSpam } from "@/lib/cleantalk";
import {
  isBlockedCountry,
  isBlockedIp,
  containsBlockedKeyword,
} from "@/lib/blocklists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where submissions get emailed. Default = recruiter@kopflogisticsgroup.com
// (production). Override with CONTACT_RECIPIENT_EMAIL during testing —
// currently set to jason@hogeboonmedia.com so client doesn't see test mail.
const RECIPIENT =
  process.env.CONTACT_RECIPIENT_EMAIL || "recruiter@kopflogisticsgroup.com";

/** Whitelist of accepted form sources. Mirrors the DB CHECK constraint
 * (lib/db/migrations/004 + 005). */
const VALID_SOURCES = new Set(["contact", "agent", "shippers", "drivers", "chatbot"]);

/** Human-friendly labels for each source — used in email subject + dashboard. */
const SOURCE_LABEL: Record<string, string> = {
  contact: "General Inquiry",
  agent: "Freight Agent Application",
  shippers: "Shipper Inquiry",
  drivers: "Driver Application",
  chatbot: "Chat Lead",
};

interface Payload {
  // Source tag — required, validates against VALID_SOURCES
  source?: string;

  // Common fields shared across all forms
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;

  // For the general contact form: preferred contact method + free-form message
  inquiry?: string;
  inquiry_body?: string;

  // Audience-specific fields (truck_type, company, employment_type, etc.).
  // Stored as JSONB in Postgres + rendered as a labeled list in the email.
  extra_fields?: Record<string, unknown>;

  // Anti-spam infrastructure
  website?: string; // honeypot
  turnstileToken?: string;
  submit_time?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const geo = readGeo(req.headers);
  const submitTime = typeof body.submit_time === "number" ? body.submit_time : 0;

  // Validate + normalize source. Default to "contact" if missing/invalid so a
  // legacy form (or a JS-disabled fallback) still produces a usable submission.
  const source =
    body.source && VALID_SOURCES.has(body.source) ? body.source : "contact";
  const sourceLabel = SOURCE_LABEL[source];

  // The "message" we send to CleanTalk for spam-checking + email body. For
  // the general form this is the explicit message; for audience forms with
  // no free-text field, we serialize the extra fields into a readable summary.
  const inquiryBody = (body.inquiry_body ?? "").trim();
  const extraEntries = Object.entries(body.extra_fields ?? {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== "",
  );
  const cleantalkMessage =
    inquiryBody ||
    extraEntries
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n") ||
    `New ${sourceLabel}`;

  /** Persist a submission row + (optionally) its outcome reason. */
  async function record(
    disposition: string,
    reason: string | null,
    cleantalkVerdict: string | null = null,
    cleantalkReason: string | null = null,
  ) {
    if (!isDbConfigured()) return;
    try {
      await sql`
        INSERT INTO contact_submissions (
          first_name, last_name, email, phone, inquiry, body,
          source, extra_fields,
          disposition, disposition_reason,
          ip, user_agent, geo_country, geo_city,
          cleantalk_verdict, cleantalk_reason
        ) VALUES (
          ${body.first_name ?? ""}, ${body.last_name ?? null},
          ${body.email ?? ""}, ${body.phone ?? null},
          ${body.inquiry ?? null}, ${cleantalkMessage},
          ${source}, ${JSON.stringify(body.extra_fields ?? {})}::jsonb,
          ${disposition}, ${reason},
          ${geo.ip}, ${geo.userAgent},
          ${geo.country}, ${geo.city},
          ${cleantalkVerdict}, ${cleantalkReason}
        )
      `;
    } catch (err) {
      console.error("[contact] failed to persist submission:", err);
    }
  }

  // 1. Honeypot — silent success so spammers don't iterate.
  if (body.website && body.website.length > 0) {
    await record("blocked_honeypot", "honeypot field filled");
    return json({ ok: true });
  }

  // 2. Rate limit (10/hour/IP, scoped per-source so a busy /shippers form
  //    doesn't lock out a legit /contact submission from the same IP)
  const rl = rateLimit(`contact:${source}:${geo.ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    await record("blocked_rate_limit", "10 submissions/hour exceeded");
    return json({ ok: false, error: "Too many requests. Try again later." }, 429);
  }

  // 3. Blocklist checks (run against the cleantalk message, which is the
  //    free-text body OR the serialized extras)
  if (await isBlockedCountry(geo.country)) {
    await record("blocked_country", `country=${geo.country}`);
    return json({ ok: true });
  }
  if (await isBlockedIp(geo.ip)) {
    await record("blocked_ip", `ip=${geo.ip}`);
    return json({ ok: true });
  }
  const kwHit = await containsBlockedKeyword(cleantalkMessage);
  if (kwHit.blocked) {
    await record("blocked_keyword", `keyword=${kwHit.hit}`);
    return json({ ok: true });
  }

  // 4. Turnstile (skipped if not configured, eases local dev).
  //
  // Skipped entirely for `source === "chatbot"` — there's no Turnstile widget
  // inside the chat window (would break the conversational UX), and the
  // chatbot has its own per-IP rate limit on /api/chat upstream. CleanTalk
  // (step 6 below) still runs for chatbot submissions, so we still get
  // server-side spam filtering.
  if (process.env.TURNSTILE_SECRET_KEY && source !== "chatbot") {
    const tsResult = await verifyTurnstile(body.turnstileToken ?? "", geo.ip ?? undefined);
    if (!tsResult.success) {
      await record("blocked_turnstile", tsResult.reason ?? "turnstile failed");
      return json({ ok: false, error: "Spam check failed. Please refresh and try again." }, 400);
    }
  }

  // 5. Field validation (common across all sources)
  const first = (body.first_name ?? "").trim();
  const last = (body.last_name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (first.length < 1 || first.length > 80) {
    return json({ ok: false, error: "First name is required." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  // Per-source validation: general contact requires a free-text message.
  // Audience forms validate via the presence of their key extra fields.
  if (source === "contact" && (inquiryBody.length < 5 || inquiryBody.length > 4000)) {
    return json({ ok: false, error: "Please describe your inquiry (5–4000 characters)." }, 400);
  }
  // Phone required for the audience-specific application forms (agent,
  // shippers, drivers) where dispatch needs to call the lead. NOT required
  // for `source === "chatbot"` because the chat lead form lets visitors pick
  // their preferred channel (email/phone/text). The chat form already
  // enforces phone client-side when the visitor picks a phone-or-text channel.
  if (source !== "contact" && source !== "chatbot" && phone.length < 7) {
    return json({ ok: false, error: "Phone number is required." }, 400);
  }

  // 6. CleanTalk
  const ct = await checkSpam({
    message: cleantalkMessage,
    sender_email: email,
    sender_nickname: `${first} ${last}`.trim(),
    sender_ip: geo.ip ?? undefined,
    submit_time: submitTime || 5,
    js_on: 1,
  });

  if (ct.verdict === "block") {
    await record("blocked_cleantalk", ct.reason, ct.verdict, ct.reason);
    return json({ ok: true });
  }

  // 7. Send email via Mailgun (and persist as 'sent')
  // Subject pre-tagged with the source so Marissa can filter her inbox.
  const subject = `[${sourceLabel}] ${first} ${last}`.trim();
  const geoLine =
    geo.city || geo.country
      ? `Submitted from ${[geo.city, geo.region, geo.country].filter(Boolean).join(", ")} · IP ${geo.ip ?? "unknown"}`
      : `IP ${geo.ip ?? "unknown"}`;

  // Plain-text body for clients that prefer it
  const textLines = [
    `Form: ${sourceLabel}`,
    `Name: ${first} ${last}`.trim(),
    `Email: ${email}`,
    `Phone: ${phone}`,
  ];
  if (body.inquiry) textLines.push(`Preferred contact: ${body.inquiry}`);
  if (extraEntries.length > 0) {
    textLines.push("");
    textLines.push("--- Form fields ---");
    for (const [k, v] of extraEntries) {
      textLines.push(`${prettyKey(k)}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
    }
  }
  if (inquiryBody) {
    textLines.push("");
    textLines.push("--- Message ---");
    textLines.push(inquiryBody);
  }
  textLines.push("", "----", geoLine);
  textLines.push(
    `CleanTalk verdict: ${ct.verdict}${ct.reason ? ` (${ct.reason})` : ""}`,
  );
  textLines.push(`User-Agent: ${geo.userAgent ?? "unknown"}`);

  const html = renderEmailHtml({
    sourceLabel,
    first,
    last,
    email,
    phone,
    inquiryPreference: body.inquiry,
    extraEntries,
    inquiryBody,
    geoLine,
    cleantalkVerdict: ct.verdict,
    cleantalkReason: ct.reason,
  });

  const result = await sendEmail({
    to: RECIPIENT,
    replyTo: email,
    subject,
    text: textLines.join("\n"),
    html,
  });

  if (!result.ok) {
    await record("send_failed", result.error ?? "send failed", ct.verdict, ct.reason);
    return json(
      {
        ok: false,
        error:
          "We couldn't send your message. Please try again, or call 574.349.5600.",
      },
      500,
    );
  }

  await record("sent", null, ct.verdict, ct.reason);
  return json({ ok: true });
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert snake_case or camelCase keys into a Title Case label for the email. */
function prettyKey(k: string): string {
  return k
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build the HTML email body. Renders the source as a colored badge so Marissa
 * can scan her inbox and instantly tell which form a submission came from. */
function renderEmailHtml(args: {
  sourceLabel: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  inquiryPreference?: string;
  extraEntries: Array<[string, unknown]>;
  inquiryBody: string;
  geoLine: string;
  cleantalkVerdict: string;
  cleantalkReason: string;
}): string {
  const extrasHtml = args.extraEntries
    .map(
      ([k, v]) => `
        <tr>
          <td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase;width:140px">${escape(prettyKey(k))}</td>
          <td style="border-bottom:1px solid #e7dfd2">${escape(Array.isArray(v) ? v.join(", ") : String(v))}</td>
        </tr>`,
    )
    .join("");

  const messageBlock = args.inquiryBody
    ? `<h3 style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:#7a6a55;margin:20px 0 6px">Message</h3>
       <div style="white-space:pre-wrap;background:#f8f3ea;padding:14px;border-left:3px solid #ea580c">${escape(args.inquiryBody)}</div>`
    : "";

  return `
    <div style="font-family:-apple-system,system-ui,sans-serif;color:#1a130c;max-width:560px;line-height:1.5">
      <div style="margin-bottom:14px">
        <span style="display:inline-block;background:#ea580c;color:white;font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:5px 10px">${escape(args.sourceLabel)}</span>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px">New ${escape(args.sourceLabel.toLowerCase())}</h2>
      <table cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse">
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase;width:140px">Name</td><td style="border-bottom:1px solid #e7dfd2"><strong>${escape(args.first)} ${escape(args.last)}</strong></td></tr>
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Email</td><td style="border-bottom:1px solid #e7dfd2"><a href="mailto:${escape(args.email)}">${escape(args.email)}</a></td></tr>
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Phone</td><td style="border-bottom:1px solid #e7dfd2"><a href="tel:${escape(args.phone)}">${escape(args.phone)}</a></td></tr>
        ${args.inquiryPreference ? `<tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Preferred</td><td style="border-bottom:1px solid #e7dfd2">${escape(args.inquiryPreference)}</td></tr>` : ""}
        ${extrasHtml}
      </table>
      ${messageBlock}
      <p style="font-size:11px;color:#7a6a55;margin-top:18px;letter-spacing:.08em">
        ${escape(args.geoLine)}<br>
        CleanTalk verdict: <strong>${escape(args.cleantalkVerdict)}</strong>${args.cleantalkReason ? ` (${escape(args.cleantalkReason)})` : ""}
      </p>
    </div>
  `;
}
