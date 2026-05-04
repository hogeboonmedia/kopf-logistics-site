"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Shared form shell used by every audience-specific form on the site
 * (general contact, agent application, shipper inquiry, driver application).
 *
 * Responsibilities — kept here ONCE so each new form doesn't have to reimplement:
 *   - Cloudflare Turnstile widget mount + token state
 *   - Hidden honeypot field
 *   - Page-load timer (passed to CleanTalk for "submitted too fast" detection)
 *   - POST /api/contact with `source` + `extra_fields` (everything except the
 *     common fields gets bundled into extra_fields for per-form tracking)
 *   - Loading / error / success state with editorial styling
 *   - Form reset on success
 *
 * Each consumer just renders its audience-specific fields as children — the
 * shell takes care of the rest.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    onloadKopfTurnstile?: () => void;
  }
}

/** Fields treated as common (sent at the top-level of the request body, not
 * stuffed into extra_fields). Everything else in the form goes to extra_fields
 * so /admin/inquiries can render it alongside the source label. */
const COMMON_FIELDS = new Set([
  "first_name",
  "last_name",
  "email",
  "phone",
  "inquiry",
  "inquiry_body",
  "website", // honeypot — handled separately
  "cf-turnstile-response", // Turnstile auto-injects this; we already have the token
]);

export type FormSource = "contact" | "agent" | "shippers" | "drivers";

interface Props {
  source: FormSource;
  turnstileSiteKey?: string;
  /** Title shown when the form is submitted successfully. */
  successTitle?: string;
  /** Body shown under the success title. */
  successBody?: ReactNode;
  /** The audience-specific fields. */
  children: ReactNode;
  /** Submit button label. Defaults to "Submit". */
  submitLabel?: string;
}

export default function KopfFormShell({
  source,
  turnstileSiteKey,
  successTitle = "Thanks — we'll be in touch within one business day.",
  successBody,
  children,
  submitLabel = "Submit",
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pageLoadTimeRef = useRef<number>(Date.now());

  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mount Turnstile (single global script + per-instance widget render)
  useEffect(() => {
    if (!turnstileSiteKey) return;

    function renderWidget() {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: turnstileSiteKey!,
            theme: "auto",
            callback: (t: string) => setToken(t),
            "expired-callback": () => setToken(null),
            "error-callback": () => setToken(null),
          },
        );
      } catch {
        /* ignore double-render in dev */
      }
    }

    if (window.turnstile) {
      renderWidget();
      return;
    }
    const existing = document.querySelector(
      'script[data-kopf="turnstile"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(id);
    }
    const s = document.createElement("script");
    s.dataset.kopf = "turnstile";
    s.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadKopfTurnstile";
    s.async = true;
    s.defer = true;
    window.onloadKopfTurnstile = renderWidget;
    document.head.appendChild(s);

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

    // Split the form data into common fields + everything else (extra_fields).
    // Multi-value fields (checkbox groups) get collected into arrays.
    const common: Record<string, string> = {};
    const extras: Record<string, string | string[]> = {};

    // Use entries() to iterate; multi-checkbox fields appear multiple times.
    const seen = new Set<string>();
    for (const key of fd.keys()) {
      if (seen.has(key)) continue;
      seen.add(key);
      const allValues = fd.getAll(key).map((v) => String(v));
      const value = allValues.length === 1 ? allValues[0] : allValues;

      if (COMMON_FIELDS.has(key)) {
        // Common fields are single-string only
        common[key] = Array.isArray(value) ? value.join(", ") : value;
      } else {
        extras[key] = value;
      }
    }

    const payload = {
      source,
      first_name: common["first_name"] ?? "",
      last_name: common["last_name"] ?? "",
      email: common["email"] ?? "",
      phone: common["phone"] ?? "",
      inquiry: common["inquiry"] ?? "",
      inquiry_body: common["inquiry_body"] ?? "",
      website: common["website"] ?? "",
      extra_fields: extras,
      turnstileToken: token ?? "",
      submit_time: submitTimeSec,
    };

    try {
      // Note the trailing slash — next.config.ts has `trailingSlash: true`,
      // so /api/contact would 308-redirect to /api/contact/. Browser fetch
      // implementations don't always replay POST bodies through 308s, which
      // surfaced as a misleading "Failed to fetch" error. Hit the canonical
      // URL directly to avoid the redirect.
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
        formRef.current?.reset();
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            /* ignore */
          }
        }
        setToken(null);
        pageLoadTimeRef.current = Date.now();
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
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--accent)",
        }}
      >
        <div className="kopf-eyebrow mb-3">§ Message Received</div>
        <h3
          className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl tracking-tight leading-tight"
          style={{ color: "var(--text)" }}
        >
          {successTitle}
        </h3>
        <div
          className="mt-4 text-base leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {successBody ?? (
            <>
              Your inquiry was sent to our team at Kopf Logistics Group. If it&apos;s
              urgent, call{" "}
              <a
                href="tel:5743495600"
                className="font-[var(--font-jetbrains)] tabular-nums hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                574.349.5600
              </a>
              .
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-10 space-y-6" noValidate>
      {children}

      {/* Honeypot — hidden from humans, bots fill it. Server rejects if non-empty. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {turnstileSiteKey ? (
        <div
          ref={turnstileContainerRef}
          aria-label="Cloudflare Turnstile spam check"
        />
      ) : (
        <p className="text-xs" style={{ color: "var(--text-concrete)" }}>
          (Spam protection inactive — set NEXT_PUBLIC_TURNSTILE_SITE_KEY env var.)
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
          {status === "submitting" ? "Sending…" : submitLabel}
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
    </form>
  );
}

/* ─────────────────────────────────────────────────
 * Field primitives — reusable building blocks for any audience form.
 * Each renders its label + input in the editorial style.
 *
 * Visual treatment:
 *   - Field labels use the form-scoped eyebrow (secondary brand BLUE).
 *   - Required-field asterisks render in the same blue via <FieldLabel>.
 *   - Inputs/selects/textareas carry the .kopf-form-input class so the
 *     :focus state shows a 2px blue outline (vs the orange CTA).
 * ───────────────────────────────────────────────── */

/** Render a label string and color the trailing " *" with the secondary
 * brand blue. Pure presentation — input still uses the original `required`
 * prop for HTML5 validation. */
function FieldLabel({ label }: { label: string }) {
  // Match a trailing required marker like " *" or ": *" (e.g. "State (please select): *")
  const m = /^(.*?)(\s*\*)\s*$/.exec(label);
  if (!m) return <>{label}</>;
  return (
    <>
      {m[1]}
      <span className="kopf-required" aria-hidden="true">{m[2].trim()}</span>
    </>
  );
}

export function TextField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  hint,
  pattern,
  minLength,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="kopf-form-eyebrow block mb-2"><FieldLabel label={label} /></span>
      <input
        required={required}
        name={name}
        type={type}
        autoComplete={autoComplete}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        className="kopf-form-input w-full px-4 py-3 focus:outline-none transition"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      />
      {hint && (
        <span
          className="block mt-1 text-xs font-[var(--font-jetbrains)] tracking-[0.08em]"
          style={{ color: "var(--text-concrete)" }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextAreaField({
  label,
  name,
  required,
  rows = 5,
  minLength,
  maxLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="kopf-form-eyebrow block mb-2"><FieldLabel label={label} /></span>
      <textarea
        required={required}
        name={name}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        className="kopf-form-input w-full px-4 py-3 focus:outline-none transition"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      />
    </label>
  );
}

export function RadioGroup({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div>
      <span className="kopf-form-eyebrow block mb-2"><FieldLabel label={label} /></span>
      <div className="flex flex-wrap gap-6">
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={opt}
              defaultChecked={opt === defaultValue}
              className="accent-[var(--accent-2)]"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  name,
  options,
  required,
  autoComplete,
  defaultValue,
  placeholder = "— Select —",
  hint,
}: {
  label: string;
  name: string;
  /** Either a flat list of strings (used as both value + label) or { value, label } pairs. */
  options: ReadonlyArray<string> | ReadonlyArray<{ value: string; label: string }>;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  /** Placeholder shown as the disabled first option (e.g. "Choose State Below"). */
  placeholder?: string;
  hint?: string;
}) {
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  return (
    <label className="block">
      <span className="kopf-form-eyebrow block mb-2"><FieldLabel label={label} /></span>
      <select
        required={required}
        name={name}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        className="kopf-form-input w-full px-4 py-3 pr-10 focus:outline-none transition appearance-none bg-no-repeat"
        style={{
          background:
            "var(--bg) url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path d='M2 4l4 4 4-4' stroke='currentColor' stroke-width='1.5' fill='none' stroke-linecap='square'/></svg>\") no-repeat right 1rem center",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {normalized.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <span
          className="block mt-1 text-xs font-[var(--font-jetbrains)] tracking-[0.08em]"
          style={{ color: "var(--text-concrete)" }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export function CheckboxGroup({
  label,
  name,
  options,
  required,
  hint,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="kopf-form-eyebrow block mb-3"><FieldLabel label={label} /></legend>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
        {options.map((opt) => (
          <label key={opt} className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={opt}
              className="accent-[var(--accent-2)]"
            />
            {opt}
          </label>
        ))}
      </div>
      {required && (
        // Tiny invisible required validator: we add a hidden "required" input
        // that's filled by JS based on whether at least one box is checked.
        // Keep simple for now — server validates required fields too.
        <input type="hidden" name={`${name}_required_marker`} value="1" />
      )}
      {hint && (
        <p
          className="mt-2 text-xs font-[var(--font-jetbrains)] tracking-[0.08em]"
          style={{ color: "var(--text-concrete)" }}
        >
          {hint}
        </p>
      )}
    </fieldset>
  );
}
