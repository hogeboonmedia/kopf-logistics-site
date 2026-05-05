// One-shot migration runner — applies migration 005 (allow 'chatbot' source)
// against the production Neon Postgres using DATABASE_URL.
//
// Idempotent: drops the constraint if it exists, then re-adds it with
// 'chatbot' included. Safe to re-run.

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

console.log("Step 1/2: Dropping existing chk_source constraint (if any)...");
try {
  await sql.query(
    `ALTER TABLE contact_submissions DROP CONSTRAINT IF EXISTS chk_source`,
  );
  console.log("  ✓ ok\n");
} catch (err) {
  console.error("  ✗ failed:", err.message);
  process.exit(1);
}

console.log("Step 2/2: Adding chk_source constraint with 'chatbot' allowed...");
try {
  await sql.query(
    `ALTER TABLE contact_submissions ADD CONSTRAINT chk_source CHECK (source IN ('contact','agent','shippers','drivers','chatbot'))`,
  );
  console.log("  ✓ ok\n");
} catch (err) {
  console.error("  ✗ failed:", err.message);
  process.exit(1);
}

console.log("Verifying constraint...");
const rows = await sql`
  SELECT pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conname = 'chk_source'
`;
if (rows.length === 0) {
  console.error("  ✗ chk_source not found after migration");
  process.exit(1);
}
const def = rows[0].def;
console.log("  Definition:", def);
if (def.includes("'chatbot'")) {
  console.log("  ✓ 'chatbot' is now an allowed source");
  console.log("\nMigration 005 applied successfully.");
} else {
  console.error("  ✗ 'chatbot' missing from constraint definition");
  process.exit(1);
}
