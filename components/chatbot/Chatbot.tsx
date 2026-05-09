"use client";

/**
 * Kopf chat widget — SSE streaming edition (HOG-132).
 *
 * Architecture:
 *  - Visual design per HOG-130 design spec (Kopf brand tokens, no hex)
 *  - SSE streaming via /api/chat/stream (proxy to Kopf engine HOG-131)
 *  - Server-driven state machine: frontend renders whatever `phase` server sends
 *  - cb_anon profile for returning visitor UX
 *
 * SSE event types: session, delta, answer, clarifying_question,
 * capture_offer, field_request, capture_confirmed, done, error
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { MessageCircle, X, Send } from "lucide-react";
import ChatErrorBoundary from "./ChatErrorBoundary";
import { getProfile, saveProfile, clearProfile, grantConsent, hasConsent } from "@/lib/chatbot/profile";
import type { ChatProfile } from "@/lib/chatbot/profile";

// ─── Types ─────────────────────────────────────────────────────────────────

type MessageRole = "bot" | "user" | "system";

interface TextMessage {
  id: number;
  kind: "text";
  role: MessageRole;
  content: string;
  streaming?: boolean;
  subtype?: "clarifying" | "success" | "gap" | "error_notice";
}

interface CaptureOfferMessage {
  id: number;
  kind: "capture_offer";
  variant: "hot" | "warm" | "handoff";
  text: string;
  eyebrow: string;
  acceptLabel: string;
  declineLabel: string;
}

interface FieldRequestMessage {
  id: number;
  kind: "field_request";
  field: "firstName" | "email" | "phone" | "context";
  prompt: string;
  required: boolean;
}

interface FormFallbackMessage {
  id: number;
  kind: "form_fallback";
}

type Message = TextMessage | CaptureOfferMessage | FieldRequestMessage | FormFallbackMessage;

type WidgetPhase =
  | "chatting"
  | "capture_offer"
  | "capture_field"
  | "capture_complete"
  | "handoff_offer"
  | "form_fallback";

// ─── SSE event data types ───────────────────────────────────────────────────

interface EvSession { sessionId: string }
interface EvDelta { text: string }
interface EvAnswer { text: string; citations?: string[] }
interface EvClarifying { text: string; chips?: string[] }
interface EvCaptureOffer { variant: "hot" | "warm"; text: string }
interface EvFieldRequest { field: "firstName" | "email" | "phone" | "context"; prompt: string; required?: boolean }
interface EvCaptureConfirmed { firstName?: string; email?: string }
interface EvError { message: string }

// ─── Markdown subset renderer (safe, no XSS) ──────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // **bold**
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    // [link](url) — internal paths and https only
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    // - bullet
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // numbered list
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // double newline → paragraph break
    .replace(/\n\n+/g, "<br><br>")
    // single newline → br
    .replace(/\n/g, "<br>");
}

// ─── Opener copy ────────────────────────────────────────────────────────────

const OPENER_CHIPS = [
  "Get a freight quote",
  "I'm a carrier",
  "Check on a shipment",
  "Talk to a rep",
];

// ─── Telemetry ──────────────────────────────────────────────────────────────

function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Hook for analytics — extend as needed
  if (process.env.NODE_ENV === "development") {
    console.debug("[kopf-chat]", event, props);
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chips, setChips] = useState<string[]>(OPENER_CHIPS);
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<WidgetPhase>("chatting");
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [showForgetMe, setShowForgetMe] = useState(false);
  const [forgetConfirm, setForgetConfirm] = useState(false);

  const sessionIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(0);
  const captureLeadRef = useRef<Partial<ChatProfile>>({});

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  function nextId() {
    idRef.current += 1;
    return idRef.current;
  }

  function appendText(role: MessageRole, content: string, subtype?: TextMessage["subtype"]): number {
    const id = nextId();
    setMessages((prev) => [...prev, { id, kind: "text", role, content, subtype }]);
    return id;
  }

  function appendStreamingBubble(): number {
    const id = nextId();
    setMessages((prev) => [...prev, { id, kind: "text", role: "bot", content: "", streaming: true }]);
    setStreamingId(id);
    return id;
  }

  function appendToStreaming(id: number, token: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.kind === "text" ? { ...m, content: m.content + token } : m,
      ),
    );
  }

  function finalizeStreaming(id: number) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id && m.kind === "text" ? { ...m, streaming: false } : m,
      ),
    );
    setStreamingId(null);
  }

  // ── SSE stream consumer ─────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streamingId !== null) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      appendText("user", text);
      setDraft("");
      setChips([]);
      setTyping(true);

      track("message_sent", { message_length: text.length, was_chip: false });

      let streamBubbleId: number | null = null;
      const startMs = Date.now();

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            clientId: "kopf",
            ...(sessionIdRef.current ? { sessionId: sessionIdRef.current } : {}),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        setTyping(false);

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (!part.trim()) continue;

            let eventType = "message";
            let dataLine = "";

            for (const line of part.split("\n")) {
              if (line.startsWith("event: ")) eventType = line.slice(7).trim();
              else if (line.startsWith("data: ")) dataLine = line.slice(6).trim();
            }

            if (!dataLine) continue;

            let parsed: unknown;
            try {
              parsed = JSON.parse(dataLine);
            } catch {
              continue;
            }

            switch (eventType) {
              case "session": {
                const ev = parsed as EvSession;
                sessionIdRef.current = ev.sessionId;
                saveProfile({ sessionId: ev.sessionId });
                break;
              }

              case "delta": {
                const ev = parsed as EvDelta;
                if (streamBubbleId === null) {
                  streamBubbleId = appendStreamingBubble();
                  track("bot_first_token", { latency_ms: Date.now() - startMs });
                }
                appendToStreaming(streamBubbleId, ev.text);
                break;
              }

              case "answer": {
                const ev = parsed as EvAnswer;
                setTyping(false);
                if (streamBubbleId !== null) {
                  // Replace partial stream with full answer
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                } else {
                  appendText("bot", renderMarkdown(ev.text));
                }
                track("bot_stream_complete", { total_duration_ms: Date.now() - startMs });
                break;
              }

              case "clarifying_question": {
                const ev = parsed as EvClarifying;
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                appendText("bot", renderMarkdown(ev.text), "clarifying");
                if (ev.chips?.length) setChips(ev.chips);
                setPhase("chatting");
                track("clarifying_shown", {});
                break;
              }

              case "capture_offer": {
                const ev = parsed as EvCaptureOffer;
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                const id = nextId();
                setMessages((prev) => [
                  ...prev,
                  {
                    id,
                    kind: "capture_offer",
                    variant: ev.variant,
                    text: ev.text,
                    eyebrow:
                      ev.variant === "hot"
                        ? "CONNECTING YOU WITH KOPF"
                        : "OPTIONAL — TEAM FOLLOW-UP",
                    acceptLabel: ev.variant === "hot" ? "Sounds good" : "Yes, please",
                    declineLabel: ev.variant === "hot" ? "Not now" : "Just keep chatting",
                  } satisfies CaptureOfferMessage,
                ]);
                setPhase("capture_offer");
                track("capture_offered", { variant: ev.variant });
                break;
              }

              case "field_request": {
                const ev = parsed as EvFieldRequest;
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                const id = nextId();
                setMessages((prev) => [
                  ...prev,
                  {
                    id,
                    kind: "field_request",
                    field: ev.field,
                    prompt: ev.prompt,
                    required: ev.required !== false,
                  } satisfies FieldRequestMessage,
                ]);
                setPhase("capture_field");
                // Prefill name if we know it
                if (ev.field === "firstName") {
                  const profile = getProfile();
                  if (profile?.firstName) setDraft(profile.firstName);
                }
                break;
              }

              case "capture_confirmed": {
                const ev = parsed as EvCaptureConfirmed;
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                const name = ev.firstName ?? captureLeadRef.current.firstName ?? "";
                const email = ev.email ?? captureLeadRef.current.email ?? "";
                appendText(
                  "bot",
                  `<span class="kc-success-check" aria-hidden="true"></span>Got it${name ? `, ${name}` : ""}. Someone from our team will reach out to ${email ? `<strong>${email}</strong>` : "you"} within one business day. In the meantime, what else can I help with?`,
                  "success",
                );
                setPhase("chatting");
                setChips(OPENER_CHIPS);
                // Persist to profile
                grantConsent();
                saveProfile({ firstName: name || undefined, email: email || undefined });
                setShowForgetMe(true);
                track("capture_completed", { variant: "conversational" });
                break;
              }

              case "done": {
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                track("bot_stream_complete", { total_duration_ms: Date.now() - startMs });
                break;
              }

              case "error": {
                const ev = parsed as EvError;
                if (streamBubbleId !== null) {
                  finalizeStreaming(streamBubbleId);
                  streamBubbleId = null;
                }
                setTyping(false);
                appendText("bot", ev.message, "error_notice");
                break;
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setTyping(false);
        if (streamBubbleId !== null) {
          finalizeStreaming(streamBubbleId);
        }
        appendText(
          "bot",
          "Connection dropped. [Tap to retry](#retry)",
          "error_notice",
        );
        track("stream_error", { reason: String(err) });
      }
    },
    [streamingId],
  );

  // ── Field collection handler ────────────────────────────────────────────

  function handleFieldSubmit(field: FieldRequestMessage["field"], value: string) {
    if (!value.trim()) return;
    // Store in local ref for capture_confirmed echo
    if (field === "firstName") captureLeadRef.current.firstName = value.trim();
    if (field === "email") captureLeadRef.current.email = value.trim();
    // Remove the field_request bubble
    setMessages((prev) => prev.filter((m) => m.kind !== "field_request"));
    setPhase("chatting");
    sendMessage(value.trim());
  }

  function handleCaptureChoice(accept: boolean) {
    setMessages((prev) => prev.filter((m) => m.kind !== "capture_offer"));
    setPhase("chatting");
    sendMessage(accept ? "Yes, sounds good" : "Not now");
    if (accept) track("capture_accepted", {});
    else track("capture_declined", {});
  }

  // ── Open / lifecycle ────────────────────────────────────────────────────

  useEffect(() => {
    if (!open || welcomed) return;
    setWelcomed(true);

    const profile = getProfile();

    if (profile?.firstName && profile?.sessionId) {
      // Returning visitor
      const name = profile.firstName;
      appendText(
        "bot",
        `Welcome back, <strong style="font-family:var(--font-anton);font-size:16px">${name}</strong>. ${
          profile.lastTopic
            ? `Last time we were talking about ${profile.lastTopic}. Pick up where we left off, or start fresh?`
            : "What can I help you with today?"
        }`,
      );
      if (profile.lastTopic) {
        setChips(["Pick up there", "Start fresh"]);
      }
      track("returning_visitor_recognized", {
        tier: profile.firstName ? "named" : "anon",
      });
      sessionIdRef.current = profile.sessionId;
      if (hasConsent()) setShowForgetMe(true);
    } else {
      // First-time visitor opener
      appendText(
        "bot",
        "Hi — I'm the Kopf assistant. I help with freight quotes, capacity, carrier questions, and getting you to the right person if you need one.<br><br>What brings you in today?",
      );
      setChips(OPENER_CHIPS);
      track("widget_opened", { source: "fab" });
    }

    window.setTimeout(() => inputRef.current?.focus(), 280);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, welcomed]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        track("widget_closed", { message_count: messages.length });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, messages.length]);

  // Alt+K global shortcut
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.altKey && e.key === "k") {
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ── Input handlers ──────────────────────────────────────────────────────

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === "capture_field") return; // handled by field bubble
    sendMessage(draft);
  }

  function onInputKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (phase === "capture_field") return;
      sendMessage(draft);
    }
  }

  // ── Forget me ──────────────────────────────────────────────────────────

  function handleForgetMe() {
    clearProfile();
    sessionIdRef.current = null;
    captureLeadRef.current = {};
    setShowForgetMe(false);
    setForgetConfirm(false);
    setMessages([]);
    setWelcomed(false);
    setPhase("chatting");
    setChips(OPENER_CHIPS);
    track("forget_me_invoked", {});
    // Re-trigger welcome
    setTimeout(() => {
      appendText("bot", "Your info has been cleared from this device. Start fresh whenever you're ready.");
      setChips(OPENER_CHIPS);
    }, 100);
  }

  // ── Render helpers ──────────────────────────────────────────────────────

  const isStreaming = streamingId !== null;
  const isDisabled = isStreaming || typing;

  const inputPlaceholder =
    phase === "capture_field"
      ? "Type your answer…"
      : isStreaming
        ? "Kopf is replying…"
        : "Ask about shipping, driving, or agents…";

  // ── JSX ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Widget CSS — scoped to .kopf-chat */}
      <style>{`
        .kopf-chat {
          --kc-bubble-bot: var(--bg-elevated);
          --kc-bubble-bot-text: var(--text);
          --kc-bubble-user: var(--accent);
          --kc-bubble-user-text: var(--on-accent);
          --kc-bubble-system: color-mix(in srgb, var(--accent-2) 12%, transparent);
          --kc-bubble-system-border: color-mix(in srgb, var(--accent-2) 35%, transparent);
          --kc-shadow-window: 0 24px 48px rgba(15,11,8,0.45), 0 4px 12px rgba(15,11,8,0.18);
          --kc-shadow-fab: 0 8px 24px rgba(234,88,12,0.42), 0 2px 6px rgba(15,11,8,0.25);
          --kc-radius-window: 14px;
          --kc-radius-bubble: 10px;
          --kc-radius-bubble-tail: 2px;
          --kc-stream-cursor: var(--accent);
        }
        [data-theme="light"] .kopf-chat {
          --kc-shadow-window: 0 24px 48px rgba(26,19,12,0.18), 0 4px 12px rgba(26,19,12,0.08);
          --kc-shadow-fab: 0 8px 24px rgba(194,65,12,0.32), 0 2px 6px rgba(26,19,12,0.12);
        }
        .kc-stream-cursor {
          display: inline-block;
          width: 0.5ch;
          background: var(--kc-stream-cursor);
          animation: kc-blink 1s steps(2) infinite;
          vertical-align: text-bottom;
          margin-left: 1px;
          height: 1em;
          border-radius: 1px;
        }
        @keyframes kc-blink { 50% { opacity: 0; } }

        .kc-typing-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: kc-typing 1.4s ease-in-out infinite;
        }
        .kc-typing-dot:nth-child(2) { animation-delay: 200ms; }
        .kc-typing-dot:nth-child(3) { animation-delay: 400ms; }
        @keyframes kc-typing {
          0%, 100% { background: var(--text-muted); }
          50% { background: var(--accent); }
        }

        .kc-success-check::before {
          content: '';
          display: inline-block;
          width: 16px;
          height: 16px;
          background: var(--accent);
          border-radius: 50%;
          margin-right: 8px;
          vertical-align: middle;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8l3 3 6-6' stroke='%230F0B08' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: 12px 12px;
          background-position: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .kopf-chat * { animation-duration: 0.01ms !important; transition-duration: 150ms !important; }
        }
      `}</style>

      {/* FAB */}
      <button
        type="button"
        aria-label={open ? "Close Kopf chat" : "Open Kopf chat"}
        aria-expanded={open}
        aria-controls="kc-window"
        onClick={() => {
          setOpen((v) => {
            if (!v) track("widget_opened", { source: "fab" });
            else track("widget_closed", { message_count: messages.length });
            return !v;
          });
        }}
        className="kopf-chat fixed z-[1000] grid place-items-center rounded-full transition-transform duration-200"
        style={{
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          background: "var(--accent)",
          color: "var(--on-accent)",
          boxShadow: "var(--kc-shadow-fab)",
          transform: open ? "scale(0.92)" : "scale(1)",
        }}
      >
        <span
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(-90deg)",
            position: "absolute",
            transition: "opacity 200ms, transform 200ms",
          }}
        >
          <X className="w-6 h-6" strokeWidth={2.4} />
        </span>
        <span
          style={{
            opacity: open ? 0 : 1,
            transform: open ? "scale(0.7) rotate(90deg)" : "scale(1) rotate(0deg)",
            position: "absolute",
            transition: "opacity 200ms, transform 200ms",
          }}
        >
          <MessageCircle className="w-6 h-6" strokeWidth={2.2} />
        </span>
      </button>

      {/* Chat window */}
      <div
        id="kc-window"
        role="dialog"
        aria-modal="false"
        aria-label="Kopf chat assistant"
        aria-hidden={!open}
        className="kopf-chat fixed z-[999] flex flex-col overflow-hidden"
        style={{
          bottom: 100,
          right: 28,
          width: 380,
          maxWidth: "calc(100vw - 16px)",
          height: "min(600px, calc(100dvh - 120px))",
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          borderRadius: "var(--kc-radius-window)",
          boxShadow: "var(--kc-shadow-window)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(12px) scale(0.96)",
          transformOrigin: "bottom right",
          transition: reducedMotion
            ? "opacity 150ms"
            : open
              ? "opacity 280ms cubic-bezier(0.32,0.72,0,1), transform 280ms cubic-bezier(0.32,0.72,0,1)"
              : "opacity 200ms cubic-bezier(0.4,0,1,1), transform 200ms cubic-bezier(0.4,0,1,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 shrink-0"
          style={{
            padding: "14px 16px 12px",
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--hairline-strong)",
          }}
        >
          {/* Square avatar — Kopf is rectilinear */}
          <div
            aria-hidden="true"
            className="grid place-items-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "var(--accent)",
              color: "var(--on-accent)",
              fontFamily: "var(--font-anton)",
              fontSize: 16,
              letterSpacing: "0.02em",
            }}
          >
            K
          </div>
          <div className="flex-1 min-w-0">
            <div
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: 18,
                letterSpacing: "0.04em",
                lineHeight: 1,
                color: "var(--text)",
                textTransform: "uppercase",
              }}
            >
              Kopf Assistant
            </div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.02em",
                lineHeight: 1.3,
                color: "var(--text-muted)",
                marginTop: 3,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22C55E",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Online · typically replies fast
            </div>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={() => {
              setOpen(false);
              track("widget_closed", { message_count: messages.length });
            }}
            className="grid place-items-center transition-colors shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 14,
              lineHeight: 1,
              border: "none",
              cursor: "pointer",
            }}
          >
            ⌄
          </button>
        </div>

        {/* Message list */}
        <div
          role="log"
          aria-live="polite"
          aria-atomic="false"
          className="flex-1 overflow-y-auto"
          style={{ padding: "16px 14px" }}
        >
          {messages.map((m, i) => {
            if (m.kind === "text") {
              return (
                <ChatErrorBoundary key={m.id}>
                  <BotOrUserBubble
                    message={m}
                    prevRole={
                      i > 0 && messages[i - 1].kind === "text"
                        ? (messages[i - 1] as TextMessage).role
                        : null
                    }
                  />
                </ChatErrorBoundary>
              );
            }
            if (m.kind === "capture_offer") {
              return (
                <ChatErrorBoundary key={m.id}>
                  <CaptureOfferBubble
                    message={m}
                    onAccept={() => handleCaptureChoice(true)}
                    onDecline={() => handleCaptureChoice(false)}
                  />
                </ChatErrorBoundary>
              );
            }
            if (m.kind === "field_request") {
              return (
                <ChatErrorBoundary key={m.id}>
                  <FieldRequestBubble
                    message={m}
                    onSubmit={handleFieldSubmit}
                  />
                </ChatErrorBoundary>
              );
            }
            if (m.kind === "form_fallback") {
              return (
                <ChatErrorBoundary key={m.id}>
                  <FormFallbackBubble
                    onSubmitted={(firstName, email) => {
                      captureLeadRef.current = { firstName, email };
                      grantConsent();
                      saveProfile({ firstName, email });
                      setShowForgetMe(true);
                      setMessages((prev) => prev.filter((x) => x.kind !== "form_fallback"));
                      appendText(
                        "bot",
                        `<span class="kc-success-check"></span>Got it, ${firstName}. Someone from our team will reach out to <strong>${email}</strong> within one business day.`,
                        "success",
                      );
                      setPhase("chatting");
                    }}
                  />
                </ChatErrorBoundary>
              );
            }
            return null;
          })}

          {typing && (
            <div className="flex justify-start" style={{ marginTop: 12 }}>
              <div
                aria-label="Kopf is typing"
                className="flex items-center gap-1"
                style={{
                  padding: "10px 14px",
                  background: "var(--kc-bubble-bot)",
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--kc-radius-bubble) var(--kc-radius-bubble) var(--kc-radius-bubble) var(--kc-radius-bubble-tail)",
                }}
              >
                <span className="kc-typing-dot" />
                <span className="kc-typing-dot" />
                <span className="kc-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {chips.length > 0 && !isDisabled && (
          <div
            className="shrink-0 flex flex-wrap"
            style={{
              gap: 6,
              padding: "8px 14px",
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--hairline-strong)",
            }}
          >
            {chips.map((s, idx) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  track("message_sent", { message_length: s.length, was_chip: true });
                  sendMessage(s);
                }}
                className="transition-colors"
                style={{
                  padding: "7px 12px",
                  background: "var(--bg-elevated)",
                  color: "var(--text)",
                  border: "1px solid var(--hairline-strong)",
                  borderRadius: 4,
                  fontFamily: "var(--font-inter)",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                  minHeight: 36,
                  cursor: "pointer",
                  animationDelay: `${idx * 30}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--on-accent)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--hairline-strong)";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <form
          onSubmit={onSubmit}
          className="shrink-0 flex items-end gap-2"
          style={{
            padding: "12px 14px",
            background: "var(--bg)",
            borderTop: "1px solid var(--hairline-strong)",
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              // Auto-resize up to 4 lines
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={onInputKey}
            placeholder={inputPlaceholder}
            aria-label="Type your message"
            disabled={isDisabled}
            inputMode={phase === "capture_field" ? "text" : undefined}
            autoComplete="off"
            className="flex-1 resize-none transition-colors"
            style={{
              height: 38,
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              color: "var(--text)",
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              lineHeight: 1.4,
              outline: "none",
              overflow: "hidden",
              opacity: isDisabled ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--focus-form)";
              e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--focus-form) 20%, transparent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--hairline)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isDisabled}
            aria-label="Send message"
            className="grid place-items-center shrink-0 transition-opacity"
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "var(--accent)",
              color: "var(--on-accent)",
              border: "none",
              cursor: !draft.trim() || isDisabled ? "not-allowed" : "pointer",
              opacity: !draft.trim() || isDisabled ? 0.45 : 1,
              flexShrink: 0,
            }}
          >
            <Send className="w-4 h-4" strokeWidth={2.4} />
          </button>
        </form>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-center gap-2"
          style={{
            padding: "6px 14px",
            background: "var(--bg)",
            borderTop: "1px solid var(--hairline)",
            fontFamily: "var(--font-inter)",
            fontSize: 10,
            letterSpacing: "0.04em",
            color: "var(--text-concrete)",
          }}
        >
          <span>Powered by Kopf</span>
          <span aria-hidden="true">·</span>
          <a href="/privacy-policy" style={{ color: "var(--accent-2)" }}>
            Privacy
          </a>
          {showForgetMe && (
            <>
              <span aria-hidden="true">·</span>
              {forgetConfirm ? (
                <>
                  <button
                    type="button"
                    onClick={handleForgetMe}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      cursor: "pointer",
                      padding: 0,
                      font: "inherit",
                      fontSize: 10,
                    }}
                  >
                    Yes, forget
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setForgetConfirm(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-concrete)",
                      cursor: "pointer",
                      padding: 0,
                      font: "inherit",
                      fontSize: 10,
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setForgetConfirm(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-concrete)",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                    fontSize: 10,
                  }}
                >
                  Forget me on this device
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function BotOrUserBubble({
  message,
  prevRole,
}: {
  message: TextMessage;
  prevRole: MessageRole | null;
}) {
  const isFirstOfTurn = prevRole !== message.role;
  const isSystem =
    message.role === "system" ||
    message.subtype === "success" ||
    message.subtype === "clarifying";

  if (isSystem || message.subtype === "success") {
    return (
      <div
        style={{
          margin: "16px 0",
          padding: "8px 12px",
          background: "var(--kc-bubble-system)",
          border: `1px dashed var(--kc-bubble-system-border)`,
          borderRadius: 6,
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          lineHeight: 1.4,
          color: "var(--text)",
        }}
        dangerouslySetInnerHTML={{ __html: message.content }}
      />
    );
  }

  if (message.role === "user") {
    return (
      <div
        className="flex justify-end"
        style={{ marginTop: isFirstOfTurn ? 12 : 4 }}
      >
        <div
          style={{
            maxWidth: "84%",
            padding: "10px 14px",
            background: "var(--kc-bubble-user)",
            color: "var(--kc-bubble-user-text)",
            borderRadius:
              "var(--kc-radius-bubble) var(--kc-radius-bubble) var(--kc-radius-bubble-tail) var(--kc-radius-bubble)",
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // Bot bubble
  return (
    <div
      className="flex items-start gap-2"
      style={{ marginTop: isFirstOfTurn ? 12 : 4 }}
    >
      {/* Avatar — only on first bubble of a bot turn */}
      {isFirstOfTurn ? (
        <div
          aria-hidden="true"
          className="grid place-items-center shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: 4,
            background: "var(--accent)",
            color: "var(--on-accent)",
            fontFamily: "var(--font-anton)",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          K
        </div>
      ) : (
        <div style={{ width: 28, flexShrink: 0 }} />
      )}
      <div
        aria-busy={message.streaming ? "true" : undefined}
        style={{
          maxWidth: "84%",
          padding: "10px 14px",
          background: "var(--kc-bubble-bot)",
          color: "var(--kc-bubble-bot-text)",
          border: "1px solid var(--hairline)",
          borderRadius:
            "var(--kc-radius-bubble) var(--kc-radius-bubble) var(--kc-radius-bubble) var(--kc-radius-bubble-tail)",
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {message.subtype === "clarifying" ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8,
                fontSize: 9,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--accent-2)",
                fontWeight: 600,
              }}
            >
              <span style={{ flex: 1, height: 1, background: "var(--accent-2)", opacity: 0.4 }} />
              CLARIFYING
              <span style={{ flex: 1, height: 1, background: "var(--accent-2)", opacity: 0.4 }} />
            </div>
            <span dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>
        ) : message.subtype === "error_notice" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--text-muted)" }}>⚠</span>
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 12, color: "var(--text-muted)" }}>
              {message.content.replace("#retry", "")}
            </span>
          </div>
        ) : (
          <span
            dangerouslySetInnerHTML={{
              __html: message.content + (message.streaming ? '<span class="kc-stream-cursor" aria-hidden="true"></span>' : ""),
            }}
          />
        )}
      </div>
    </div>
  );
}

function CaptureOfferBubble({
  message,
  onAccept,
  onDecline,
}: {
  message: CaptureOfferMessage;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div style={{ margin: "16px 0" }}>
      {/* Eyebrow */}
      <div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          marginBottom: 8,
          background: "color-mix(in srgb, var(--accent-2) 14%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-2) 40%, transparent)",
          borderRadius: 4,
          color: "var(--accent-2)",
          fontFamily: "var(--font-inter)",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {message.eyebrow}
      </div>

      {/* Bot bubble with the offer text */}
      <div className="flex items-start gap-2">
        <div
          aria-hidden="true"
          className="grid place-items-center shrink-0"
          style={{
            width: 28, height: 28, borderRadius: 4,
            background: "var(--accent)", color: "var(--on-accent)",
            fontFamily: "var(--font-anton)", fontSize: 12, marginTop: 2,
          }}
        >
          K
        </div>
        <div
          style={{
            maxWidth: "84%",
            padding: "10px 14px",
            background: "var(--kc-bubble-bot)",
            color: "var(--kc-bubble-bot-text)",
            border: "1px solid var(--hairline)",
            borderRadius: "10px 10px 10px 2px",
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            lineHeight: 1.55,
          }}
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
      </div>

      {/* Accept / Decline chips */}
      <div className="flex gap-2" style={{ marginTop: 8, marginLeft: 36 }}>
        <button
          type="button"
          onClick={onAccept}
          style={{
            padding: "7px 14px",
            background: "var(--accent)",
            color: "var(--on-accent)",
            border: "none",
            borderRadius: 4,
            fontFamily: "var(--font-inter)",
            fontWeight: 500,
            fontSize: 12,
            cursor: "pointer",
            minHeight: 36,
          }}
        >
          {message.acceptLabel}
        </button>
        <button
          type="button"
          onClick={onDecline}
          style={{
            padding: "7px 14px",
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 4,
            fontFamily: "var(--font-inter)",
            fontWeight: 500,
            fontSize: 12,
            cursor: "pointer",
            minHeight: 36,
          }}
        >
          {message.declineLabel}
        </button>
      </div>
    </div>
  );
}

function FieldRequestBubble({
  message,
  onSubmit,
}: {
  message: FieldRequestMessage;
  onSubmit: (field: FieldRequestMessage["field"], value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function validate(v: string): string | null {
    if (message.field === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return "That doesn't look right — mind double-checking?";
    }
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() && message.required) return;
    const err = validate(value.trim());
    if (err) { setError(err); return; }
    onSubmit(message.field, value.trim());
  }

  const inputMode = message.field === "email" ? "email" : message.field === "phone" ? "tel" : "text";
  const autoComplete = message.field === "email" ? "email" : message.field === "phone" ? "tel" : message.field === "firstName" ? "given-name" : "off";

  return (
    <div style={{ margin: "16px 0 8px" }}>
      {/* Bot prompt */}
      <div className="flex items-start gap-2" style={{ marginBottom: 8 }}>
        <div
          aria-hidden="true"
          className="grid place-items-center shrink-0"
          style={{ width: 28, height: 28, borderRadius: 4, background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-anton)", fontSize: 12, marginTop: 2 }}
        >
          K
        </div>
        <div
          style={{
            maxWidth: "84%",
            padding: "10px 14px",
            background: "var(--kc-bubble-bot)",
            color: "var(--kc-bubble-bot-text)",
            border: "1px solid var(--hairline)",
            borderRadius: "10px 10px 10px 2px",
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            lineHeight: 1.55,
          }}
          dangerouslySetInnerHTML={{ __html: message.prompt }}
        />
      </div>

      {/* Inline input pill */}
      <form onSubmit={handleSubmit} style={{ marginLeft: 36 }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type={message.field === "email" ? "email" : message.field === "phone" ? "tel" : "text"}
            inputMode={inputMode}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            placeholder={
              message.field === "firstName" ? "Your first name"
              : message.field === "email" ? "name@example.com"
              : message.field === "phone" ? "Phone number (optional)"
              : "Tell us a bit more…"
            }
            style={{
              flex: 1,
              height: 38,
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              color: "var(--text)",
              border: `1px solid ${error ? "var(--destructive, #B91C1C)" : "var(--hairline)"}`,
              borderRadius: 8,
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "var(--focus-form)";
                e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--focus-form) 20%, transparent)";
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = "var(--hairline)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          />
          <button
            type="submit"
            disabled={!value.trim() && message.required}
            aria-label="Send"
            style={{
              width: 38, height: 38, borderRadius: 8,
              background: "var(--accent)", color: "var(--on-accent)",
              border: "none", cursor: "pointer",
              opacity: !value.trim() && message.required ? 0.45 : 1,
            }}
          >
            <Send className="w-4 h-4 mx-auto" strokeWidth={2.4} />
          </button>
        </div>
        {error && (
          <p style={{ marginTop: 4, fontSize: 11, color: "var(--destructive, #B91C1C)", fontFamily: "var(--font-inter)" }}>
            {error}
          </p>
        )}
        {!message.required && (
          <button
            type="button"
            onClick={() => onSubmit(message.field, "")}
            style={{
              marginTop: 6,
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Skip
          </button>
        )}
      </form>
    </div>
  );
}

function FormFallbackBubble({
  onSubmitted,
}: {
  onSubmitted: (firstName: string, email: string) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chatbot_fallback",
          first_name: firstName.trim(),
          last_name: "",
          email: email.trim(),
          phone: phone.trim(),
          inquiry_body: "Chat form fallback",
          extra_fields: { channel: "chat_form" },
          website: "",
          submit_time: 15,
          turnstileToken: "",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        onSubmitted(firstName.trim(), email.trim());
      } else {
        setStatus("error");
        setErrorMsg(json.error ?? "Something went wrong — try /contact instead.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — try /contact instead.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 38,
    padding: "8px 12px",
    background: "var(--bg-elevated)",
    color: "var(--text)",
    border: "1px solid var(--hairline-strong)",
    borderRadius: 6,
    fontFamily: "var(--font-inter)",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div
      style={{
        margin: "16px 0",
        padding: 14,
        background: "var(--bg-elevated)",
        border: "1px solid var(--hairline-strong)",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-anton)",
          fontSize: 13,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 12,
        }}
      >
        REACH OUT TO KOPF
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-2)", marginBottom: 4 }}>
            First name <span style={{ color: "var(--accent-2)" }}>*</span>
          </label>
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} autoComplete="given-name" />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-2)", marginBottom: 4 }}>
            Email <span style={{ color: "var(--accent-2)" }}>*</span>
          </label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" inputMode="email" />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-2)", marginBottom: 4 }}>
            Phone (optional)
          </label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} autoComplete="tel" inputMode="tel" />
        </div>
        {errorMsg && (
          <p style={{ fontSize: 11, color: "var(--destructive, #B91C1C)", fontFamily: "var(--font-inter)" }}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "submitting" || !firstName.trim() || !email.trim()}
          style={{
            display: "block",
            width: "100%",
            height: 40,
            marginTop: 8,
            background: "var(--accent)",
            color: "var(--on-accent)",
            fontFamily: "var(--font-anton)",
            fontSize: 14,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            opacity: status === "submitting" || !firstName.trim() || !email.trim() ? 0.5 : 1,
          }}
        >
          {status === "submitting" ? "Sending…" : "SEND TO KOPF →"}
        </button>
      </form>
    </div>
  );
}
