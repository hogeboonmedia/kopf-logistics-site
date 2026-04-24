#!/usr/bin/env node
/**
 * One-shot migration runner.
 *
 * Reads every `lib/db/migrations/*.sql` file, splits on `;`, and executes
 * each statement through @neondatabase/serverless. Used because Neon's
 * HTTP query interface only accepts a single statement per request, so
 * running migrations through the Vercel SQL editor is one statement at a
 * time — slow and error-prone.
 *
 * Usage:
 *   vercel env pull .env.local
 *   node scripts/run-migrations.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

// Minimal .env.local loader (keeps us from adding `dotenv` as a dep)
function loadEnv(path) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* file missing is fine */
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

loadEnv(join(projectRoot, ".env.local"));
loadEnv(join(projectRoot, ".env.development.local"));

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!url) {
  console.error(
    "No DATABASE_URL found. Run: vercel env pull .env.local",
  );
  process.exit(1);
}

const sql = neon(url);

/** Split a SQL file into individual statements.
 * Naive but handles the common cases: skips lines starting with `--`
 * and splits on `;` at the end of a line. Strings/blocks with embedded
 * semicolons would need a real parser, but our migrations don't have those. */
function splitStatements(file) {
  // Strip block + line comments, then split on `;`. Keep the trailing
  // semicolon because Postgres tolerates it.
  const noBlockComments = file.replace(/\/\*[\s\S]*?\*\//g, "");
  const noLineComments = noBlockComments
    .split("\n")
    .map((l) => (l.trim().startsWith("--") ? "" : l))
    .join("\n");
  return noLineComments
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const migrationsDir = join(projectRoot, "lib", "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(
  `Running ${files.length} migration${files.length === 1 ? "" : "s"} against ${url.replace(/:[^:@]+@/, ":***@")}\n`,
);

let total = 0;
let failed = 0;

for (const file of files) {
  const path = join(migrationsDir, file);
  const content = readFileSync(path, "utf8");
  const statements = splitStatements(content);

  console.log(`▸ ${file}  (${statements.length} statements)`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    try {
      // neon() can execute arbitrary SQL via the function-call form
      await sql.query(stmt);
      total++;
      console.log(`  ✓ ${i + 1}. ${preview}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${i + 1}. ${preview}`);
      console.error(`      ${err.message}`);
    }
  }
  console.log("");
}

console.log(
  `\nDone. ${total} statements OK, ${failed} failed.`,
);
process.exit(failed === 0 ? 0 : 1);
