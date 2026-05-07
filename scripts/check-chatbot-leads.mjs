// Quick diagnostic: dump recent contact_submissions with source='chatbot'
// to see whether they're being recorded at all and what disposition they got.

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

const rows = await sql`
  SELECT created_at, first_name, email, disposition, disposition_reason, extra_fields
  FROM contact_submissions
  WHERE source = 'chatbot'
  ORDER BY created_at DESC
  LIMIT 20
`;

console.log(`Recent chatbot submissions: ${rows.length}\n`);
for (const r of rows) {
  console.log(`${r.created_at}  ${r.disposition}  ${r.first_name} <${r.email}>`);
  if (r.disposition_reason) console.log(`  reason: ${r.disposition_reason}`);
  if (r.extra_fields) console.log(`  extras: ${JSON.stringify(r.extra_fields).slice(0, 200)}`);
  console.log("");
}
