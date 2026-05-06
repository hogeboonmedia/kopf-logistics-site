"use client";

import { useState, type FormEvent } from "react";

/**
 * Inline lead-capture form rendered inside the chatbot as a "bot bubble."
 *
 * Triggers either:
 *  - At the END of a persona-routed flow (with the flow's answers prefilled
 *    into extra_fields), OR
 *  - On a high-intent intent that doesn't have a flow (after a brief delay,
 *    cancellable if the visitor sends another message).
 *
 * Posts to the existing /api/contact pipeline with source="chatbot" so leads
 * land in the same admin dashboard + email notification flow as the other
 * site forms.
 *
 * Copy + UX choices baked in from research (docs/chatbot-improvements.md):
 *  - Names dispatch + adds "within 30 minutes" time guarantee (CTA copy
 *    research shows 2× lift over generic "drop your info")
 *  - Social-proof microcopy above the form
 *  - Phone reframed as a value-add ("Get faster updates via text") rather
 *    than a demand
 *  - Channel preference radio so dispatch knows how to follow up
 */

interface Props {
  /** Intent id that triggered the prompt (for the lead's `topic` extra field). */
  topic: string;
  /** Last visitor message (for the lead's `message` extra field). */
  lastUserMessage: string;
  /** Last few conversation turns serialized (for the lead email body). */
  conversationExcerpt: string;
  /** Pre-filled extra fields from the persona flow (e.g., lane/equipment for shippers). */
  prefilledExtras?: Record<string, string>;
  onSubmitted: () => void;
  onDismissed: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";
type Channel = "email" | "phone" | "text";

export default function ChatLeadForm({
  topic,
  lastUserMessage,
  conversationExcerpt,
  prefilledExtras = {},
  onSubmitted,
  onDismissed,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsText, setWantsText] = useState(false); // shows phone field when true
  const [channel, setChannel] = useState<Channel>("email");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    // If the visitor checked "text me" but didn't fill phone, treat that as
    // an error rather than silently submitting without it
    if (wantsText && !phone.trim()) {
      setStatus("error");
      setErrorMsg("Add a phone number for text updates, or uncheck the box.");
      return;
    }

    // If channel is "phone" or "text", we need a phone number
    if ((channel === "phone" || channel === "text") && !phone.trim()) {
      setStatus("error");
      setErrorMsg("We'll need your phone number to call/text you back.");
      return;
    }

    const payload = {
      source: "chatbot",
      first_name: first.trim(),
      last_name: "",
      email: email.trim(),
      phone: phone.trim(),
      inquiry_body: `Topic: ${topic}\nLast question: ${lastUserMessage}\nPreferred contact: ${channel}`,
      extra_fields: {
        topic,
        last_user_message: lastUserMessage,
        conversation_excerpt: conversationExcerpt,
        preferred_channel: channel,
        ...prefilledExtras, // flow answers (lane, equipment, timing, etc.)
      },
      website: "",
      submit_time: 30,
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
          <strong style={{ color: "var(--accent-2)" }}>Got it, {first || "thanks"}.</strong>{" "}
          Dispatch will reach out via <strong>{channel}</strong> within 30 minutes.
          {channel !== "phone" && (
            <>
              <br />
              <br />
              If it&apos;s urgent, dispatch is at <strong>574.349.5600</strong> 24/7.
            </>
          )}
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
        {/* Social-proof microcopy */}
        <p
          className="mb-3 text-xs uppercase tracking-[0.14em] font-[var(--font-jetbrains)]"
          style={{ color: "var(--accent-2)" }}
        >
          ✓ Dispatch typically replies within 30 minutes
        </p>

        <p className="mb-4" style={{ color: "var(--text)" }}>
          I&apos;ll route this to dispatch — what&apos;s the best way to reach you?
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

          {/* Channel preference — three quick radios */}
          <fieldset className="pt-1">
            <legend
              className="text-xs uppercase tracking-[0.14em] font-[var(--font-jetbrains)] mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Best way to reach you?
            </legend>
            <div className="flex flex-wrap gap-3 text-xs">
              <ChannelRadio
                value="email"
                current={channel}
                onChange={(c) => {
                  setChannel(c);
                  if (c !== "text") setWantsText(false);
                }}
                label="Email"
              />
              <ChannelRadio
                value="phone"
                current={channel}
                onChange={(c) => {
                  setChannel(c);
                  if (c !== "text") setWantsText(false);
                }}
                label="Call me"
              />
              <ChannelRadio
                value="text"
                current={channel}
                onChange={(c) => {
                  setChannel(c);
                  if (c === "text") setWantsText(true);
                }}
                label="Text me"
              />
            </div>
          </fieldset>

          {/* Phone field appears when channel == phone/text, OR if user
           * explicitly opts in via the "text me" channel. */}
          {(channel === "phone" || channel === "text") && (
            <input
              type="tel"
              placeholder={channel === "phone" ? "Phone number" : "Mobile (for SMS)"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={status === "submitting"}
              autoComplete="tel"
              className="w-full px-3 py-2 text-sm transition-colors"
              style={chatInputStyle}
              onFocus={onChatInputFocus}
              onBlur={onChatInputBlur}
            />
          )}

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
              {status === "submitting" ? "Sending…" : "Send to dispatch"}
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

function ChannelRadio({
  value,
  current,
  onChange,
  label,
}: {
  value: Channel;
  current: Channel;
  onChange: (c: Channel) => void;
  label: string;
}) {
  const selected = value === current;
  return (
    <label
      className="cursor-pointer px-2.5 py-1 transition-colors"
      style={{
        background: selected ? "var(--accent-2)" : "transparent",
        color: selected ? "rgba(245, 239, 230, 0.96)" : "var(--text)",
        border: `1px solid ${selected ? "var(--accent-2)" : "var(--hairline-strong)"}`,
        borderRadius: "4px",
      }}
    >
      <input
        type="radio"
        name="chat-channel"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {label}
    </label>
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
