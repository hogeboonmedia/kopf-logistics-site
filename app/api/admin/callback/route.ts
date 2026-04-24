/**
 * GitHub OAuth proxy — step 2 (callback / token exchange).
 *
 * GitHub redirects here with `?code=...&state=...` after the user approves.
 * We:
 *   1. Verify the state matches the cookie set in /api/admin/auth.
 *   2. Exchange the code for an access_token via GitHub's token endpoint.
 *   3. Return an HTML page that posts the token back to Sveltia (the opener
 *      window) using the Decap-CMS-compatible message format:
 *
 *        authorization:github:success:{"token":"...","provider":"github"}
 *
 * Sveltia's auth handler listens for that message format and stores the token.
 *
 * Required env vars:
 *   GITHUB_OAUTH_CLIENT_ID
 *   GITHUB_OAUTH_CLIENT_SECRET
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  signSession,
  isAllowedLogin,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS_EXPORT,
} from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");

  if (errorParam) {
    return errorPage(`GitHub denied authorization: ${errorParam}`);
  }
  if (!code || !state) {
    return errorPage("Missing code or state parameter from GitHub.");
  }

  const storedState = req.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return errorPage("State mismatch — possible CSRF attempt. Try again.");
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return errorPage(
      "OAuth not configured on the server — missing client ID or secret env var.",
    );
  }

  // Exchange the code for an access_token.
  let tokenJson: { access_token?: string; error?: string; error_description?: string };
  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );
    tokenJson = await tokenRes.json();
  } catch (err) {
    return errorPage(`Token exchange network error: ${(err as Error).message}`);
  }

  if (!tokenJson.access_token) {
    return errorPage(
      tokenJson.error_description || tokenJson.error || "Token exchange failed.",
    );
  }

  // Fetch the user's GitHub identity so we can set an admin session cookie
  // for the *separate* admin pages (/admin/moderate, /admin/inquiries,
  // /admin/blocklists). Sveltia keeps its own copy of the access_token in
  // localStorage; we never store the GitHub token server-side.
  let ghUser: { login?: string; id?: number } = {};
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "kopf-logistics-site",
        Accept: "application/vnd.github+json",
      },
    });
    ghUser = await userRes.json();
  } catch {
    // Non-fatal — Sveltia still works without the admin cookie. Marissa just
    // won't have access to /admin/moderate etc. until she retries auth.
  }

  return await successPage(tokenJson.access_token, ghUser);
}

/** HTML page that posts the token back to Sveltia and closes the popup.
 * Also sets a separate signed session cookie if the GitHub user is in the
 * admin allowlist (so /admin/moderate, /admin/inquiries, /admin/blocklists
 * can identify Marissa without her re-authenticating). */
async function successPage(
  token: string,
  ghUser: { login?: string; id?: number },
) {
  const payload = JSON.stringify({ token, provider: "github" });
  const message = `authorization:github:success:${payload}`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorizing…</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; padding: 2rem; color: #1a130c; }
  </style>
</head>
<body>
  <p>Authorizing… you can close this window.</p>
  <script>
    (function () {
      var msg = ${JSON.stringify(message)};
      function send() {
        if (!window.opener) {
          document.body.innerText = "No opener window detected — close this tab and try again.";
          return;
        }
        window.opener.postMessage(msg, "*");
        setTimeout(function () {
          window.opener.postMessage(msg, "*");
          window.close();
        }, 100);
      }
      send();
    })();
  </script>
</body>
</html>`;
  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  response.cookies.delete("oauth_state");

  // Set the admin session cookie if this user is on the allowlist.
  if (ghUser.login && typeof ghUser.id === "number" && isAllowedLogin(ghUser.login)) {
    try {
      const exp = Date.now() + SESSION_TTL_MS_EXPORT;
      const cookieValue = await signSession({
        login: ghUser.login,
        id: ghUser.id,
        exp,
      });
      response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: Math.floor(SESSION_TTL_MS_EXPORT / 1000),
        path: "/",
      });
    } catch {
      // KOPF_SESSION_SECRET not configured — admin pages will be inaccessible
      // until it is, but Sveltia editing still works since it only needs the
      // GitHub token in postMessage.
    }
  }

  return response;
}

/** HTML page that posts an error back to Sveltia. */
function errorPage(reason: string) {
  const message = `authorization:github:error:${JSON.stringify({ message: reason })}`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorization failed</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; padding: 2rem; color: #1a130c; }
    pre { background: #f2eade; padding: 1rem; }
  </style>
</head>
<body>
  <h1>Authorization failed</h1>
  <pre>${escapeHtml(reason)}</pre>
  <script>
    (function () {
      var msg = ${JSON.stringify(message)};
      if (window.opener) {
        window.opener.postMessage(msg, "*");
        setTimeout(function () { window.close(); }, 800);
      }
    })();
  </script>
</body>
</html>`;
  return new NextResponse(html, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
