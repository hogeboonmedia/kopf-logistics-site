/**
 * Marissa-editable blocklists for countries, IPs, and keywords.
 *
 * Used by both the contact form and the comment submission endpoint to
 * reject obvious bad-actor submissions before they hit CleanTalk (saves
 * API quota) and before they reach Resend (saves email volume).
 *
 * Reads come from Postgres but are cached in-memory for 60s so a comment
 * submission doesn't pay a DB round-trip on every request.
 */

import { sql, isDbConfigured } from "@/lib/db/client";

const CACHE_TTL_MS = 60_000;

interface CachedSet<T> {
  data: Set<T>;
  expires: number;
}

let countryCache: CachedSet<string> | null = null;
let ipCache: CachedSet<string> | null = null;
let keywordCache: { data: string[]; expires: number } | null = null;

async function loadCountries(): Promise<Set<string>> {
  if (countryCache && countryCache.expires > Date.now()) return countryCache.data;
  if (!isDbConfigured()) return new Set();
  try {
    const rows = (await sql`SELECT country_code FROM blocked_countries`) as Array<{
      country_code: string;
    }>;
    const set = new Set(rows.map((r) => r.country_code.toUpperCase()));
    countryCache = { data: set, expires: Date.now() + CACHE_TTL_MS };
    return set;
  } catch {
    return new Set();
  }
}

async function loadIps(): Promise<Set<string>> {
  if (ipCache && ipCache.expires > Date.now()) return ipCache.data;
  if (!isDbConfigured()) return new Set();
  try {
    const rows = (await sql`SELECT ip::text AS ip FROM blocked_ips`) as Array<{
      ip: string;
    }>;
    const set = new Set(rows.map((r) => r.ip));
    ipCache = { data: set, expires: Date.now() + CACHE_TTL_MS };
    return set;
  } catch {
    return new Set();
  }
}

async function loadKeywords(): Promise<string[]> {
  if (keywordCache && keywordCache.expires > Date.now()) return keywordCache.data;
  if (!isDbConfigured()) return [];
  try {
    const rows = (await sql`SELECT keyword FROM blocked_keywords`) as Array<{
      keyword: string;
    }>;
    const list = rows.map((r) => r.keyword.toLowerCase());
    keywordCache = { data: list, expires: Date.now() + CACHE_TTL_MS };
    return list;
  } catch {
    return [];
  }
}

/** Invalidate all caches. Call this from admin write endpoints. */
export function invalidateBlocklistCache() {
  countryCache = null;
  ipCache = null;
  keywordCache = null;
}

export async function isBlockedCountry(code: string | null | undefined): Promise<boolean> {
  if (!code) return false;
  const set = await loadCountries();
  return set.has(code.toUpperCase());
}

export async function isBlockedIp(ip: string | null | undefined): Promise<boolean> {
  if (!ip) return false;
  // x-forwarded-for can be a comma-separated chain; first entry = client.
  const candidate = ip.split(",")[0].trim();
  const set = await loadIps();
  return set.has(candidate);
}

export async function containsBlockedKeyword(
  text: string | null | undefined,
): Promise<{ blocked: boolean; hit?: string }> {
  if (!text) return { blocked: false };
  const lc = text.toLowerCase();
  const list = await loadKeywords();
  for (const kw of list) {
    if (lc.includes(kw)) return { blocked: true, hit: kw };
  }
  return { blocked: false };
}

// ─────────────────────────────────────────────────
// Admin mutations (called from the moderation UI)
// ─────────────────────────────────────────────────

export async function addBlockedCountry(code: string, reason?: string, addedBy?: string) {
  await sql`
    INSERT INTO blocked_countries (country_code, reason, added_by)
    VALUES (${code.toUpperCase()}, ${reason ?? null}, ${addedBy ?? null})
    ON CONFLICT (country_code) DO UPDATE SET reason = EXCLUDED.reason
  `;
  invalidateBlocklistCache();
}

export async function removeBlockedCountry(code: string) {
  await sql`DELETE FROM blocked_countries WHERE country_code = ${code.toUpperCase()}`;
  invalidateBlocklistCache();
}

export async function addBlockedIp(ip: string, reason?: string, addedBy?: string) {
  await sql`
    INSERT INTO blocked_ips (ip, reason, added_by)
    VALUES (${ip}, ${reason ?? null}, ${addedBy ?? null})
    ON CONFLICT (ip) DO UPDATE SET reason = EXCLUDED.reason
  `;
  invalidateBlocklistCache();
}

export async function removeBlockedIp(ip: string) {
  await sql`DELETE FROM blocked_ips WHERE ip = ${ip}`;
  invalidateBlocklistCache();
}

export async function addBlockedKeyword(keyword: string, reason?: string, addedBy?: string) {
  await sql`
    INSERT INTO blocked_keywords (keyword, reason, added_by)
    VALUES (${keyword.toLowerCase()}, ${reason ?? null}, ${addedBy ?? null})
    ON CONFLICT (keyword) DO UPDATE SET reason = EXCLUDED.reason
  `;
  invalidateBlocklistCache();
}

export async function removeBlockedKeyword(keyword: string) {
  await sql`DELETE FROM blocked_keywords WHERE keyword = ${keyword.toLowerCase()}`;
  invalidateBlocklistCache();
}

// ─────────────────────────────────────────────────
// Read-all (for admin UI listing)
// ─────────────────────────────────────────────────

export async function listBlockedCountries() {
  if (!isDbConfigured()) return [];
  return (await sql`
    SELECT country_code, reason, added_at, added_by
    FROM blocked_countries
    ORDER BY added_at DESC
  `) as Array<{
    country_code: string;
    reason: string | null;
    added_at: string;
    added_by: string | null;
  }>;
}

export async function listBlockedIps() {
  if (!isDbConfigured()) return [];
  return (await sql`
    SELECT ip::text AS ip, reason, added_at, added_by
    FROM blocked_ips
    ORDER BY added_at DESC
  `) as Array<{
    ip: string;
    reason: string | null;
    added_at: string;
    added_by: string | null;
  }>;
}

export async function listBlockedKeywords() {
  if (!isDbConfigured()) return [];
  return (await sql`
    SELECT keyword, reason, added_at, added_by
    FROM blocked_keywords
    ORDER BY added_at DESC
  `) as Array<{
    keyword: string;
    reason: string | null;
    added_at: string;
    added_by: string | null;
  }>;
}
