/**
 * /admin/blocklists — Manage country/IP/keyword blocklists.
 * Used by both the contact form and comment submission to silently reject
 * known bad sources.
 */

import { requireAdminSession } from "@/lib/auth/server";
import {
  listBlockedCountries,
  listBlockedIps,
  listBlockedKeywords,
} from "@/lib/blocklists";
import { isDbConfigured } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";
import BlocklistManager from "@/components/admin/BlocklistManager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function BlocklistsPage() {
  const session = await requireAdminSession();

  if (!isDbConfigured()) {
    return (
      <AdminShell session={session} active="blocklists">
        <p style={{ color: "var(--text-muted)" }}>
          Database not configured — see /admin/inquiries for setup instructions.
        </p>
      </AdminShell>
    );
  }

  const [countries, ips, keywords] = await Promise.all([
    listBlockedCountries(),
    listBlockedIps(),
    listBlockedKeywords(),
  ]);

  return (
    <AdminShell session={session} active="blocklists">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="kopf-chapter">§ Blocklists</span>
          <span className="h-px w-10" style={{ background: "var(--accent)" }} />
          <span className="kopf-eyebrow">Site-wide spam policy</span>
        </div>
        <h1
          className="font-[var(--font-anton)] uppercase tracking-tight text-4xl md:text-5xl"
          style={{ color: "var(--text)" }}
        >
          Blocklists
        </h1>
        <p className="mt-3 text-base leading-relaxed max-w-3xl" style={{ color: "var(--text-muted)" }}>
          Entries here apply to <strong>both</strong> the contact form and blog comments.
          Submissions matching any rule are silently dropped (the spammer sees a success
          response but nothing actually goes through). Edits take effect within ~60 seconds
          due to caching.
        </p>
      </div>

      <h2
        className="font-[var(--font-anton)] uppercase text-2xl tracking-tight mb-3"
        style={{ color: "var(--text)" }}
      >
        Countries
      </h2>
      <BlocklistManager
        kind="country"
        initial={countries.map((c) => ({
          value: c.country_code,
          reason: c.reason,
          added_at: c.added_at,
          added_by: c.added_by,
        }))}
        placeholder="Two-letter ISO code (e.g. PK)"
        description="Block submissions from specific countries. Use the ISO 3166-1 alpha-2 code (PK = Pakistan, CN = China, IN = India, RU = Russia)."
      />

      <h2
        className="font-[var(--font-anton)] uppercase text-2xl tracking-tight mb-3"
        style={{ color: "var(--text)" }}
      >
        IP Addresses
      </h2>
      <BlocklistManager
        kind="ip"
        initial={ips.map((c) => ({
          value: c.ip,
          reason: c.reason,
          added_at: c.added_at,
          added_by: c.added_by,
        }))}
        placeholder="IPv4 or IPv6 (e.g. 1.2.3.4)"
        description="Block submissions from specific IPs. Quickest way: spot a bad IP in /admin/inquiries and click 'Block this IP' on its row."
      />

      <h2
        className="font-[var(--font-anton)] uppercase text-2xl tracking-tight mb-3"
        style={{ color: "var(--text)" }}
      >
        Keywords
      </h2>
      <BlocklistManager
        kind="keyword"
        initial={keywords.map((c) => ({
          value: c.keyword,
          reason: c.reason,
          added_at: c.added_at,
          added_by: c.added_by,
        }))}
        placeholder="Phrase to ban (e.g. 'crypto investment')"
        description="Case-insensitive substring match against the message body. Stops obvious spam patterns before they reach CleanTalk."
      />
    </AdminShell>
  );
}
