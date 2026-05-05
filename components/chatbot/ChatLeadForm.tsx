"use client";

import { useState, type FormEvent } from "react";

/**
 * Inline lead-capture form rendered inside the chatbot as a "bot bubble."
 *
 * Triggers after a high-intent intent fires (shippers/agents/drivers/etc.).
 * Posts to the existing /api/contact pipeline with source="chatbot" so leads
 * land in the same admin dashboard + email notification flow as the other
 * site forms — Marissa sees one inbox, filterable by source.
 *
 * One-shot per session: parent component (Chatbot.tsx) tracks whether this
 * has already been shown/dismissed and won't re-render it.
 */

interface Props {
  /** Intent id that triggered the prompt (for the lead's `topic` extra field). */
  topic: string;
  /** Last visitor message (for the lead's `message` extra field). */
  lastUserMessage: string;
  /** Last few conversation turns serialized (for the lead email body). */
  conversationExcerpt: string;
  /** Called after successful submit so the parent can hide further prompts. */
  onSubmitted: () => void;
  /** Called if the visitor dismisses without submitting. */
  onDismissed: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ChatLeadForm({
  topic,
  lastUserMessage,
  conversationExcerpt,
  onSubmitted,
  onDismissed,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    const payload = {
      source: "chatbot",
      first_name: first.trim(),
      last_name: "",
      email: email.trim(),
      phone: phone.trim(),
      inquiry_body: `Topic: ${topic}\nLast question: ${lastUserMessage}`,
      extra_fields: {
        topic,
        last_user_message: lastUserMessage,
        conversation_excerpt: conversationExcerpt,
      },
      website: "", // honeypot
      submit_time: 30, // chat lead — assume the visitor took some time
      turnstileToken: "",
    };

    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && json.ok) {
        setStatus("success");
        onSubmitted();
      } else {
        setStatus("error");
        setErrorMsg(json.error || "Couldn't send. Try the contact form on /contact instead.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try the contact form on /contact instead.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex justify-start">
        <div
          className="max-w-[88%] px-4 py-3 text-sm leading-relaxed kopf-chat-bubble"
          style={{
            background: "var(--card)",
            color: "var(--text)",
            border: "1px solid var(--hairline)",
            borderRadius: "16px 16px 16px 4px",
          }}
        >
          <strong style={{ color: "var(--accent-2)" }}>Got it.</strong>{" "}
          We&apos;ll route this to the right person and follow up soon. If it&apos;s
          urgent, dispatch is at <strong>574.349.5600</strong> 24/7.
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[92%] px-4 py-4 text-sm leading-relaxed"
        style={{
          background: "var(--card)",
          color: "var(--text)",
          border: "1px solid var(--hairline)",
          borderRadius: "16px 16px 16px 4px",
          width: "100%",
        }}
      >
        <p className="mb-3" style={{ color: "var(--text)" }}>
          Want someone to reach out directly? Drop your info and I&apos;ll route
          it to the right person.
        </p>

        <form onSubmit={onSubmit} className="space-y-2.5">
          <input
            type="text"
            placeholder="Your name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            required
            disabled={status === "submitting"}
            className="w-full px-3 py-2 text-sm transition-colors"
            style={chatInputStyle}
            onFocus={onChatInputFocus}
            onBlur={onChatInputBlur}
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "submitting"}
            autoComplete="email"
            className="w-full px-3 py-2 text-sm transition-colors"
            style={chatInputStyle}
            onFocus={onChatInputFocus}
            onBlur={onChatInputBlur}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={status === "submitting"}
            autoComplete="tel"
            className="w-full px-3 py-2 text-sm transition-colors"
            style={chatInputStyle}
            onFocus={onChatInputFocus}
            onBlur={onChatInputBlur}
          />

          {errorMsg && (
            <p className="text-xs" style={{ color: "#C2410C" }}>
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={status === "submitting" || !first.trim() || !email.trim()}
              className="flex-1 px-4 py-2 text-xs uppercase tracking-[0.18em] font-[var(--font-jetbrains)] font-semibold transition-opacity"
              style={{
                background: "var(--accent)",
                color: "var(--on-accent)",
                opacity:
                  status === "submitting" || !first.trim() || !email.trim() ? 0.5 : 1,
                borderRadius: "4px",
              }}
            >
              {status === "submitting" ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={onDismissed}
              disabled={status === "submitting"}
              className="px-3 py-2 text-xs uppercase tracking-[0.18em] font-[var(--font-jetbrains)]"
              style={{
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--hairline-strong)",
                borderRadius: "4px",
              }}
            >
              No thanks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const chatInputStyle: React.CSSProperties = {
  background: "var(--bg)",
  color: "var(--text)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: "4px",
  outline: "none",
};

function onChatInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "var(--accent-2)";
}

function onChatInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "var(--hairline-strong)";
}
