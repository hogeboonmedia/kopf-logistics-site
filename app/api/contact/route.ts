/**
 * POST /api/contact — Replaces the old mailto: form.
 *
 * Pipeline (early-reject ordering = save the most expensive checks for last):
 *   1. Honeypot (`website` field) — instant 200 silent drop.
 *   2. Rate limit (10/hour/IP) — 429.
 *   3. Marissa-editable blocklists (country, IP, keyword) — silent 200 drop.
 *   4. Cloudflare Turnstile token — 400 if invalid.
 *   5. Field validation (name length, email regex, body length) — 400.
 *   6. CleanTalk Anti-Spam Cloud check — silent 200 drop if `block`.
 *   7. Resend send + DB insert with disposition.
 *
 * Every submission is persisted to `contact_submissions` regardless of outcome
 * — Marissa can audit blocked attempts at /admin/inquiries/.
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

// Where contact form submissions get emailed.
//   Default: recruiter@kopflogisticsgroup.com (production — once Kopf approves the new site).
//   Override via CONTACT_RECIPIENT_EMAIL env var during testing so Marissa's inbox
//   isn't filled with test submissions before the site is formally live.
const RECIPIENT =
  process.env.CONTACT_RECIPIENT_EMAIL || "recruiter@kopflogisticsgroup.com";

interface Payload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  inquiry?: string;
  inquiry_body?: string;
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

  // Convenience helper for persisting a submission row + responding.
  // We wrap DB writes in try/catch so a missing/broken DB never breaks the form.
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
          disposition, disposition_reason,
          ip, user_agent, geo_country, geo_city,
          cleantalk_verdict, cleantalk_reason
        ) VALUES (
          ${body.first_name ?? ""}, ${body.last_name ?? null},
          ${body.email ?? ""}, ${body.phone ?? null},
          ${body.inquiry ?? null}, ${body.inquiry_body ?? ""},
          ${disposition}, ${reason},
          ${geo.ip}, ${geo.userAgent},
          ${geo.country}, ${geo.city},
          ${cleantalkVerdict}, ${cleantalkReason}
        )
      `;
    } catch (err) {
      // Don't fail the request just because logging failed.
      console.error("[contact] failed to persist submission:", err);
    }
  }

  // 1. Honeypot — silent success so spammers don't iterate.
  if (body.website && body.website.length > 0) {
    await record("blocked_honeypot", "honeypot field filled");
    return json({ ok: true });
  }

  // 2. Rate limit (10/hour/IP)
  const rl = rateLimit(`contact:${geo.ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    await record("blocked_rate_limit", "10 submissions/hour exceeded");
    return json({ ok: false, error: "Too many requests. Try again later." }, 429);
  }

  // 3. Blocklist checks
  if (await isBlockedCountry(geo.country)) {
    await record("blocked_country", `country=${geo.country}`);
    return json({ ok: true });
  }
  if (await isBlockedIp(geo.ip)) {
    await record("blocked_ip", `ip=${geo.ip}`);
    return json({ ok: true });
  }
  const kwHit = await containsBlockedKeyword(body.inquiry_body);
  if (kwHit.blocked) {
    await record("blocked_keyword", `keyword=${kwHit.hit}`);
    return json({ ok: true });
  }

  // 4. Turnstile (skipped if not configured to ease local dev)
  if (process.env.TURNSTILE_SECRET_KEY) {
    const tsResult = await verifyTurnstile(body.turnstileToken ?? "", geo.ip ?? undefined);
    if (!tsResult.success) {
      await record("blocked_turnstile", tsResult.reason ?? "turnstile failed");
      return json({ ok: false, error: "Spam check failed. Please refresh and try again." }, 400);
    }
  }

  // 5. Field validation
  const first = (body.first_name ?? "").trim();
  const last = (body.last_name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const inquiryBody = (body.inquiry_body ?? "").trim();
  const inquiry = (body.inquiry ?? "").trim();

  if (first.length < 1 || first.length > 80) {
    return json({ ok: false, error: "First name is required." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  if (inquiryBody.length < 5 || inquiryBody.length > 4000) {
    return json({ ok: false, error: "Please describe your inquiry (5–4000 characters)." }, 400);
  }

  // 6. CleanTalk
  const ct = await checkSpam({
    message: inquiryBody,
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
  const subject = `New website inquiry from ${first} ${last}`.trim() || "New website inquiry";
  const geoLine = geo.city || geo.country
    ? `Submitted from ${[geo.city, geo.region, geo.country].filter(Boolean).join(", ")} · IP ${geo.ip ?? "unknown"}`
    : `IP ${geo.ip ?? "unknown"}`;

  const text = [
    `Name: ${first} ${last}`.trim(),
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Preferred contact: ${inquiry}`,
    "",
    inquiryBody,
    "",
    "----",
    geoLine,
    `CleanTalk verdict: ${ct.verdict}${ct.reason ? ` (${ct.reason})` : ""}`,
    `User-Agent: ${geo.userAgent ?? "unknown"}`,
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,system-ui,sans-serif;color:#1a130c;max-width:560px;line-height:1.5">
      <h2 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px">New website inquiry</h2>
      <table cellspacing="0" cellpadding="6" style="width:100%;border-collapse:collapse">
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase;width:140px">Name</td><td style="border-bottom:1px solid #e7dfd2"><strong>${escape(first)} ${escape(last)}</strong></td></tr>
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Email</td><td style="border-bottom:1px solid #e7dfd2"><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Phone</td><td style="border-bottom:1px solid #e7dfd2"><a href="tel:${escape(phone)}">${escape(phone)}</a></td></tr>
        <tr><td style="color:#7a6a55;font-size:11px;letter-spacing:.18em;text-transform:uppercase">Preferred</td><td style="border-bottom:1px solid #e7dfd2">${escape(inquiry)}</td></tr>
      </table>
      <h3 style="font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:#7a6a55;margin:20px 0 6px">Inquiry</h3>
      <div style="white-space:pre-wrap;background:#f8f3ea;padding:14px;border-left:3px solid #ea580c">${escape(inquiryBody)}</div>
      <p style="font-size:11px;color:#7a6a55;margin-top:18px;letter-spacing:.08em">
        ${escape(geoLine)}<br>
        CleanTalk verdict: <strong>${escape(ct.verdict)}</strong>${ct.reason ? ` (${escape(ct.reason)})` : ""}
      </p>
    </div>
  `;

  const result = await sendEmail({
    to: RECIPIENT,
    replyTo: email,
    subject,
    text,
    html,
  });

  if (!result.ok) {
    await record("send_failed", result.error ?? "send failed", ct.verdict, ct.reason);
    return json(
      { ok: false, error: "We couldn't send your message. Please try again, or call 574.349.5600." },
      500,
    );
  }

  await record("sent", null, ct.verdict, ct.reason);
  return json({ ok: true });
}

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
