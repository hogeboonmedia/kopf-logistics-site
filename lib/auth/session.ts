/**
 * Lightweight signed session cookies for /admin/moderate, /admin/inquiries,
 * and /admin/blocklists.
 *
 * After OAuth completes, /api/admin/callback fetches the GitHub user's
 * profile (login + ID), and if their login is in ADMIN_GITHUB_LOGINS, sets
 * a session cookie containing { login, id, exp }, signed with HMAC-SHA-256
 * using the KOPF_SESSION_SECRET env var.
 *
 * Middleware (middleware.ts) verifies this cookie before allowing access to
 * the gated admin pages and APIs.
 *
 * Why a custom session instead of an established library:
 *   - Edge-runtime compatible (Web Crypto only, no Node deps).
 *   - Tiny (≈80 lines) and easy to audit.
 *   - One-purpose: gate ~5 admin routes for one or two trusted users.
 */

const COOKIE_NAME = "kopf_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export interface AdminSession {
  /** GitHub login (e.g. "marissaexample") */
  login: string;
  /** GitHub numeric user id — stable across renames */
  id: number;
  /** Expiry timestamp (ms since epoch) */
  exp: number;
}

function getSecret(): string {
  const s = process.env.KOPF_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "KOPF_SESSION_SECRET must be set to a string of at least 32 characters.",
    );
  }
  return s;
}

function getAllowedLogins(): string[] {
  const raw = process.env.ADMIN_GITHUB_LOGINS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedLogin(login: string): boolean {
  const list = getAllowedLogins();
  if (list.length === 0) return false; // safe default — explicit allowlist required
  return list.includes(login.toLowerCase());
}

// ─────────────────────────────────────────────────
// HMAC-SHA-256 signing using Web Crypto
// ─────────────────────────────────────────────────

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return base64url(new Uint8Array(sig));
}

function base64url(buf: Uint8Array): string {
  let s = "";
  for (const b of buf) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

/**
 * Encode an AdminSession into a `{payload}.{sig}` cookie value.
 * Payload is base64url(JSON), sig is base64url(HMAC-SHA-256(payload, secret)).
 */
export async function signSession(s: AdminSession): Promise<string> {
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify(s)));
  const sig = await hmac(payloadB64);
  return `${payloadB64}.${sig}`;
}

/**
 * Verify and decode a session cookie value. Returns null if invalid or expired.
 */
export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(payloadB64);
  // Constant-time compare
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  let parsed: AdminSession;
  try {
    parsed = JSON.parse(new TextDecoder().decode(fromBase64url(payloadB64)));
  } catch {
    return null;
  }
  if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
  if (typeof parsed.login !== "string" || typeof parsed.id !== "number") return null;
  return parsed;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_TTL_MS_EXPORT = SESSION_TTL_MS;
