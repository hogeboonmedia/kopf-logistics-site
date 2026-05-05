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

const SYSTEM_PROMPT = `You are the website assistant for Kopf Logistics Group, a family-owned freight brokerage founded in 1966 in Elkhart, Indiana.

Your job: answer visitor questions accurately using ONLY the knowledge base below. Be concise — typically 1-3 sentences, never more than 4.

CRITICAL RULES:
- Use ONLY facts from the knowledge base. Never invent rates, transit times, lane availability, equipment specs, hiring criteria, or any other detail not explicitly stated.
- If a question is outside the knowledge base, say so honestly in one sentence and route the visitor to call dispatch at 574.349.5600 (24/7) or use the contact form at /contact.
- Never quote prices or commit to anything that needs human judgment — always defer to dispatch.
- Format responses as simple HTML: <strong>bold</strong>, <a href="/path">links</a>, <br> for line breaks. Never use markdown (no **bold** or [link](url)) — it will render literally.
- Tone: professional but personable, like a helpful office manager — not a corporate AI. Family business, not a faceless mega-broker.
- If the visitor seems ready to take action (ship freight, apply as a driver/agent, become a customer), end your reply with a clear next step (link or phone number) and consider mentioning that they can have a person follow up.

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
    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as unknown as { type: "text"; text: string }).text)
      .join("\n")
      .trim();

    if (!reply) {
      return json({ ok: false, error: "Empty reply" }, 502);
    }

    return json({ ok: true, reply });
  } catch (err) {
    console.error("[/api/chat] LLM call failed:", err);
    return json({ ok: false, error: "LLM error" }, 502);
  }
}
