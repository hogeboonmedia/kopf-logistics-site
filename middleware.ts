/**
 * Middleware — gates the admin areas that need server-side identity:
 *
 *   /admin/moderate/*    (comment moderation UI)
 *   /admin/inquiries/*   (contact form submission dashboard)
 *   /admin/blocklists/*  (country/IP/keyword blocklist management)
 *   /api/admin/comments/*   (moderation APIs)
 *   /api/admin/blocklists/* (blocklist mutation APIs)
 *
 * Allowed unauthenticated:
 *   /admin/                      (Sveltia entry point — does its own OAuth via postMessage)
 *   /admin/index.html
 *   /admin/config.yml
 *   /api/admin/auth              (OAuth init)
 *   /api/admin/callback          (OAuth callback)
 *
 * Auth check: HMAC-signed cookie set by /api/admin/callback, verified via
 * lib/auth/session. If missing/invalid, we redirect HTML requests to /admin/
 * (where Sveltia will trigger the OAuth flow → callback re-issues the
 * cookie) or return JSON 401 for API requests.
 */

import { type NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// These paths are gated. Everything else (including Sveltia's /admin/) is open.
const GATED_PATHS = [
  /^\/admin\/moderate(\/|$)/,
  /^\/admin\/inquiries(\/|$)/,
  /^\/admin\/blocklists(\/|$)/,
  /^\/api\/admin\/comments(\/|$)/,
  /^\/api\/admin\/blocklists(\/|$)/,
  /^\/api\/admin\/inquiries(\/|$)/,
];

function isGated(pathname: string): boolean {
  return GATED_PATHS.some((rx) => rx.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isGated(pathname)) return NextResponse.next();

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(cookie);

  if (session) return NextResponse.next();

  // For API requests, return JSON 401.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 },
    );
  }

  // For HTML requests, send them through Sveltia's auth flow which will
  // call /api/admin/auth → callback → set the session cookie → and we'll
  // bring them back to where they wanted to go.
  const url = req.nextUrl.clone();
  url.pathname = "/admin/";
  url.search = `?return=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/moderate/:path*",
    "/admin/inquiries/:path*",
    "/admin/blocklists/:path*",
    "/api/admin/comments/:path*",
    "/api/admin/blocklists/:path*",
    "/api/admin/inquiries/:path*",
  ],
};
