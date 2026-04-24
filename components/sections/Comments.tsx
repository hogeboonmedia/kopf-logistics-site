"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Comments thread + submission form for a blog post.
 *
 * Data flow:
 *   - On mount, fetch /api/comments/<slug-encoded> to get approved comments.
 *   - User fills form (name + email + body) + Turnstile token, submits to /api/comments.
 *   - Optimistic UI: if the response says 'approved', prepend the new comment.
 *     If it says 'pending', show a "thanks, your comment will appear after review" banner.
 *
 * SEO: comments load client-side, so they don't add weight to the SSR HTML
 * payload. The post body itself is still server-rendered. Crawlers that don't
 * execute JS won't see comments — fine, they're not the primary content.
 */

interface CommentDto {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

declare global {
  interface Window {
    onloadTurnstileCallbackComments?: () => void;
  }
}

interface Props {
  /** Post slug as `YYYY/MM/<slug>` — no leading or trailing slashes. */
  postSlug: string;
  turnstileSiteKey?: string;
}

export default function Comments({ postSlug, turnstileSiteKey }: Props) {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // form state
  const formRef = useRef<HTMLFormElement | null>(null);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pageLoadRef = useRef<number>(Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "approved" | "pending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // load approved comments for this post
  useEffect(() => {
    let cancelled = false;
    const url = `/api/comments/${encodeURIComponent(postSlug)}`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.ok) setComments(j.comments as CommentDto[]);
        else setLoadError(j.error || "Couldn't load comments");
      })
      .catch((err) => {
        if (!cancelled) setLoadError((err as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  // mount Turnstile
  useEffect(() => {
    if (!turnstileSiteKey) return;
    function render() {
      if (!window.turnstile || !turnstileRef.current) return;
      try {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey!,
          theme: "auto",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(null),
          "error-callback": () => setToken(null),
        });
      } catch {
        /* ignore double-render */
      }
    }
    if (window.turnstile) {
      render();
      return;
    }
    const existing = document.querySelector(
      'script[data-kopf="turnstile"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          render();
        }
      }, 100);
      return () => clearInterval(id);
    } else {
      const s = document.createElement("script");
      s.dataset.kopf = "turnstile";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallbackComments";
      s.async = true;
      s.defer = true;
      window.onloadTurnstileCallbackComments = render;
      document.head.appendChild(s);
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
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);
    const submitTimeSec = Math.round((Date.now() - pageLoadRef.current) / 1000);

    const payload = {
      slug: postSlug,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      body: String(fd.get("body") ?? ""),
      website: String(fd.get("website") ?? ""),
      turnstileToken: token ?? "",
      submit_time: submitTimeSec,
    };

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: string;
        error?: string;
      };
      if (res.ok && json.ok) {
        if (json.status === "approved") {
          setStatus("approved");
          // Optimistic: prepend the new comment so it shows immediately
          setComments((prev) => [
            ...prev,
            {
              id: `optimistic-${Date.now()}`,
              author_name: payload.name,
              body: payload.body,
              created_at: new Date().toISOString(),
            },
          ]);
        } else {
          setStatus("pending");
        }
        formRef.current?.reset();
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            /* ignore */
          }
        }
        setToken(null);
        // Reset page-load time so the next submission's submit_time is fresh
        pageLoadRef.current = Date.now();
      } else {
        setStatus("error");
        setErrorMsg(json.error || `Submission failed (${res.status})`);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <section
      className="max-w-3xl mx-auto mt-16 pt-12"
      style={{ borderTop: "1px solid var(--hairline-strong)" }}
      aria-labelledby="comments-heading"
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="kopf-chapter">§ Discussion</span>
        <span className="h-px w-10" style={{ background: "var(--accent)" }} />
        <span className="kopf-eyebrow">
          {loading ? "Loading…" : `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`}
        </span>
      </div>

      <h2
        id="comments-heading"
        className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl tracking-tight leading-tight mb-8"
        style={{ color: "var(--text)" }}
      >
        Reader Comments
      </h2>

      {loadError && (
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Couldn&apos;t load comments: {loadError}
        </p>
      )}

      {comments.length > 0 && (
        <ol className="space-y-6 mb-12">
          {comments.map((c) => (
            <li
              key={c.id}
              className="pb-6"
              style={{ borderBottom: "1px solid var(--hairline)" }}
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span
                  className="font-[var(--font-anton)] uppercase tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  {c.author_name}
                </span>
                <time
                  dateTime={c.created_at}
                  className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--text-concrete)" }}
                >
                  {relativeTime(c.created_at)}
                </time>
              </div>
              <p
                className="leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--text-muted)" }}
              >
                {c.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Submission form */}
      <div
        className="p-6 md:p-8"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--hairline-strong)" }}
      >
        {status === "approved" ? (
          <div>
            <h3
              className="font-[var(--font-anton)] uppercase text-xl tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Thanks for joining the discussion.
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Your comment is now live above.
            </p>
          </div>
        ) : status === "pending" ? (
          <div>
            <h3
              className="font-[var(--font-anton)] uppercase text-xl tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Thanks — your comment will appear after review.
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              We hold a small fraction of comments for human review when our spam check
              is uncertain. We&apos;ll have it up shortly.
            </p>
          </div>
        ) : (
          <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
            <h3
              className="font-[var(--font-anton)] uppercase text-2xl tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Leave a Comment
            </h3>
            <p className="text-xs" style={{ color: "var(--text-concrete)" }}>
              Email is required for spam-checking but never displayed publicly.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="name"
                type="text"
                placeholder="Your name *"
                required
                minLength={2}
                maxLength={60}
                className="px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--hairline-strong)",
                  color: "var(--text)",
                }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email (not displayed) *"
                required
                className="px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--hairline-strong)",
                  color: "var(--text)",
                }}
              />
            </div>
            <textarea
              name="body"
              placeholder="Comment *"
              required
              rows={4}
              minLength={5}
              maxLength={2000}
              className="w-full px-3 py-2 text-sm focus:outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--hairline-strong)",
                color: "var(--text)",
              }}
            />

            {/* Honeypot */}
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
                Leave this empty
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {turnstileSiteKey ? (
              <div ref={turnstileRef} />
            ) : (
              <p className="text-xs" style={{ color: "var(--text-concrete)" }}>
                (Spam protection inactive — set TURNSTILE_SITE_KEY env var.)
              </p>
            )}

            {status === "error" && errorMsg && (
              <div
                className="p-3 text-sm"
                style={{ border: "1px solid var(--hairline-strong)", color: "var(--text)" }}
              >
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={
                  status === "submitting" || (Boolean(turnstileSiteKey) && !token)
                }
                className="kopf-btn kopf-btn--solid disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Posting…" : "Post Comment"}
              </button>
              {Boolean(turnstileSiteKey) && !token && (
                <span
                  className="text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-concrete)" }}
                >
                  Complete spam check
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
