/**
 * GitHub OAuth proxy — step 1 (initiate auth).
 *
 * Sveltia/Decap CMS pops a window pointed at this endpoint when Marissa
 * clicks "Login with GitHub" in the /admin/ editor. We:
 *   1. Mint a CSRF state token, set it as an httpOnly cookie.
 *   2. Redirect the popup to GitHub's OAuth authorize URL.
 *
 * GitHub then sends the user back to /api/admin/callback with `code` + `state`,
 * where we exchange the code for an access_token and post it back to Sveltia
 * via window.opener.postMessage().
 *
 * Required env vars:
 *   GITHUB_OAUTH_CLIENT_ID — the OAuth App's client ID
 *
 * The OAuth App (created at https://github.com/settings/developers) must have:
 *   Homepage URL:        https://kopflogisticsgroup.com
 *   Authorization callback URL: https://kopflogisticsgroup.com/api/admin/callback
 */

import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "OAuth not configured — missing GITHUB_OAUTH_CLIENT_ID env var.",
      { status: 500 },
    );
  }

  // CSRF state token. Verified on callback against the cookie.
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  // `repo` scope = read/write access to repo contents (needed to commit MDX).
  authorizeUrl.searchParams.set("scope", "repo,user:email");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("allow_signup", "false");

  // Optional: Sveltia passes ?provider=github&site_id=... — we don't need them
  // for the redirect, but they're benign. Pass-through scope from query if set.
  const requestedScope = req.nextUrl.searchParams.get("scope");
  if (requestedScope && /^[a-z0-9:,._-]+$/i.test(requestedScope)) {
    authorizeUrl.searchParams.set("scope", requestedScope);
  }

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/api/admin",
  });
  return response;
}
