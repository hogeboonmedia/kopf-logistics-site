/**
 * CleanTalk Anti-Spam Cloud API wrapper.
 *
 * Used by both the contact form (lib/api/contact) and the comment submission
 * endpoint (lib/api/comments). Same product Kopf already pays for through their
 * WordPress site — we just talk to the Cloud API directly instead of through
 * the WP plugin.
 *
 * Docs: https://cleantalk.org/help/api-spam-check
 *
 * Env: CLEANTALK_AUTH_KEY (from the CleanTalk dashboard)
 */

const ENDPOINT = "https://moderate.cleantalk.org/api2.0";

export interface CleanTalkRequest {
  /** The user-submitted text being checked (comment body, contact message, etc.). */
  message: string;
  sender_email: string;
  sender_nickname: string;
  /** Client IP — required for accurate scoring. */
  sender_ip?: string;
  /** Seconds the user spent on the page before submitting. Catches insta-bots. */
  submit_time?: number;
  /** 1 = JS was running on the page (proves browser-class client). */
  js_on?: 0 | 1;
  /** Site identifier sent to CleanTalk for analytics. */
  agent?: string;
}

export interface CleanTalkVerdict {
  /** "allow" | "block" | "manual" | "error" */
  verdict: "allow" | "block" | "manual" | "error";
  /** Free-text reason from CleanTalk (or local error message). */
  reason: string;
  /** Raw `allow` field from the API response (1 = ok, 0 = blocked). */
  allow: 0 | 1;
  /** Stop-words that triggered (if any). */
  stopWords?: string;
}

/**
 * Check a submission against CleanTalk. Returns "allow" if CleanTalk OK'd it,
 * "block" if it was flagged as spam, "manual" if CleanTalk wants human review,
 * or "error" if the API was unreachable / misconfigured (caller should treat
 * as "send to moderation queue", not auto-publish).
 *
 * Times out at 5s — we'd rather queue a comment for moderation than block the
 * UI on a slow CleanTalk response.
 */
export async function checkSpam(input: CleanTalkRequest): Promise<CleanTalkVerdict> {
  const authKey = process.env.CLEANTALK_AUTH_KEY;
  if (!authKey) {
    return {
      verdict: "error",
      reason: "CLEANTALK_AUTH_KEY not configured",
      allow: 0,
    };
  }

  const body = {
    method_name: "check_message",
    auth_key: authKey,
    message: input.message,
    sender_email: input.sender_email,
    sender_nickname: input.sender_nickname,
    sender_ip: input.sender_ip ?? "",
    agent: input.agent ?? "kopf-logistics-1.0",
    js_on: input.js_on ?? 1,
    submit_time: input.submit_time ?? 5,
  };

  let json: {
    allow?: 0 | 1;
    comment?: string;
    errno?: number;
    stop_words?: string;
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        verdict: "error",
        reason: `CleanTalk HTTP ${res.status}`,
        allow: 0,
      };
    }

    json = await res.json();
  } catch (err) {
    return {
      verdict: "error",
      reason: `CleanTalk network error: ${(err as Error).message}`,
      allow: 0,
    };
  }

  if (json.errno && json.errno !== 0) {
    // API returned a non-zero error code — treat as "manual review".
    return {
      verdict: "manual",
      reason: json.comment ?? `errno=${json.errno}`,
      allow: 0,
      stopWords: json.stop_words,
    };
  }

  if (json.allow === 1) {
    return {
      verdict: "allow",
      reason: json.comment ?? "ok",
      allow: 1,
    };
  }

  return {
    verdict: "block",
    reason: json.comment ?? "flagged as spam",
    allow: 0,
    stopWords: json.stop_words,
  };
}
