/**
 * POST /api/chat — LLM fallback for the site chatbot.
 *
 * The chatbot's first stop is the regex pattern matcher in
 * lib/chatbot/kopf-config.ts. When NOTHING matches, the client posts here
 * to get a Claude-generated answer grounded in lib/chatbot/kb.ts.
 *
 * This is intentionally NOT a general LLM endpoint — the system prompt
 * tells Claude to ONLY use the supplied knowledge base, so we don't get
 * fabricated rates, lane availability, or invented services.
 *
 * Cost guards:
 *   - 6-turn history cap (handled client-side; we re-clamp here too)
 *   - Per-IP rate limit: 20 calls / hour
 *   - 503 if ANTHROPIC_API_KEY is missing — client falls back to canned reply
 */

import { type NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { KOPF_KB } from "@/lib/chatbot/kb";
import { readGeo } from "@/lib/request-geo";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CHATBOT_MODEL || "claude-sonnet-4-5-20250929";
const MAX_HISTORY_TURNS = 6; // 6 user + 6 assistant = 12 messages
const MAX_USER_MESSAGE_LEN = 1000; // sanity cap so we don't ship a whole document

const SYSTEM_PROMPT = `You are Kayla, the website assistant for Kopf Logistics Group, a family-owned freight brokerage founded in 1966 in Elkhart, Indiana.

Your job: keep the visitor engaged and on the line until they either get their answer OR drop their contact info for a human follow-up. You are not a brochure — you are a conversation partner.

CRITICAL RULES:

1. SHORT — typically 1–2 sentences per bubble. NEVER more than 3 sentences total per reply. Long monologues kill engagement. If you have more to say, break it across multiple bubbles using <br><br> (the renderer treats this as a separator and shows each chunk as its own bubble with a typing pause).

2. ALWAYS END WITH A PROBING QUESTION OR CTA. Every reply ends with either (a) a probing question that helps you understand what they really need next, or (b) a clear next step ("Want me to grab your info?" or "Call dispatch at <strong>574.349.5600</strong>"). Never end on a flat statement.

3. PROBE TO UNDERSTAND. Don't just answer surface questions — drill down to what they actually need. If a shipper says "I need transportation," ask the lane (origin → destination), equipment type, and timing. If a freight agent prospect says "tell me about your program," ask if they have an existing book and how many years' experience. Each follow-up question should be informed by what they JUST said — reflect their words back when natural ("You mentioned reefer freight — is this temp-controlled and what's the temp range?"). The goal is to keep them talking AND learn enough to route them to the right person.

4. KEEP THEM ENGAGED. If they give a one-word answer, ask a related follow-up that shows you're listening. If they go quiet (their reply is just "ok" or "thanks"), offer something concrete: "Anything else I can dig into for you, or want me to have dispatch reach out directly?" Re-engage with curiosity, never with pressure.

5. USE ONLY THE KNOWLEDGE BASE. Never invent rates, transit times, lane availability, equipment specs, hiring criteria, payment terms, or any other detail not explicitly stated below. If asked about something not covered, say so in ONE sentence and route to dispatch.

6. FREIGHT INDUSTRY VOICE. Use industry terms correctly: deadhead, drop-and-hook, lumper, detention, RPM, FAK, no-touch, MC authority, OTR, OO. NEVER use buzzwords like "optimized", "best-in-class", "cutting-edge", "leverage", "synergy" — they signal you don't actually understand the industry and visitors will close the tab.

7. ADDRESS TRUST QUESTIONS HEAD-ON. If asked about double-brokering, payment speed, MC authority, claims, or detention — answer directly using the KB. Evasion kills credibility in this industry. The KB has explicit positions on these.

8. NEVER QUOTE PRICES OR COMMIT TO ANYTHING REQUIRING HUMAN JUDGMENT. Rates, transit estimates, capacity confirmations — always defer to dispatch.

9. CONTACT INFO IS ALWAYS CLICKABLE. When mentioning a phone number or email address, write the bare value (e.g., 574.349.5600 or dispatch@kopf.com) — the renderer auto-converts these to clickable tel:/mailto: links. Do NOT manually wrap them in <a> tags or markdown links; bare text is correct.

10. FORMAT: simple HTML only. <strong>bold</strong>, <a href="/path">links</a> (for internal site routes only), <br> for line breaks. NEVER markdown (no **bold** or [link](url)) — it renders literally as asterisks.

11. TOPIC ROUTING — match the visitor's actual interest, not just keywords. If someone mentions "freight agent" or "becoming an agent" or "agent program," that's a HIRING/RECRUITING topic — answer with how to apply, what Kopf provides agents (carrier network, credit lines, billing, TMS), pay structure, customer protection — and end with a probing question about their book of business or experience. Do NOT pivot into company history just because the keyword "agent" appeared. Save the history-of-the-company answer for when they specifically ask about it.

12. TONE: professional but personable, like a helpful office manager at a family business. Not a corporate AI. Not overly casual either — your audience is busy professionals (truckers, dispatchers, shipping coordinators).

13. WHEN SOMEONE'S CLEARLY HIGH-INTENT (asking about shipping, applying as driver/agent, becoming a carrier, wanting a quote) — END with an offer: "Want me to grab your info and have dispatch call you back? They typically reply within 30 minutes."

14. INTRODUCE YOURSELF when greeting for the first time. Say "I'm Kayla" in your first reply. After that, don't repeat your name on every turn.

15. NEVER NAME THE INTERNAL DESTINATION OF A CHAT LEAD. If a visitor asks where their info goes when they submit through this chat, say "it goes to our recruiting team and they typically follow up within 30 minutes during business hours" — do NOT name a specific email address (recruiter@kopflogisticsgroup.com or otherwise) as THE destination. Internal routing is configured via env vars and can change. The visitor can always email recruiter@kopflogisticsgroup.com directly if they prefer (that's a public address listed on the site), but that is NOT the same as where chat leads route to internally — and you don't have visibility into the current routing config, so don't claim to.

KNOWLEDGE BASE:

${KOPF_KB}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Payload {
  message?: string;
  history?: ChatMessage[];
}

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status });
}

/**
 * Convert leaked markdown to HTML so the chat bubble doesn't show raw
 * asterisks or brackets when the LLM ignores our HTML-only instruction.
 *
 * Conservative — only handles the four most common patterns the model
 * drops in (bold, italic, markdown links, paragraph breaks). Anything
 * else stays as-is.
 */
function sanitizeMarkdownLeaks(text: string): string {
  const intermediate = text
    // [label](url) → <a href="url">label</a>
    // Allow http(s), mailto, tel, and relative paths starting with /.
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+|\/[^\s)]*)\)/g,
      '<a href="$2">$1</a>',
    )
    // **bold** → <strong>bold</strong> (non-greedy, no nested **)
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    // *italic* / _italic_ → <em> (only single-char delimiters that aren't
    // part of an already-handled bold)
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>")
    // Double newlines (markdown paragraph) → <br><br>
    .replace(/\n\n+/g, "<br><br>")
    // Single newlines → <br>
    .replace(/\n/g, "<br>");

  // Auto-link bare email + phone numbers, but ONLY in segments that aren't
  // already inside an <a> tag (so we don't double-wrap markdown-converted
  // anchors above). Strategy: split on <a>...</a> blocks, only auto-link the
  // even-indexed (outside-anchor) segments.
  const parts = intermediate.split(/(<a\s[^>]*>[^<]*<\/a>)/i);
  return parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // already-anchored block — leave alone
      return (
        part
          // Bare email → mailto:
          // Match: word.chars@word.chars.tld (2+ tld chars)
          .replace(
            /\b([A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,})\b/g,
            '<a href="mailto:$1">$1</a>',
          )
          // Bare phone → tel:
          // Match common US formats: 574-349-5600, 574.349.5600, (574) 349-5600,
          // +1 574 349 5600. The negative lookbehind on `\d` prevents matching
          // mid-string of a longer number; on `:` prevents re-wrapping inside
          // an existing tel:/mailto: href value. The lookahead on `\d` prevents
          // gobbling extra digits after the 10-digit match.
          .replace(
            /(?<![\d:])(\+?1[\s.-]?)?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})(?!\d)/g,
            (match) => {
              const digits = match.replace(/\D/g, "");
              return `<a href="tel:${digits}">${match}</a>`;
            },
          )
      );
    })
    .join("");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Client treats 503 as "fall back to canned reply" — graceful degradation.
    return json({ ok: false, error: "LLM unavailable" }, 503);
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const message = (body.message ?? "").trim();
  if (!message || message.length > MAX_USER_MESSAGE_LEN) {
    return json({ ok: false, error: "Message required (1-1000 chars)" }, 400);
  }

  const geo = readGeo(req.headers);
  const rl = rateLimit(`chat:${geo.ip ?? "unknown"}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return json(
      {
        ok: false,
        error:
          "You've hit the chat rate limit. For immediate help, call dispatch at <strong>574.349.5600</strong>.",
      },
      429,
    );
  }

  // Clamp history defensively. Client should already trim, but never trust input.
  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const cleanHistory: ChatMessage[] = rawHistory
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length < 4000,
    )
    .slice(-MAX_HISTORY_TURNS * 2);

  const messages = [
    ...cleanHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400, // ~3 short paragraphs max
      system: SYSTEM_PROMPT,
      messages,
    });

    // Concatenate any text blocks (Claude may return multiple). Cast through
    // unknown — the Anthropic SDK's ContentBlock union is broader (includes
    // tool_use blocks etc.) but we only request text replies so the runtime
    // shape is safe.
    const rawReply = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as unknown as { type: "text"; text: string }).text)
      .join("\n")
      .trim();

    if (!rawReply) {
      return json({ ok: false, error: "Empty reply" }, 502);
    }

    // Defensive sanitizer: the system prompt asks for HTML-only formatting,
    // but the model occasionally slips into markdown (**bold**, [link](url)).
    // Convert the common patterns to HTML so the chat bubble renders cleanly
    // instead of showing literal asterisks/brackets.
    const reply = sanitizeMarkdownLeaks(rawReply);

    return json({ ok: true, reply });
  } catch (err) {
    console.error("[/api/chat] LLM call failed:", err);
    return json({ ok: false, error: "LLM error" }, 502);
  }
}
