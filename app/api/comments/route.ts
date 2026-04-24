/**
 * POST /api/comments — Submit a new comment on a blog post.
 *
 * Pipeline (mirrors /api/contact):
 *   1. Honeypot (`website` field) — silent 200.
 *   2. Rate limit (5/hour/IP).
 *   3. Marissa-editable blocklists (country, IP, keyword) — silent 200, recorded as 'spam'.
 *   4. Cloudflare Turnstile token verification.
 *   5. Field validation (name 2-60, email regex, body 5-2000, slug exists).
 *   6. CleanTalk Anti-Spam Cloud check.
 *   7. INSERT into `comments` with status:
 *        'approved' if CleanTalk allow=1
 *        'spam'     if CleanTalk block
 *        'pending'  if CleanTalk error / network failure
 *
 * Response always succeeds (or rate-limit / validation 400) so spammers can't
 * tell the difference between accepted and silently dropped.
 */

import { type NextRequest, NextResponse } from "next/server";
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
import { getAllPosts } from "@/lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  slug?: string;
  name?: string;
  email?: string;
  body?: string;
  website?: string;
  turnstileToken?: string;
  submit_time?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Comments database not configured." },
      { status: 503 },
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const geo = readGeo(req.headers);
  const submitTime = typeof body.submit_time === "number" ? body.submit_time : 0;

  const slug = (body.slug ?? "").trim().replace(/^\/+|\/+$/g, "");
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const text = (body.body ?? "").trim();

  // Always-fast invariants first.
  if (slug.length === 0 || slug.length > 200) {
    return NextResponse.json({ ok: false, error: "Invalid post slug." }, { status: 400 });
  }

  // Helper: insert a comment row with the given verdict + status.
  async function record(
    status: "approved" | "spam" | "pending",
    cleantalkVerdict: string | null,
    cleantalkReason: string | null,
  ) {
    try {
      await sql`
        INSERT INTO comments (
          post_slug, author_name, author_email, body, status,
          ip, user_agent, cleantalk_verdict, cleantalk_reason,
          geo_country, geo_city
        ) VALUES (
          ${slug}, ${name}, ${email}, ${text}, ${status},
          ${geo.ip}, ${geo.userAgent},
          ${cleantalkVerdict}, ${cleantalkReason},
          ${geo.country}, ${geo.city}
        )
      `;
    } catch (err) {
      console.error("[comments] failed to insert:", err);
    }
  }

  // 1. Honeypot
  if (body.website && body.website.length > 0) {
    await record("spam", "honeypot", "honeypot field filled");
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // 2. Rate limit
  const rl = rateLimit(`comment:${geo.ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many comments from your network. Try again later." },
      { status: 429 },
    );
  }

  // 3. Blocklist checks — silent drop, recorded as spam.
  if (await isBlockedCountry(geo.country)) {
    await record("spam", "blocklist", `country=${geo.country}`);
    return NextResponse.json({ ok: true, status: "approved" });
  }
  if (await isBlockedIp(geo.ip)) {
    await record("spam", "blocklist", `ip=${geo.ip}`);
    return NextResponse.json({ ok: true, status: "approved" });
  }
  const kwHit = await containsBlockedKeyword(text);
  if (kwHit.blocked) {
    await record("spam", "blocklist", `keyword=${kwHit.hit}`);
    return NextResponse.json({ ok: true, status: "approved" });
  }

  // 4. Turnstile (skip in local dev if not configured)
  if (process.env.TURNSTILE_SECRET_KEY) {
    const ts = await verifyTurnstile(body.turnstileToken ?? "", geo.ip ?? undefined);
    if (!ts.success) {
      return NextResponse.json(
        { ok: false, error: "Spam check failed. Please refresh and try again." },
        { status: 400 },
      );
    }
  }

  // 5. Field validation
  if (name.length < 2 || name.length > 60) {
    return NextResponse.json({ ok: false, error: "Name must be 2–60 characters." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (text.length < 5 || text.length > 2000) {
    return NextResponse.json(
      { ok: false, error: "Comment must be 5–2000 characters." },
      { status: 400 },
    );
  }

  // Verify the slug actually exists in our posts (don't let bots create
  // comment threads for posts that aren't real). post_slug stored without
  // leading slash, urlPath has leading + trailing slashes, so trim.
  const allowedSlugs = new Set(
    getAllPosts().map((p) => p.urlPath.replace(/^\/+|\/+$/g, "")),
  );
  if (!allowedSlugs.has(slug)) {
    return NextResponse.json({ ok: false, error: "Unknown post." }, { status: 400 });
  }

  // 6. CleanTalk
  const ct = await checkSpam({
    message: text,
    sender_email: email,
    sender_nickname: name,
    sender_ip: geo.ip ?? undefined,
    submit_time: submitTime || 5,
    js_on: 1,
  });

  let status: "approved" | "spam" | "pending";
  if (ct.verdict === "allow") status = "approved";
  else if (ct.verdict === "block") status = "spam";
  else status = "pending"; // 'manual' or 'error' → moderation queue

  await record(status, ct.verdict, ct.reason);

  // Tell the client whether their comment is live or in queue. We never
  // expose the 'spam' label — they see 'approved' even if silently dropped.
  return NextResponse.json({
    ok: true,
    status: status === "spam" ? "approved" : status,
  });
}
