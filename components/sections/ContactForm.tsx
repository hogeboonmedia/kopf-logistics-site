"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ContactForm — replaces the old mailto: form.
 *
 * Submits to /api/contact via fetch(). The server runs blocklist checks,
 * Turnstile verification, honeypot/rate-limit checks, CleanTalk spam check,
 * persists the submission to Postgres, and emails Marissa via Resend.
 *
 * Honeypot: a hidden `website` input. Bots fill all fields; humans don't see
 * it. Server rejects any submission with a non-empty `website`.
 *
 * Page-load time: we record `performance.now()` at mount and pass the elapsed
 * seconds as `submit_time` in the request — CleanTalk uses this to detect
 * bots that submit instantly (real users take >5s to fill a form).
 */

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (
        container: string | HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface Props {
  turnstileSiteKey?: string;
}

export default function ContactForm({ turnstileSiteKey }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());

  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Turnstile widget script + render
  useEffect(() => {
    if (!turnstileSiteKey) return;

    const existing = document.querySelector(
      'script[data-kopf="turnstile"]',
    ) as HTMLScriptElement | null;

    function renderWidget() {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey!,
          theme: "auto",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(null),
          "error-callback": () => setToken(null),
        });
      } catch {
        // Already rendered or sitekey invalid — ignore
      }
    }

    if (existing && window.turnstile) {
      renderWidget();
      return;
    }

    if (!existing) {
      const s = document.createElement("script");
      s.dataset.kopf = "turnstile";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      s.async = true;
      s.defer = true;
      window.onloadTurnstileCallback = renderWidget;
      document.head.appendChild(s);
    } else {
      // Script tag exists but turnstile not yet ready — wait briefly
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(id);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [turnstileSiteKey]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage(null);

    const fd = new FormData(e.currentTarget);
    const submitTimeSec = Math.round((Date.now() - pageLoadTimeRef.current) / 1000);

    const payload = {
      first_name: String(fd.get("first_name") ?? ""),
      last_name: String(fd.get("last_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      inquiry: String(fd.get("inquiry") ?? ""),
      inquiry_body: String(fd.get("inquiry_body") ?? ""),
      // Honeypot — bots fill this; humans never see it
      website: String(fd.get("website") ?? ""),
      turnstileToken: token ?? "",
      submit_time: submitTimeSec,
    };

    try {
      const res = await fetch("/api/contact", {
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
        formRef.current?.reset();
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            /* ignore */
          }
        }
        setToken(null);
      } else {
        setStatus("error");
        setErrorMessage(json.error || `Submission failed (${res.status}).`);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage((err as Error).message || "Network error.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="mt-10 p-8"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--accent)" }}
      >
        <div className="kopf-eyebrow mb-3">§ Message Received</div>
        <h3
          className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl tracking-tight leading-tight"
          style={{ color: "var(--text)" }}
        >
          Thanks &mdash; we&apos;ll be in touch within one business day.
        </h3>
        <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Your inquiry was sent to our recruiting team at Kopf Logistics Group. If it&apos;s
          urgent, call{" "}
          <a
            href="tel:5743495600"
            className="font-[var(--font-jetbrains)] tabular-nums hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            574.349.5600
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-10 space-y-6" noValidate>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="First Name *" name="first_name" type="text" required />
        <Field label="Last Name *" name="last_name" type="text" required />
        <Field label="Email *" name="email" type="email" required autoComplete="email" />
        <Field label="Phone *" name="phone" type="tel" required autoComplete="tel" />
      </div>

      <div>
        <span className="kopf-eyebrow block mb-2">Preferred Contact</span>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="inquiry"
              value="phone"
              defaultChecked
              className="accent-[var(--accent)]"
            />{" "}
            Phone
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="inquiry"
              value="email"
              className="accent-[var(--accent)]"
            />{" "}
            Email
          </label>
        </div>
      </div>

      <label className="block">
        <span className="kopf-eyebrow block mb-2">Describe Inquiry *</span>
        <textarea
          required
          name="inquiry_body"
          rows={5}
          minLength={5}
          maxLength={4000}
          className="w-full px-4 py-3 focus:outline-none transition"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--hairline-strong)",
            color: "var(--text)",
          }}
        />
      </label>

      {/* Honeypot — hidden from humans, bots fill it. Server rejects if non-empty. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Leave this field empty
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {/* Turnstile widget mounts here. */}
      {turnstileSiteKey ? (
        <div ref={turnstileContainerRef} aria-label="Cloudflare Turnstile challenge" />
      ) : (
        <p className="text-xs" style={{ color: "var(--text-concrete)" }}>
          (Spam protection inactive — set TURNSTILE_SITE_KEY env var.)
        </p>
      )}

      {status === "error" && errorMessage && (
        <div
          className="p-4 text-sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--hairline-strong)",
            color: "var(--text)",
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting" || (Boolean(turnstileSiteKey) && !token)}
          className="kopf-btn kopf-btn--solid disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Sending…" : "Submit"}
        </button>
        {Boolean(turnstileSiteKey) && !token && (
          <span
            className="text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.18em]"
            style={{ color: "var(--text-concrete)" }}
          >
            Complete the spam check above
          </span>
        )}
      </div>

      <p
        className="mt-4 text-xs font-[var(--font-jetbrains)] leading-relaxed tracking-[0.08em]"
        style={{ color: "var(--text-concrete)" }}
      >
        *By providing a telephone number and submitting this form you are consenting to
        be contacted by SMS text message. Message &amp; data rates may apply. You can
        reply STOP to opt-out of further messaging.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="kopf-eyebrow block mb-2">{label}</span>
      <input
        required={required}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 focus:outline-none transition"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      />
    </label>
  );
}
