/**
 * /admin/inquiries — Marissa's contact-form submission dashboard.
 *
 * Lists every submission (sent and blocked) with geo + IP + disposition.
 * Replaces the WPForms submission UI. Auth-gated by middleware.ts; we also
 * call requireAdminSession() here for defence in depth.
 */

import { requireAdminSession } from "@/lib/auth/server";
import { isDbConfigured, sql } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";
import InquiryRowActions from "@/components/admin/InquiryRowActions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Submission {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  inquiry: string | null;
  body: string;
  disposition: string;
  disposition_reason: string | null;
  ip: string | null;
  geo_country: string | null;
  geo_city: string | null;
  cleantalk_verdict: string | null;
  created_at: string;
}

const DISPOSITION_LABEL: Record<string, { label: string; tone: "good" | "bad" | "warn" }> = {
  sent: { label: "Sent", tone: "good" },
  blocked_country: { label: "Blocked · Country", tone: "bad" },
  blocked_ip: { label: "Blocked · IP", tone: "bad" },
  blocked_keyword: { label: "Blocked · Keyword", tone: "bad" },
  blocked_cleantalk: { label: "Blocked · CleanTalk", tone: "bad" },
  blocked_honeypot: { label: "Blocked · Honeypot", tone: "bad" },
  blocked_turnstile: { label: "Blocked · Turnstile", tone: "bad" },
  blocked_rate_limit: { label: "Blocked · Rate Limit", tone: "bad" },
  send_failed: { label: "Send Failed", tone: "warn" },
};

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ disposition?: string; country?: string; q?: string }>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;

  if (!isDbConfigured()) {
    return (
      <AdminShell session={session} active="inquiries">
        <DbNotConfigured />
      </AdminShell>
    );
  }

  const filterDisposition = params.disposition?.trim() || null;
  const filterCountry = params.country?.trim().toUpperCase() || null;
  const filterQ = params.q?.trim() || null;

  // Build the WHERE clause inline because the neon `sql` template doesn't
  // support dynamic ANDed conditions cleanly. We always cap at 200 rows.
  let rows: Submission[];
  if (filterDisposition && filterCountry && filterQ) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE disposition = ${filterDisposition}
        AND geo_country = ${filterCountry}
        AND (body ILIKE ${"%" + filterQ + "%"} OR email ILIKE ${"%" + filterQ + "%"})
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterDisposition && filterCountry) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE disposition = ${filterDisposition} AND geo_country = ${filterCountry}
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterDisposition && filterQ) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE disposition = ${filterDisposition}
        AND (body ILIKE ${"%" + filterQ + "%"} OR email ILIKE ${"%" + filterQ + "%"})
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterCountry && filterQ) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE geo_country = ${filterCountry}
        AND (body ILIKE ${"%" + filterQ + "%"} OR email ILIKE ${"%" + filterQ + "%"})
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterDisposition) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE disposition = ${filterDisposition}
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterCountry) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE geo_country = ${filterCountry}
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else if (filterQ) {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      WHERE body ILIKE ${"%" + filterQ + "%"} OR email ILIKE ${"%" + filterQ + "%"}
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  } else {
    rows = (await sql`
      SELECT id::text, first_name, last_name, email, phone, inquiry, body,
             disposition, disposition_reason, ip::text AS ip, geo_country, geo_city,
             cleantalk_verdict, created_at
      FROM contact_submissions
      ORDER BY created_at DESC LIMIT 200
    `) as Submission[];
  }

  const stats = (await sql`
    SELECT disposition, COUNT(*)::int AS n
    FROM contact_submissions
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY disposition
  `) as Array<{ disposition: string; n: number }>;
  const totals = stats.reduce<Record<string, number>>((acc, s) => {
    acc[s.disposition] = s.n;
    return acc;
  }, {});

  return (
    <AdminShell session={session} active="inquiries">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="kopf-chapter">§ Inquiries</span>
          <span className="h-px w-10" style={{ background: "var(--accent)" }} />
          <span className="kopf-eyebrow">Last 200 contact form submissions</span>
        </div>
        <h1
          className="font-[var(--font-anton)] uppercase tracking-tight text-4xl md:text-5xl"
          style={{ color: "var(--text)" }}
        >
          Contact Submissions
        </h1>
      </div>

      {/* 30-day stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat label="Sent (30d)" value={totals["sent"] ?? 0} tone="good" />
        <Stat
          label="Blocked: CleanTalk (30d)"
          value={totals["blocked_cleantalk"] ?? 0}
          tone="bad"
        />
        <Stat
          label="Blocked: Geo / IP (30d)"
          value={(totals["blocked_country"] ?? 0) + (totals["blocked_ip"] ?? 0)}
          tone="bad"
        />
        <Stat
          label="Blocked: Honeypot / Turnstile / Keyword"
          value={
            (totals["blocked_honeypot"] ?? 0) +
            (totals["blocked_turnstile"] ?? 0) +
            (totals["blocked_keyword"] ?? 0)
          }
          tone="bad"
        />
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6 items-end">
        <Field label="Search body / email" name="q" defaultValue={filterQ ?? ""} />
        <Field
          label="Country (ISO)"
          name="country"
          defaultValue={filterCountry ?? ""}
          width="w-24"
        />
        <Select
          label="Disposition"
          name="disposition"
          defaultValue={filterDisposition ?? ""}
          options={[
            { value: "", label: "All" },
            { value: "sent", label: "Sent" },
            { value: "blocked_country", label: "Blocked · Country" },
            { value: "blocked_ip", label: "Blocked · IP" },
            { value: "blocked_keyword", label: "Blocked · Keyword" },
            { value: "blocked_cleantalk", label: "Blocked · CleanTalk" },
            { value: "blocked_honeypot", label: "Blocked · Honeypot" },
            { value: "blocked_turnstile", label: "Blocked · Turnstile" },
            { value: "blocked_rate_limit", label: "Blocked · Rate Limit" },
            { value: "send_failed", label: "Send Failed" },
          ]}
        />
        <button type="submit" className="kopf-btn kopf-btn--solid">
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto" style={{ border: "1px solid var(--hairline-strong)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-elevated)" }}>
            <tr className="text-left font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]">
              <Th>When</Th>
              <Th>Name + Email</Th>
              <Th>Body</Th>
              <Th>Origin</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No submissions match these filters yet.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const disp = DISPOSITION_LABEL[r.disposition] ?? {
                label: r.disposition,
                tone: "warn" as const,
              };
              return (
                <tr key={r.id} style={{ borderTop: "1px solid var(--hairline)" }}>
                  <Td>
                    <div
                      className="font-[var(--font-jetbrains)] text-xs tabular-nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(r.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </Td>
                  <Td>
                    <div style={{ color: "var(--text)" }}>
                      {r.first_name} {r.last_name ?? ""}
                    </div>
                    <a
                      href={`mailto:${r.email}`}
                      className="text-xs hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {r.email}
                    </a>
                    {r.phone && (
                      <div
                        className="text-xs font-[var(--font-jetbrains)] tabular-nums"
                        style={{ color: "var(--text-concrete)" }}
                      >
                        {r.phone}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div
                      className="text-sm leading-snug max-w-md line-clamp-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {r.body}
                    </div>
                    {r.inquiry && (
                      <div
                        className="mt-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)]"
                        style={{ color: "var(--text-concrete)" }}
                      >
                        Prefers: {r.inquiry}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div
                      className="font-[var(--font-jetbrains)] text-xs tabular-nums"
                      style={{ color: "var(--text)" }}
                    >
                      {r.geo_city ?? "?"}, {r.geo_country ?? "??"}
                    </div>
                    <div
                      className="font-[var(--font-jetbrains)] text-[10px] tabular-nums"
                      style={{ color: "var(--text-concrete)" }}
                    >
                      {r.ip ?? "no IP"}
                    </div>
                  </Td>
                  <Td>
                    <span
                      className="inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)]"
                      style={{
                        background:
                          disp.tone === "good"
                            ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                            : disp.tone === "bad"
                              ? "color-mix(in srgb, #c0392b 25%, transparent)"
                              : "color-mix(in srgb, #d4a52a 25%, transparent)",
                        color:
                          disp.tone === "good"
                            ? "var(--accent)"
                            : disp.tone === "bad"
                              ? "#ff8b80"
                              : "#fcd97a",
                      }}
                    >
                      {disp.label}
                    </span>
                    {r.cleantalk_verdict && r.cleantalk_verdict !== "allow" && (
                      <div
                        className="mt-1 text-[10px] font-[var(--font-jetbrains)] tabular-nums"
                        style={{ color: "var(--text-concrete)" }}
                      >
                        CleanTalk: {r.cleantalk_verdict}
                      </div>
                    )}
                    {r.disposition_reason && (
                      <div
                        className="mt-1 text-[10px]"
                        style={{ color: "var(--text-concrete)" }}
                      >
                        {r.disposition_reason}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <InquiryRowActions ip={r.ip} country={r.geo_country} />
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "bad";
}) {
  return (
    <div
      className="p-4"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--hairline-strong)",
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
        style={{ color: tone === "good" ? "var(--accent)" : "var(--text)" }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}

function Field({
  label,
  name,
  defaultValue,
  width = "w-56",
}: {
  label: string;
  name: string;
  defaultValue: string;
  width?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${width}`}>
      <span
        className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
        style={{ color: "var(--text-concrete)" }}
      >
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className="px-3 py-2 text-sm focus:outline-none"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
        style={{ color: "var(--text-concrete)" }}
      >
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="px-3 py-2 text-sm focus:outline-none"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          color: "var(--text)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DbNotConfigured() {
  return (
    <div
      className="max-w-2xl mx-auto p-8"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--accent)" }}
    >
      <h2
        className="font-[var(--font-anton)] uppercase text-2xl tracking-tight"
        style={{ color: "var(--text)" }}
      >
        Database not yet configured
      </h2>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Provision Vercel Postgres and set <code>DATABASE_URL</code> as an env var, then
        run <code>psql $DATABASE_URL -f lib/db/migrations/002_contact_submissions.sql</code>{" "}
        and <code>003_blocklists.sql</code>. Once that's done, this page will show every
        contact form submission and let you block IPs / countries / keywords with one click.
      </p>
    </div>
  );
}
