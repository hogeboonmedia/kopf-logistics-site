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
import ChatLeadForm from "./ChatLeadForm";

/**
 * Kopf chatbot.
 *
 * Floating FAB in the bottom-right (back-to-top button stacks above it).
 * Click → slide-up window with a conversational interface.
 *
 * Three answer paths, in order:
 *   1. **Pattern match** — fast, free, deterministic. ~12 hand-written intents
 *      in lib/chatbot/kopf-config.ts cover navigation + the recruiting funnels.
 *   2. **LLM fallback** — when nothing matches, POST to /api/chat which calls
 *      Claude with the Kopf knowledge base (lib/chatbot/kb.ts) injected as
 *      context. Grounded in real facts, no hallucinated rates or services.
 *   3. **Frustration handoff** — repeated misses or frustration keywords
 *      route the visitor to phone + email.
 *
 * Lead capture: high-intent intents (flagged `leadCapture: true` in config)
 * trigger an inline form after the bot's reply. One-shot per session — once
 * submitted or dismissed, no further prompts. Form posts to /api/contact
 * with source="chatbot" so leads land in /admin/inquiries alongside other forms.
 *
 * Privacy: conversation history lives only in component state — never persisted
 * across reloads. The LLM call sends the last 6 turns for context only.
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
}

type Message = TextMessage | LeadFormMessage;

// Delays tuned for a more human pace. Real typing is roughly 40 WPM ≈ 200
// chars/min ≈ 3.3 chars/sec. We don't go that slow — the bot is meant to
// be helpful — but we do scale with response length and add jitter.
const TYPING_BASE_MS = 1200; // floor — even the shortest reply waits this long
const TYPING_PER_CHAR_MS = 22; // additional ms per character of response
const TYPING_MAX_MS = 4500; // cap so long replies don't feel stuck
const TYPING_JITTER_MS = 350; // randomness so the cadence isn't robotic
const LEAD_FORM_DELAY_MS = 2200; // beat after the bot reply lands
const MAX_HISTORY_TURNS_FOR_LLM = 6;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function typingDelay(text: string, reduced: boolean): number {
  if (reduced) return 120;
  // Strip HTML tags so we measure visible content length, not markup overhead.
  const visibleLen = text.replace(/<[^>]*>/g, "").length;
  const computed = TYPING_BASE_MS + visibleLen * TYPING_PER_CHAR_MS + Math.random() * TYPING_JITTER_MS;
  return Math.min(computed, TYPING_MAX_MS);
}

export default function Chatbot() {
  const config = kopfChatConfig;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  // Lead-capture is one-shot per session. We use a ref (not state) because
  // the value needs to be read SYNCHRONOUSLY at schedule time, and we set
  // it eagerly when we schedule (not when the form actually renders) so a
  // second high-intent message arriving in the same window can't trigger
  // a duplicate form. Doesn't drive any render so state isn't needed.
  const leadShownRef = useRef(false);

  const responderRef = useRef<ResponderState>(createResponderState());
  // History fed to /api/chat so the LLM has conversation context. Trimmed to
  // last MAX_HISTORY_TURNS_FOR_LLM * 2 messages.
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

  function appendLeadForm(topic: string, lastUserMessage: string) {
    const excerpt = serializeRecentExcerpt(messages, 3);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), kind: "lead", topic, lastUserMessage, conversationExcerpt: excerpt },
    ]);
  }

  function pushHistory(role: "user" | "assistant", content: string) {
    const arr = llmHistoryRef.current;
    arr.push({ role, content });
    const max = MAX_HISTORY_TURNS_FOR_LLM * 2;
    if (arr.length > max) arr.splice(0, arr.length - max);
  }

  // Open: greet + render default suggestion chips on first open
  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);
    const greeting = pickRandom(config.behavior.greetings);
    appendText("bot", greeting);

    const defaults = config.behavior.defaultSuggestions;
    if (defaults.length > 0) {
      setSuggestions(pickRandom(defaults));
    }

    if (config.behavior.privacyNotice) {
      const notice = `<em style="font-size:12px;opacity:0.7">${config.behavior.privacyNotice}</em>`;
      window.setTimeout(() => appendText("bot", notice), 600);
    }

    window.setTimeout(() => inputRef.current?.focus(), 280);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, welcomed]);

  // Auto-scroll on new messages / typing toggles
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  // ESC closes window
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** Schedule a lead-capture prompt after the bot's reply renders.
   *
   * Claims the one-shot slot SYNCHRONOUSLY via the ref so a second
   * high-intent intent arriving during the LEAD_FORM_DELAY_MS window
   * (or a StrictMode double-invoke in dev) can't queue a duplicate form. */
  function maybeScheduleLeadCapture(topic: string, lastUserMessage: string) {
    if (leadShownRef.current) return;
    leadShownRef.current = true;
    window.setTimeout(() => {
      appendLeadForm(topic, lastUserMessage);
    }, LEAD_FORM_DELAY_MS);
  }

  async function handleSend(textRaw: string) {
    const text = textRaw.trim();
    if (!text || typing) return;

    appendText("user", text);
    setDraft("");
    setSuggestions([]);
    setTyping(true);

    // Frustration short-circuits to the live-human handoff (no lead capture
    // here — clearly annoyed visitor; just give them the phone number).
    if (isFrustrated(text)) {
      const reply = config.behavior.frustrationResponse;
      window.setTimeout(() => {
        setTyping(false);
        appendText("bot", htmlBlock(reply));
        setSuggestions(config.behavior.frustrationSuggestions);
      }, typingDelay(reply, reducedMotion));
      return;
    }

    // 1. Pattern matching — fast path
    const intent = findIntent(text, config.intents);

    if (intent) {
      const reply = getResponse(intent, responderRef.current);
      const newSuggestions = getSuggestions(intent, responderRef.current);
      window.setTimeout(() => {
        setTyping(false);
        appendText("bot", htmlBlock(reply));
        setSuggestions(newSuggestions);
        if (intent.leadCapture) {
          maybeScheduleLeadCapture(intent.id, text);
        }
      }, typingDelay(reply, reducedMotion));
      return;
    }

    // 2. LLM fallback — call /api/chat for grounded response
    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          // Send last 6 turns (excluding the current user message we just added).
          // pushHistory already appended; trim it back off the end before sending.
          history: llmHistoryRef.current.slice(0, -1),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };

      if (res.ok && json.ok && json.reply) {
        // LLM answered — render and reset the fail counter
        responderRef.current.failCount = 0;
        setTyping(false);
        appendText("bot", json.reply);
        setSuggestions(pickRandom(config.behavior.defaultSuggestions));
        return;
      }

      // 503 (LLM disabled) / 502 / 429 / etc. → use the canned fallback
      if (res.status === 429 && json.error) {
        setTyping(false);
        appendText("bot", json.error);
        setSuggestions(config.behavior.frustrationSuggestions);
        return;
      }
      throw new Error(json.error || `LLM HTTP ${res.status}`);
    } catch {
      // Hard fallback — canned message + frustration counter
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
      appendText("bot", htmlBlock(reply));
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

      {/* Chat window — anchors to right edge, sits above the FAB */}
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
                  // Slot is already claimed via leadShownRef when we
                  // scheduled this form — these callbacks are no-ops now,
                  // but kept in the API for future "re-prompt on dismiss"
                  // tweaks.
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

        {/* Footer */}
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
        // Bot HTML comes from one of two trusted sources:
        //   1. Static config strings in lib/chatbot/kopf-config.ts (links + bold)
        //   2. LLM output via /api/chat with strict system-prompt formatting rules
        // Neither contains arbitrary user input, so dangerouslySetInnerHTML is safe.
        dangerouslySetInnerHTML={{ __html: content }}
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

function htmlBlock(s: string): string {
  return s.replace(/\n/g, "<br>");
}

/** Strip HTML tags for the LLM history (Claude doesn't need our markup). */
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Serialize the last N text turns as plain "User:" / "Bot:" lines for the lead email. */
function serializeRecentExcerpt(msgs: Message[], turns: number): string {
  const textTurns = msgs.filter((m): m is TextMessage => m.kind === "text");
  const tail = textTurns.slice(-turns * 2);
  return tail
    .map((m) => `${m.role === "user" ? "Visitor" : "Bot"}: ${stripHtml(m.content)}`)
    .join("\n");
}
