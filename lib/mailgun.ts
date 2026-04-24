/**
 * Mailgun send helper.
 *
 * Kopf already has a Mailgun account with kopflogisticsgroup.com verified,
 * so we can send branded mail (noreply@kopflogisticsgroup.com) with no
 * extra DNS setup. 50K emails/month on their plan — way more than any
 * realistic contact form volume.
 *
 * Docs: https://documentation.mailgun.com/docs/mailgun/api-reference/
 *
 * Env vars:
 *   MAILGUN_API_KEY      — private API key from Mailgun dashboard
 *   MAILGUN_DOMAIN       — sending domain (e.g. mg.kopflogisticsgroup.com or kopflogisticsgroup.com)
 *   MAILGUN_REGION       — optional, "us" (default) or "eu"
 *   MAILGUN_FROM_ADDRESS — optional, default: "Kopf Website <noreply@${MAILGUN_DOMAIN}>"
 */

export interface MailgunSendInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface MailgunSendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: MailgunSendInput): Promise<MailgunSendResult> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const region = (process.env.MAILGUN_REGION ?? "us").toLowerCase();
  const from =
    process.env.MAILGUN_FROM_ADDRESS ||
    `Kopf Website <noreply@${domain ?? "kopflogisticsgroup.com"}>`;

  if (!apiKey || !domain) {
    return {
      ok: false,
      error: "Mailgun not configured (MAILGUN_API_KEY or MAILGUN_DOMAIN missing).",
    };
  }

  const host = region === "eu" ? "api.eu.mailgun.net" : "api.mailgun.net";
  const url = `https://${host}/v3/${domain}/messages`;

  // Mailgun accepts application/x-www-form-urlencoded
  const body = new URLSearchParams();
  body.set("from", from);
  body.set("to", input.to);
  body.set("subject", input.subject);
  body.set("text", input.text);
  body.set("html", input.html);
  if (input.replyTo) body.set("h:Reply-To", input.replyTo);

  // HTTP Basic auth: username = "api", password = API key
  const auth = "Basic " + Buffer.from(`api:${apiKey}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: auth },
      body,
    });
    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
    };
    if (!res.ok) {
      return {
        ok: false,
        error: json.message || `Mailgun HTTP ${res.status}`,
      };
    }
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: `Mailgun network error: ${(err as Error).message}` };
  }
}
