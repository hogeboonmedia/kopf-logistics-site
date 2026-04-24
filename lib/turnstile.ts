/**
 * Cloudflare Turnstile server-side token verification.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileResult {
  success: boolean;
  reason?: string;
  /** Raw error codes from Cloudflare. */
  errorCodes?: string[];
}

export async function verifyTurnstile(
  token: string,
  remoteip?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, reason: "TURNSTILE_SECRET_KEY not configured" };
  }
  if (!token) {
    return { success: false, reason: "Missing token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const json = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };
    if (json.success) return { success: true };
    return {
      success: false,
      reason: json["error-codes"]?.join(", ") || "verification failed",
      errorCodes: json["error-codes"],
    };
  } catch (err) {
    return { success: false, reason: `network: ${(err as Error).message}` };
  }
}
