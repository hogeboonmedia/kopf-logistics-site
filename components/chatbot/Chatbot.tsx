"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { kopfChatConfig } from "@/lib/chatbot/kopf-config";
import { findIntent, isFrustrated } from "@/lib/chatbot/matcher";
import {
  createResponderState,
  getResponse,
  getSuggestions,
  incrementFail,
  type ResponderState,
} from "@/lib/chatbot/responder";
import type { ChatIntent, FlowStep } from "@/lib/chatbot/types";
import ChatLeadForm from "./ChatLeadForm";

/**
 * Kopf chatbot — natural-conversation edition.
 *
 * Three answer paths, in order:
 *   1. **Pattern match → flow** — high-intent intents (shippers, drivers,
 *      agents, carriers, contact, tracking) trigger a structured 2-3
 *      question flow that pre-qualifies the lead before the form appears.
 *   2. **Pattern match → reply** — informational intents (services, about,
 *      location, blog, etc.) just answer + ask a follow-up question.
 *   3. **LLM fallback** — no match → POST /api/chat → Claude generates a
 *      KB-grounded reply.
 *
 * UX details that matter for "feeling human":
 *   - **Multi-bubble**: bot replies split on `<br><br>` are rendered as
 *     SEPARATE bubbles with typing-pauses between them, mimicking how a
 *     person texts.
 *   - **Cancellable lead form**: scheduled after a high-intent reply with
 *     a generous delay. If the visitor sends another message before it
 *     fires, we cancel and reschedule after the next bot turn. Form only
 *     appears when the conversation actually pauses (or after 3 turns).
 *   - **Every reply ends with a question or CTA** — enforced in the
 *     config copy + LLM system prompt.
 *   - **Persona flows**: role-chip click or pattern hit on a high-intent
 *     intent kicks off a stateful flow. Each step asks one question with
 *     optional quick-reply chips. Answers go to lead form's extra_fields.
 */

type Role = "user" | "bot";

interface TextMessage {
  id: number;
  kind: "text";
  role: Role;
  content: string;
}

interface LeadFormMessage {
  id: number;
  kind: "lead";
  topic: string;
  lastUserMessage: string;
  conversationExcerpt: string;
  prefilledExtras: Record<string, string>;
}

type Message = TextMessage | LeadFormMessage;

interface FlowState {
  intent: ChatIntent;
  stepIndex: number;
  answers: Record<string, string>;
  /** Last user message text — passed to lead form as `last_user_message`. */
  triggerMessage: string;
}

// --- Pacing constants (research-tuned for human feel) ----------------------
const TYPING_BASE_MS = 1100; // floor — even short replies wait this long
const TYPING_PER_CHAR_MS = 18; // additional ms per character
const TYPING_MAX_MS = 3500; // cap so long replies don't feel stuck
const TYPING_JITTER_MS = 300; // randomness so cadence isn't robotic
const MULTIBUBBLE_GAP_MS = 1100; // pause BETWEEN consecutive bubbles
const LEAD_FORM_DELAY_MS = 4500; // generous so the visitor can ask another Q
const MAX_FLOW_TURNS_BEFORE_FORM = 3; // safety net if flow somehow stalls
const MAX_HISTORY_TURNS_FOR_LLM = 6;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function typingDelay(text: string, reduced: boolean): number {
  if (reduced) return 100;
  const visibleLen = text.replace(/<[^>]*>/g, "").length;
  const computed =
    TYPING_BASE_MS + visibleLen * TYPING_PER_CHAR_MS + Math.random() * TYPING_JITTER_MS;
  return Math.min(computed, TYPING_MAX_MS);
}

/** Split bot HTML on `<br><br>` so we can render each chunk as its own bubble. */
function splitBubbles(html: string): string[] {
  return html
    .split(/<br\s*\/?>\s*<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function Chatbot() {
  const config = kopfChatConfig;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  // Lead-capture is one-shot per session. Set to true the moment a form
  // is APPENDED (not scheduled), so we don't double-render.
  const leadShownRef = useRef(false);
  // Pending lead-form timer — cancelled if the visitor sends a new message
  // before it fires. Lets us reschedule and let the conversation breathe.
  const leadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // How many bot turns have happened in the current high-intent flow.
  // After MAX_FLOW_TURNS_BEFORE_FORM, force the form even if conversation
  // is still going (safety net for runaway flows).
  const flowTurnCountRef = useRef(0);

  // Active persona flow state. Null when not in a flow (free chat).
  const flowRef = useRef<FlowState | null>(null);

  const responderRef = useRef<ResponderState>(createResponderState());
  const llmHistoryRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const idCounterRef = useRef(0);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  function nextId() {
    idCounterRef.current += 1;
    return idCounterRef.current;
  }

  function appendText(role: Role, content: string) {
    setMessages((prev) => [...prev, { id: nextId(), kind: "text", role, content }]);
    if (role === "bot") {
      pushHistory("assistant", stripHtml(content));
    } else if (role === "user") {
      pushHistory("user", content);
    }
  }

  function appendLeadForm(
    topic: string,
    lastUserMessage: string,
    prefilledExtras: Record<string, string>,
  ) {
    if (leadShownRef.current) return;
    leadShownRef.current = true;
    const excerpt = serializeRecentExcerpt(messages, 4);
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        kind: "lead",
        topic,
        lastUserMessage,
        conversationExcerpt: excerpt,
        prefilledExtras,
      },
    ]);
  }

  function pushHistory(role: "user" | "assistant", content: string) {
    const arr = llmHistoryRef.current;
    arr.push({ role, content });
    const max = MAX_HISTORY_TURNS_FOR_LLM * 2;
    if (arr.length > max) arr.splice(0, arr.length - max);
  }

  /** Cancel any pending lead-form timer (called when visitor sends a new msg). */
  function cancelPendingLeadForm() {
    if (leadTimerRef.current) {
      clearTimeout(leadTimerRef.current);
      leadTimerRef.current = null;
    }
  }

  /**
   * Schedule the lead-capture form to appear after the current bot turn.
   * Cancellable — if the visitor sends another message before it fires,
   * we'll reschedule after the next bot reply. Stays one-shot via leadShownRef.
   */
  function scheduleLeadForm(
    topic: string,
    lastUserMessage: string,
    prefilledExtras: Record<string, string>,
  ) {
    if (leadShownRef.current) return;
    cancelPendingLeadForm();
    leadTimerRef.current = setTimeout(() => {
      leadTimerRef.current = null;
      appendLeadForm(topic, lastUserMessage, prefilledExtras);
    }, LEAD_FORM_DELAY_MS);
  }

  /**
   * Render a possibly-multi-bubble bot reply with typing-paced delivery.
   * Each `<br><br>`-separated chunk becomes its own bubble. Returns a
   * promise that resolves when ALL bubbles have rendered, so callers can
   * sequence what comes next (e.g., schedule lead form after the LAST bubble).
   */
  function deliverBotReply(html: string): Promise<void> {
    const chunks = splitBubbles(html);
    return chunks.reduce<Promise<void>>(
      (chain, chunk, i) =>
        chain.then(
          () =>
            new Promise<void>((resolve) => {
              setTyping(true);
              const delay = i === 0 ? typingDelay(chunk, reducedMotion) : MULTIBUBBLE_GAP_MS + Math.random() * 200;
              setTimeout(() => {
                setTyping(false);
                appendText("bot", chunk);
                resolve();
              }, delay);
            }),
        ),
      Promise.resolve(),
    );
  }

  // ── Persona flow handling ──────────────────────────────────────────────

  /** Start a new persona flow for this intent. Asks step 0's question. */
  async function startFlow(intent: ChatIntent, triggerMessage: string) {
    if (!intent.flow || intent.flow.length === 0) return;
    flowRef.current = {
      intent,
      stepIndex: 0,
      answers: {},
      triggerMessage,
    };
    flowTurnCountRef.current = 0;
    setSuggestions([]);
    await deliverBotReply(intent.flow[0].question);
    const chips = intent.flow[0].chips;
    if (chips && chips.length) setSuggestions(chips);
  }

  /**
   * The visitor just answered the current flow step. Record the answer,
   * advance, ask the next question — or finish the flow and trigger lead form.
   */
  async function advanceFlow(answer: string) {
    const flow = flowRef.current;
    if (!flow || !flow.intent.flow) return;

    // Record the current step's answer
    const currentStep = flow.intent.flow[flow.stepIndex];
    flow.answers[currentStep.field] = answer;

    const nextIndex = flow.stepIndex + 1;

    if (nextIndex >= flow.intent.flow.length) {
      // Flow complete — say a thanks line + show lead form
      flowRef.current = null;
      setSuggestions([]);
      await deliverBotReply(
        "Got it — that's everything I need on this side.<br><br>Drop your contact info and I'll route this to dispatch.",
      );
      // Show the form immediately (don't wait LEAD_FORM_DELAY_MS — the
      // visitor just answered 3 questions, they're warm)
      window.setTimeout(() => {
        appendLeadForm(flow.intent.id, flow.triggerMessage, flow.answers);
      }, 600);
      return;
    }

    // Advance to next step
    flow.stepIndex = nextIndex;
    setSuggestions([]);
    await deliverBotReply(flow.intent.flow[nextIndex].question);
    const chips = flow.intent.flow[nextIndex].chips;
    if (chips && chips.length) setSuggestions(chips);
  }

  // ── Welcome / lifecycle ────────────────────────────────────────────────

  // Open: greet + render role-routing chips on first open
  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);

    (async () => {
      const greeting = pickRandom(config.behavior.greetings);
      await deliverBotReply(greeting);
      const defaults = config.behavior.defaultSuggestions;
      if (defaults.length > 0) setSuggestions(pickRandom(defaults));

      if (config.behavior.privacyNotice) {
        const notice = `<em style="font-size:12px;opacity:0.7">${config.behavior.privacyNotice}</em>`;
        window.setTimeout(() => appendText("bot", notice), 700);
      }

      window.setTimeout(() => inputRef.current?.focus(), 280);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, welcomed]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Cleanup pending timer on unmount
  useEffect(() => () => cancelPendingLeadForm(), []);

  // ── Send handler ───────────────────────────────────────────────────────

  async function handleSend(textRaw: string) {
    const text = textRaw.trim();
    if (!text || typing) return;

    // Cancel any pending lead-form timer — we'll reschedule if the new
    // message keeps us in a high-intent flow.
    cancelPendingLeadForm();

    appendText("user", text);
    setDraft("");
    setSuggestions([]);

    // ── In an active flow? Treat the message as the answer to the current step.
    if (flowRef.current) {
      flowTurnCountRef.current += 1;
      // Safety net — if the flow somehow runs more than 2x its expected
      // length, force the form so we don't trap the visitor.
      if (flowTurnCountRef.current > MAX_FLOW_TURNS_BEFORE_FORM * 2) {
        const flow = flowRef.current;
        flowRef.current = null;
        appendLeadForm(flow.intent.id, flow.triggerMessage, { ...flow.answers, last_answer: text });
        return;
      }
      await advanceFlow(text);
      return;
    }

    // Frustration short-circuits to the live-human handoff. No lead form
    // here — clearly annoyed visitor; just give them the phone number.
    if (isFrustrated(text)) {
      await deliverBotReply(config.behavior.frustrationResponse);
      setSuggestions(config.behavior.frustrationSuggestions);
      return;
    }

    // 1. Pattern matching — fast path
    const intent = findIntent(text, config.intents);

    if (intent) {
      // High-intent intent with a defined flow → start the flow
      if (intent.flow && intent.flow.length > 0 && !leadShownRef.current) {
        await startFlow(intent, text);
        return;
      }

      // Otherwise just deliver the rotating response variant
      const reply = getResponse(intent, responderRef.current);
      await deliverBotReply(reply);
      const newSuggestions = getSuggestions(intent, responderRef.current);
      if (newSuggestions.length) setSuggestions(newSuggestions);

      // High-intent intent without flow (or after flow already shown) —
      // schedule cancellable lead form
      if (intent.leadCapture && !leadShownRef.current) {
        scheduleLeadForm(intent.id, text, {});
      }
      return;
    }

    // 2. LLM fallback — call /api/chat for grounded response
    setTyping(true);
    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: llmHistoryRef.current.slice(0, -1),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };

      if (res.ok && json.ok && json.reply) {
        responderRef.current.failCount = 0;
        setTyping(false);
        await deliverBotReply(json.reply);
        setSuggestions(pickRandom(config.behavior.defaultSuggestions));
        return;
      }

      if (res.status === 429 && json.error) {
        setTyping(false);
        await deliverBotReply(json.error);
        setSuggestions(config.behavior.frustrationSuggestions);
        return;
      }
      throw new Error(json.error || `LLM HTTP ${res.status}`);
    } catch {
      const failCount = incrementFail(responderRef.current);
      const reply =
        failCount >= 3
          ? config.behavior.frustrationResponse
          : pickRandom(config.behavior.fallbackMessages);
      const fallbackSuggestions =
        failCount >= 3
          ? config.behavior.frustrationSuggestions
          : pickRandom(config.behavior.defaultSuggestions);

      setTyping(false);
      await deliverBotReply(reply);
      setSuggestions(fallbackSuggestions);
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSend(draft);
  }

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(draft);
    }
  }

  return (
    <>
      {/* FAB — bottom-RIGHT. Back-to-top button stacks above this. */}
      <button
        type="button"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 grid place-items-center w-14 h-14 rounded-full transition-transform duration-200"
        style={{
          background: "var(--accent)",
          color: "var(--on-accent)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.28)",
          transform: open ? "scale(0.92)" : "scale(1)",
        }}
      >
        {open ? (
          <X className="w-6 h-6" strokeWidth={2.4} />
        ) : (
          <MessageCircle className="w-6 h-6" strokeWidth={2.2} />
        )}
      </button>

      <div
        role="dialog"
        aria-label="Kopf Logistics chat assistant"
        aria-hidden={!open}
        className="fixed right-6 z-40 flex flex-col overflow-hidden transition-all duration-200"
        style={{
          bottom: "calc(1.5rem + 56px + 12px)",
          width: "min(380px, calc(100vw - 3rem))",
          maxHeight: "min(620px, calc(100vh - 8rem))",
          background: "var(--card)",
          border: "1px solid var(--hairline-strong)",
          borderRadius: "8px",
          boxShadow: "0 18px 48px rgba(0, 0, 0, 0.32)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0)" : "translateY(8px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            background: "var(--accent-2)",
            color: "rgba(245, 239, 230, 0.95)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div
            className="grid place-items-center w-9 h-9 rounded-full font-[var(--font-anton)]"
            style={{
              background: "var(--accent)",
              color: "var(--on-accent)",
              fontSize: "16px",
              letterSpacing: "0.02em",
            }}
            aria-hidden="true"
          >
            K
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-[var(--font-anton)] uppercase tracking-[0.04em] text-base leading-tight truncate"
              style={{ color: "rgba(245, 239, 230, 0.95)" }}
            >
              {config.company.name}
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] truncate"
              style={{ color: "rgba(245, 239, 230, 0.7)" }}
            >
              {config.company.tagline}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
            className="grid place-items-center w-8 h-8 rounded-full transition-colors"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "rgba(245, 239, 230, 0.9)",
            }}
          >
            <X className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{ background: "var(--bg-elevated)" }}
        >
          {messages.map((m) => {
            if (m.kind === "lead") {
              return (
                <ChatLeadForm
                  key={m.id}
                  topic={m.topic}
                  lastUserMessage={m.lastUserMessage}
                  conversationExcerpt={m.conversationExcerpt}
                  prefilledExtras={m.prefilledExtras}
                  onSubmitted={() => {}}
                  onDismissed={() => {}}
                />
              );
            }
            return <MessageBubble key={m.id} role={m.role} content={m.content} />;
          })}
          {typing && <TypingBubble />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && !typing && (
          <div
            className="px-4 py-3 flex flex-wrap gap-2"
            style={{
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-[var(--font-jetbrains)] transition-colors rounded-full"
                style={{
                  background: "transparent",
                  color: "var(--accent-2)",
                  border: "1px solid var(--accent-2)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 px-4 py-3"
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--hairline-strong)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Ask about shipping, driving, or agents…"
            aria-label="Type your message"
            className="flex-1 px-3 py-2 text-sm transition-colors"
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--hairline-strong)",
              outline: "none",
              borderRadius: "4px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-2)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--hairline-strong)";
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || typing}
            aria-label="Send message"
            className="grid place-items-center w-10 h-10 transition-opacity rounded"
            style={{
              background: "var(--accent)",
              color: "var(--on-accent)",
              opacity: !draft.trim() || typing ? 0.45 : 1,
            }}
          >
            <Send className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </form>

        {config.company.poweredBy && (
          <div
            className="px-4 py-2 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] text-center"
            style={{
              background: "var(--card)",
              color: "var(--text-muted)",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            Powered by <strong style={{ color: "var(--text)" }}>{config.company.poweredBy}</strong>
          </div>
        )}
      </div>
    </>
  );
}

function MessageBubble({ role, content }: { role: Role; content: string }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed"
          style={{
            background: "var(--accent-2)",
            color: "rgba(245, 239, 230, 0.96)",
            borderRadius: "16px 16px 4px 16px",
          }}
        >
          {content}
        </div>
      </div>
    );
  }
  // Auto-link phone numbers and emails so they're tap-to-call / tap-to-email
  // on mobile. Bot content is from a STATIC config or LLM output sanitized
  // server-side, so dangerouslySetInnerHTML stays safe.
  const linkedContent = autolinkContactInfo(content);
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[88%] px-4 py-2.5 text-sm leading-relaxed kopf-chat-bubble"
        style={{
          background: "var(--card)",
          color: "var(--text)",
          border: "1px solid var(--hairline)",
          borderRadius: "16px 16px 16px 4px",
        }}
        dangerouslySetInnerHTML={{ __html: linkedContent }}
      />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="px-4 py-3 inline-flex items-center gap-1"
        style={{
          background: "var(--card)",
          border: "1px solid var(--hairline)",
          borderRadius: "16px 16px 16px 4px",
        }}
        aria-label="Assistant is typing"
      >
        <span className="kopf-chat-typing-dot" style={{ background: "var(--text-muted)" }} />
        <span className="kopf-chat-typing-dot" style={{ background: "var(--text-muted)" }} />
        <span className="kopf-chat-typing-dot" style={{ background: "var(--text-muted)" }} />
      </div>
    </div>
  );
}

/** Strip HTML tags for the LLM history (Claude doesn't need our markup). */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Auto-link bare phone numbers and email addresses in bot HTML so they
 * become clickable tel:/mailto: anchors. Walks text NODES only — any
 * existing <a>, <strong>, etc. structure is preserved (we don't double-
 * wrap content already inside an anchor).
 *
 * Rules:
 *  - Phone: match formats like 574.349.5600, 574-349-5600, (574) 349-5600
 *           → <a href="tel:5743495600">…</a>
 *  - Email: simple @-pattern → <a href="mailto:foo@bar.com">…</a>
 *
 * Idempotent for already-linked content because we skip nodes inside <a>.
 */
const PHONE_RE = /\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}\b/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

function autolinkContactInfo(html: string): string {
  // Cheap-but-effective: only autolink BARE phone/email occurrences NOT
  // already inside an <a> tag. We use a placeholder strategy — temporarily
  // replace existing <a>...</a> spans so the regex can't match inside them.
  const anchors: string[] = [];
  let withPlaceholders = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (m) => {
    anchors.push(m);
    return `A${anchors.length - 1}`;
  });

  withPlaceholders = withPlaceholders
    .replace(EMAIL_RE, (m) => `<a href="mailto:${m}">${m}</a>`)
    .replace(PHONE_RE, (m) => {
      const digits = m.replace(/\D/g, "");
      return `<a href="tel:${digits}">${m}</a>`;
    });

  // Restore the original anchors
  return withPlaceholders.replace(/A(\d+)/g, (_m, i) => anchors[Number(i)]);
}

/** Serialize the last N text turns as plain "User:" / "Bot:" lines for the lead email. */
function serializeRecentExcerpt(msgs: Message[], turns: number): string {
  const textTurns = msgs.filter((m): m is TextMessage => m.kind === "text");
  const tail = textTurns.slice(-turns * 2);
  return tail
    .map((m) => `${m.role === "user" ? "Visitor" : "Bot"}: ${stripHtml(m.content)}`)
    .join("\n");
}

// Type re-exports for child components that need them
export type { ChatIntent, FlowStep };
