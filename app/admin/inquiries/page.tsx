/**
 * /admin/inquiries — Marissa's contact-form submission dashboard.
 *
 * Lists every submission across every form on the site (general contact,
 * agent application, shipper inquiry, driver application). Each row is
 * tagged with a `source` so it's clear which form it came from. Filters
 * include source, disposition, geo country, and keyword search.
 *
 * Auth-gated by middleware.ts; we also requireAdminSession() here for
 * defence in depth.
 */

import { requireAdminSession } from "@/lib/auth/server";
import { isDbConfigured, query } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";
import InquiryRowActions from "@/components/admin/InquiryRowActions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Submission {
  id: string;
  source: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  inquiry: string | null;
  body: string;
  extra_fields: Record<string, unknown> | null;
  disposition: string;
  disposition_reason: string | null;
  ip: string | null;
  geo_country: string | null;
  geo_city: string | null;
  cleantalk_verdict: string | null;
  created_at: string;
}

const SOURCE_LABEL: Record<string, string> = {
  contact: "General Inquiry",
  agent: "Freight Agent Application",
  shippers: "Shipper Inquiry",
  drivers: "Driver Application",
};

const SOURCE_TONE: Record<string, string> = {
  contact: "var(--accent)",
  agent: "#7eb6ff",
  shippers: "#9ee493",
  drivers: "#ffb86b",
};

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
  searchParams: Promise<{
    source?: string;
    disposition?: string;
    country?: string;
    q?: string;
  }>;
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

  const filterSource = params.source?.trim() || null;
  const filterDisposition = params.disposition?.trim() || null;
  const filterCountry = params.country?.trim().toUpperCase() || null;
  const filterQ = params.q?.trim() || null;

  // Build dynamic WHERE clause + parameterized values via the underlying neon
  // client's .query() method (avoids the explosion of template-literal cases
  // that the old version of this page used to handle filter combinations).
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (filterSource) {
    values.push(filterSource);
    conditions.push(`source = $${values.length}`);
  }
  if (filterDisposition) {
    values.push(filterDisposition);
    conditions.push(`disposition = $${values.length}`);
  }
  if (filterCountry) {
    values.push(filterCountry);
    conditions.push(`geo_country = $${values.length}`);
  }
  if (filterQ) {
    values.push(`%${filterQ}%`);
    conditions.push(
      `(body ILIKE $${values.length} OR email ILIKE $${values.length} OR extra_fields::text ILIKE $${values.length})`,
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await query<Submission>(
    `SELECT id::text, source, first_name, last_name, email, phone, inquiry, body,
            extra_fields, disposition, disposition_reason, ip::text AS ip,
            geo_country, geo_city, cleantalk_verdict, created_at
     FROM contact_submissions
     ${where}
     ORDER BY created_at DESC LIMIT 200`,
    values,
  );

  // 30-day stats by source (sent only — for the per-source chips at the top)
  const sourceStatsRows = await query<{ source: string; n: number }>(
    `SELECT source, COUNT(*)::int AS n
     FROM contact_submissions
     WHERE disposition = 'sent' AND created_at > NOW() - INTERVAL '30 days'
     GROUP BY source`,
  );
  const sourceStats: Record<string, number> = {};
  for (const r of sourceStatsRows) sourceStats[r.source] = r.n;

  // 30-day stats by disposition (for the spam-blocked chips)
  const dispRows = await query<{ disposition: string; n: number }>(
    `SELECT disposition, COUNT(*)::int AS n
     FROM contact_submissions
     WHERE created_at > NOW() - INTERVAL '30 days'
     GROUP BY disposition`,
  );
  const dispTotals: Record<string, number> = {};
  for (const r of dispRows) dispTotals[r.disposition] = r.n;

  return (
    <AdminShell session={session} active="inquiries">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="kopf-chapter">§ Inquiries</span>
          <span className="h-px w-10" style={{ background: "var(--accent)" }} />
          <span className="kopf-eyebrow">Last 200 submissions across all forms</span>
        </div>
        <h1
          className="font-[var(--font-anton)] uppercase tracking-tight text-4xl md:text-5xl"
          style={{ color: "var(--text)" }}
        >
          Form Submissions
        </h1>
      </div>

      {/* Per-source 30-day stats — clicking jumps to that filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(["contact", "agent", "shippers", "drivers"] as const).map((src) => (
          <SourceStat
            key={src}
            source={src}
            label={SOURCE_LABEL[src]}
            value={sourceStats[src] ?? 0}
            color={SOURCE_TONE[src]}
            isActive={filterSource === src}
          />
        ))}
      </div>

      {/* Spam-blocked stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <SmallStat
          label="Blocked · CleanTalk (30d)"
          value={dispTotals["blocked_cleantalk"] ?? 0}
        />
        <SmallStat
          label="Blocked · Geo / IP (30d)"
          value={(dispTotals["blocked_country"] ?? 0) + (dispTotals["blocked_ip"] ?? 0)}
        />
        <SmallStat
          label="Blocked · Honeypot / Turnstile / Keyword"
          value={
            (dispTotals["blocked_honeypot"] ?? 0) +
            (dispTotals["blocked_turnstile"] ?? 0) +
            (dispTotals["blocked_keyword"] ?? 0)
          }
        />
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6 items-end">
        <Select
          label="Form"
          name="source"
          defaultValue={filterSource ?? ""}
          options={[
            { value: "", label: "All forms" },
            { value: "contact", label: "General Inquiry" },
            { value: "agent", label: "Agent Application" },
            { value: "shippers", label: "Shipper Inquiry" },
            { value: "drivers", label: "Driver Application" },
          ]}
        />
        <Field
          label="Search body / email / fields"
          name="q"
          defaultValue={filterQ ?? ""}
        />
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
      <div
        className="overflow-x-auto"
        style={{ border: "1px solid var(--hairline-strong)" }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-elevated)" }}>
            <tr className="text-left font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]">
              <Th>When</Th>
              <Th>Form</Th>
              <Th>Name + Email</Th>
              <Th>Body / Fields</Th>
              <Th>Origin</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
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
                    <span
                      className="inline-block px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)]"
                      style={{
                        background: `color-mix(in srgb, ${SOURCE_TONE[r.source] ?? "var(--accent)"} 18%, transparent)`,
                        color: SOURCE_TONE[r.source] ?? "var(--accent)",
                      }}
                    >
                      {SOURCE_LABEL[r.source] ?? r.source}
                    </span>
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
                    {r.body && r.body !== "" && (
                      <div
                        className="text-sm leading-snug max-w-md line-clamp-3 mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {r.body}
                      </div>
                    )}
                    {r.extra_fields && Object.keys(r.extra_fields).length > 0 && (
                      <ExtraFieldsList fields={r.extra_fields} />
                    )}
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

/** Renders the audience-specific extra_fields as a compact key/value block. */
function ExtraFieldsList({ fields }: { fields: Record<string, unknown> }) {
  const entries = Object.entries(fields).filter(
    ([, v]) => v !== null && v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0),
  );
  if (entries.length === 0) return null;
  return (
    <ul
      className="max-w-md mt-1 text-[11px] leading-snug font-[var(--font-jetbrains)]"
      style={{ color: "var(--text-muted)" }}
    >
      {entries.map(([k, v]) => (
        <li key={k}>
          <span style={{ color: "var(--text-concrete)" }}>{prettyKey(k)}:</span>{" "}
          <span style={{ color: "var(--text)" }}>
            {Array.isArray(v) ? v.join(", ") : String(v)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function prettyKey(k: string): string {
  return k
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SourceStat({
  source,
  label,
  value,
  color,
  isActive,
}: {
  source: string;
  label: string;
  value: number;
  color: string;
  isActive: boolean;
}) {
  return (
    <a
      href={isActive ? "/admin/inquiries/" : `/admin/inquiries/?source=${source}`}
      className="block p-4 transition hover:opacity-90"
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${isActive ? color : "var(--hairline-strong)"}`,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
        style={{ color: "var(--text-concrete)" }}
      >
        {label} (30d)
      </div>
      <div
        className="font-[var(--font-anton)] text-3xl tracking-tight mt-1"
        style={{ color }}
      >
        {value}
      </div>
      {isActive && (
        <div
          className="mt-2 text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
          style={{ color }}
        >
          ↻ Filtering · click to clear
        </div>
      )}
    </a>
  );
}

function SmallStat({ label, value }: { label: string; value: number }) {
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
        className="font-[var(--font-anton)] text-2xl tracking-tight mt-1"
        style={{ color: "var(--text)" }}
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
        Provision Vercel Postgres and run all migrations in{" "}
        <code>lib/db/migrations/</code>. Once that&apos;s done, this page will show every
        form submission grouped by source (general contact, agent, shipper, driver).
      </p>
    </div>
  );
}
