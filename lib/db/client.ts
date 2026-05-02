/**
 * Postgres client (Vercel Postgres / Neon).
 *
 * Vercel auto-injects DATABASE_URL (Neon's serverless connection string) when
 * the project is connected to a Vercel Postgres database. Locally, copy it
 * via `vercel env pull .env.development.local`.
 *
 * We expose:
 *   sql`...` — tagged template for safe parameterised queries
 *   isDbConfigured() — true if DATABASE_URL is set, used by API routes to
 *                      gracefully degrade before the DB is provisioned.
 */

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export function isDbConfigured(): boolean {
  return Boolean(url);
}

// Lazy init so importing this module doesn't crash builds when no DATABASE_URL
// is set (e.g. local dev before `vercel env pull`, or CI builds).
let _sql: ReturnType<typeof neon> | null = null;

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision Vercel Postgres and pull env vars.",
    );
  }
  if (!_sql) _sql = neon(url);
  return _sql(strings, ...values);
}

/** Direct query helper for cases where you need the client (transactions etc). */
export function getClient() {
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!_sql) _sql = neon(url);
  return _sql;
}

/**
 * Run a raw SQL query with positional parameters (e.g. `$1`, `$2`).
 *
 * Use this when you need to compose dynamic WHERE clauses — e.g. the admin
 * inquiries dashboard where the filter set is variable. For typical queries
 * with fixed shape, prefer the `sql` tagged template (sanitizes inputs by
 * default).
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!_sql) _sql = neon(url);
  // neon's function-shaped client accepts (text, params, options) for raw
  // parameterized queries. Returns rows directly.
  // @ts-expect-error — neon's type defs prefer the tagged-template form,
  // but the runtime function does accept positional args.
  return (await _sql(text, params)) as T[];
}
