/**
 * /admin/moderate — Comment moderation queue.
 *
 * Default view: pending + spam comments grouped by post, newest first.
 * "Approved" tab lets Marissa un-approve a comment if needed.
 *
 * Auth gated by middleware.ts. CommentRowActions is a client component that
 * calls /api/admin/comments/[id] for approve/spam/delete.
 */

import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/server";
import { isDbConfigured, sql } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";
import CommentRowActions from "@/components/admin/CommentRowActions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CommentRow {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  body: string;
  status: "pending" | "spam" | "approved";
  created_at: string;
  ip: string | null;
  geo_country: string | null;
  geo_city: string | null;
  cleantalk_verdict: string | null;
  cleantalk_reason: string | null;
  user_agent: string | null;
}

const TABS = ["queue", "approved", "all"] as const;
type Tab = (typeof TABS)[number];

export default async function ModeratePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const tab: Tab =
    params.tab && (TABS as readonly string[]).includes(params.tab) ? (params.tab as Tab) : "queue";

  if (!isDbConfigured()) {
    return (
      <AdminShell session={session} active="moderate">
        <p style={{ color: "var(--text-muted)" }}>
          Database not yet configured. See /admin/inquiries for setup steps.
        </p>
      </AdminShell>
    );
  }

  let rows: CommentRow[];
  if (tab === "approved") {
    rows = (await sql`
      SELECT id::text, post_slug, author_name, author_email, body, status, created_at,
             ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, cleantalk_reason, user_agent
      FROM comments
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 100
    `) as CommentRow[];
  } else if (tab === "all") {
    rows = (await sql`
      SELECT id::text, post_slug, author_name, author_email, body, status, created_at,
             ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, cleantalk_reason, user_agent
      FROM comments
      ORDER BY created_at DESC
      LIMIT 200
    `) as CommentRow[];
  } else {
    rows = (await sql`
      SELECT id::text, post_slug, author_name, author_email, body, status, created_at,
             ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, cleantalk_reason, user_agent
      FROM comments
      WHERE status IN ('pending','spam')
      ORDER BY created_at DESC
      LIMIT 200
    `) as CommentRow[];
  }

  const counts = (await sql`
    SELECT status, COUNT(*)::int AS n FROM comments GROUP BY status
  `) as Array<{ status: string; n: number }>;
  const totals = counts.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = r.n;
    return acc;
  }, {});

  return (
    <AdminShell session={session} active="moderate">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="kopf-chapter">§ Moderate</span>
          <span className="h-px w-10" style={{ background: "var(--accent)" }} />
          <span className="kopf-eyebrow">Comment review queue</span>
        </div>
        <h1
          className="font-[var(--font-anton)] uppercase tracking-tight text-4xl md:text-5xl"
          style={{ color: "var(--text)" }}
        >
          Comments
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Pending" value={totals["pending"] ?? 0} accent={(totals["pending"] ?? 0) > 0} />
        <Stat label="Spam (logged)" value={totals["spam"] ?? 0} />
        <Stat label="Approved (live)" value={totals["approved"] ?? 0} />
      </div>

      <div className="flex gap-1 mb-6">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/moderate/?tab=${t}`}
            className="px-4 py-2 text-xs uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition"
            style={{
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "var(--on-accent)" : "var(--text-muted)",
              border: "1px solid " + (tab === t ? "var(--accent)" : "var(--hairline-strong)"),
            }}
          >
            {t === "queue"
              ? "Queue (Pending + Spam)"
              : t === "approved"
                ? "Approved"
                : "All"}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div
          className="p-12 text-center"
          style={{
            border: "1px solid var(--hairline-strong)",
            color: "var(--text-muted)",
          }}
        >
          {tab === "queue" ? "Inbox zero. No comments need review." : "No comments yet."}
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((c) => (
            <li
              key={c.id}
              className="p-5"
              style={{
                background: "var(--bg-elevated)",
                border:
                  "1px solid " +
                  (c.status === "spam"
                    ? "color-mix(in srgb, #c0392b 60%, transparent)"
                    : "var(--hairline-strong)"),
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-[var(--font-anton)] uppercase tracking-tight text-lg" style={{ color: "var(--text)" }}>
                    {c.author_name}
                    {" · "}
                    <a
                      href={`mailto:${c.author_email}`}
                      className="text-sm font-[var(--font-inter)]"
                      style={{ color: "var(--accent)" }}
                    >
                      {c.author_email}
                    </a>
                  </div>
                  <div
                    className="mt-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "var(--text-concrete)" }}
                  >
                    On{" "}
                    <Link
                      href={`/${c.post_slug}/`}
                      target="_blank"
                      style={{ color: "var(--text-muted)", textDecoration: "underline" }}
                    >
                      {c.post_slug}
                    </Link>
                    {" · "}
                    {new Date(c.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <p
                className="text-base leading-relaxed whitespace-pre-wrap mb-4"
                style={{ color: "var(--text)" }}
              >
                {c.body}
              </p>

              <div
                className="grid md:grid-cols-2 gap-2 mb-4 text-[10px] font-[var(--font-jetbrains)] tabular-nums"
                style={{ color: "var(--text-concrete)" }}
              >
                <div>
                  IP <strong>{c.ip ?? "?"}</strong>{" · "}
                  {c.geo_city ?? "?"}, {c.geo_country ?? "??"}
                </div>
                <div>
                  CleanTalk <strong>{c.cleantalk_verdict ?? "—"}</strong>
                  {c.cleantalk_reason ? ` (${c.cleantalk_reason})` : ""}
                </div>
                {c.user_agent && (
                  <div className="md:col-span-2 truncate">
                    UA: {c.user_agent}
                  </div>
                )}
              </div>

              <CommentRowActions id={c.id} currentStatus={c.status} />
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="p-4"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid " + (accent ? "var(--accent)" : "var(--hairline-strong)"),
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
        style={{ color: "var(--text-concrete)" }}
      >
        {label}
      </div>
      <div
        className="font-[var(--font-anton)] text-3xl tracking-tight mt-1"
        style={{ color: accent ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "spam" | "approved" }) {
  const tones = {
    pending: { bg: "color-mix(in srgb, #d4a52a 25%, transparent)", fg: "#fcd97a" },
    spam: { bg: "color-mix(in srgb, #c0392b 25%, transparent)", fg: "#ff8b80" },
    approved: { bg: "color-mix(in srgb, var(--accent) 15%, transparent)", fg: "var(--accent)" },
  };
  const t = tones[status];
  return (
    <span
      className="inline-block px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
      style={{ background: t.bg, color: t.fg }}
    >
      {status}
    </span>
  );
}
