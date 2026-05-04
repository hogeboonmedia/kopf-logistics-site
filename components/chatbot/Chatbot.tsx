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

/**
 * Kopf chatbot.
 *
 * Floating FAB in the bottom-left (the back-to-top button owns bottom-right).
 * Click → slide-up window with a conversational interface that pattern-matches
 * the visitor's question against the intents in lib/chatbot/kopf-config.ts.
 *
 * Architecture decisions:
 *   - Pure client-side pattern matching (no AI server). Keeps the bot free
 *     to run, zero new infra. Can add an AI fallback later via /api/chat.
 *   - Closed by default — visitors opt in, no auto-popup ambush.
 *   - z-40 sits below the sticky header (z-50). Doesn't fight the
 *     back-to-top button (it lives bottom-right at z-40).
 *   - Honors prefers-reduced-motion for the typing-indicator delay.
 *   - All bot responses can include simple HTML (links, <strong>) — sanitized
 *     by trusting only the static config strings (no user content rendered as HTML).
 */

interface Message {
  id: number;
  role: "user" | "bot";
  /** HTML content for bot, plain text for user. */
  content: string;
}

const TYPING_MIN_MS = 350;
const TYPING_MAX_MS = 900;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function typingDelay(text: string, reduced: boolean): number {
  if (reduced) return 80;
  const len = text.length;
  if (len < 100) return TYPING_MIN_MS + Math.random() * 200;
  if (len < 300) return 600 + Math.random() * 250;
  return TYPING_MAX_MS + Math.random() * 300;
}

export default function Chatbot() {
  const config = kopfChatConfig;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [welcomed, setWelcomed] = useState(false);

  const responderRef = useRef<ResponderState>(createResponderState());
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

  function appendMessage(role: "user" | "bot", content: string) {
    setMessages((prev) => [...prev, { id: nextId(), role, content }]);
  }

  // Open: greet + render default suggestion chips on first open
  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);
    const greeting = pickRandom(config.behavior.greetings);
    appendMessage("bot", greeting);

    const defaults = config.behavior.defaultSuggestions;
    if (defaults.length > 0) {
      setSuggestions(pickRandom(defaults));
    }

    if (config.behavior.privacyNotice) {
      const notice = `<em style="font-size:12px;opacity:0.7">${config.behavior.privacyNotice}</em>`;
      window.setTimeout(() => appendMessage("bot", notice), 600);
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

  function handleSend(textRaw: string) {
    const text = textRaw.trim();
    if (!text || typing) return;

    appendMessage("user", text);
    setDraft("");
    setSuggestions([]);
    setTyping(true);

    // Frustration short-circuits to the live-human handoff
    if (isFrustrated(text)) {
      const reply = config.behavior.frustrationResponse;
      window.setTimeout(() => {
        setTyping(false);
        appendMessage("bot", htmlBlock(reply));
        setSuggestions(config.behavior.frustrationSuggestions);
      }, typingDelay(reply, reducedMotion));
      return;
    }

    const intent = findIntent(text, config.intents);

    if (intent) {
      const reply = getResponse(intent, responderRef.current);
      const newSuggestions = getSuggestions(intent, responderRef.current);
      window.setTimeout(() => {
        setTyping(false);
        appendMessage("bot", htmlBlock(reply));
        setSuggestions(newSuggestions);
      }, typingDelay(reply, reducedMotion));
      return;
    }

    // No match → use a fallback message; escalate to phone after 3 misses
    const failCount = incrementFail(responderRef.current);
    const reply =
      failCount >= 3
        ? config.behavior.frustrationResponse
        : pickRandom(config.behavior.fallbackMessages);
    const fallbackSuggestions =
      failCount >= 3
        ? config.behavior.frustrationSuggestions
        : pickRandom(config.behavior.defaultSuggestions);

    window.setTimeout(() => {
      setTyping(false);
      appendMessage("bot", htmlBlock(reply));
      setSuggestions(fallbackSuggestions);
    }, typingDelay(reply, reducedMotion));
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
      {/* FAB — bottom-left so it doesn't collide with the back-to-top button */}
      <button
        type="button"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 grid place-items-center w-14 h-14 rounded-full transition-transform duration-200"
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

      {/* Chat window */}
      <div
        role="dialog"
        aria-label="Kopf Logistics chat assistant"
        aria-hidden={!open}
        className="fixed left-6 z-40 flex flex-col overflow-hidden transition-all duration-200"
        style={{
          bottom: "calc(1.5rem + 56px + 12px)", // above the FAB
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
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} />
          ))}
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

function MessageBubble({ role, content }: { role: "user" | "bot"; content: string }) {
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
        // Bot content is HTML from a STATIC, code-controlled config —
        // never user-supplied — so dangerouslySetInnerHTML is safe here.
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

/**
 * Convert plain newlines in a config response to <br> while preserving any
 * HTML the config already has (links, <strong>). Conservative — only joins
 * lines, doesn't strip or re-encode anything.
 */
function htmlBlock(s: string): string {
  return s.replace(/\n/g, "<br>");
}
