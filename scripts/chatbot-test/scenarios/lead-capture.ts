/**
 * Lead capture E2E scenario runner.
 *
 * ONLY runs when --e2e is passed because it writes to the production DB.
 * Submits a test lead via /api/contact/, then verifies the row landed in
 * contact_submissions with the expected source and extra_fields.
 *
 * Test rows are flagged with extra_fields.test_run=true so they can be
 * filtered out in /admin/inquiries (or deleted in cleanup).
 */

import type {
  LeadCaptureScenario,
  TestResult,
  Assertion,
} from "../framework";
import { statusFromAssertions } from "../framework";

export async function runLeadCapture(
  scenario: LeadCaptureScenario,
  apiUrl: string,
): Promise<TestResult> {
  const assertions: Assertion[] = [];

  // Tag the payload so we can identify test rows later
  const payload = {
    ...scenario.payload,
    extra_fields: {
      ...((scenario.payload as { extra_fields?: Record<string, unknown> }).extra_fields || {}),
      test_run: true,
      test_run_id: scenario.id,
      test_run_ts: new Date().toISOString(),
    },
  };

  // Submit
  let httpStatus: number;
  let okFlag: boolean;
  try {
    const res = await fetch(`${apiUrl}/api/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    httpStatus = res.status;
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    okFlag = !!json.ok;

    assertions.push({
      name: "submit-http-200",
      description: "POST /api/contact returns HTTP 200 with ok:true",
      status: res.ok && okFlag ? "pass" : "fail",
      reason:
        res.ok && okFlag
          ? undefined
          : `HTTP ${httpStatus}, ok=${okFlag}, error=${json.error || "n/a"}.`,
      source: "scenarios/lead-capture.ts",
    });
  } catch (err) {
    assertions.push({
      name: "submit-reachable",
      description: "POST /api/contact reachable",
      status: "error",
      reason: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      source: "scenarios/lead-capture.ts",
    });
    return finalize(scenario, assertions);
  }

  // Verify the row exists in the DB. Lazy import @neondatabase/serverless
  // so this scenario doesn't drag the DB driver into other test runs.
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    assertions.push({
      name: "db-row-exists",
      description: "Submission row appears in contact_submissions",
      status: "skip",
      reason: "DATABASE_URL not set — DB verification skipped (use `set -a && . .env.production.local && set +a` to load it)",
      source: "scenarios/lead-capture.ts",
    });
    return finalize(scenario, assertions);
  }

  let dbModule: typeof import("@neondatabase/serverless");
  try {
    dbModule = await import("@neondatabase/serverless");
  } catch {
    assertions.push({
      name: "db-row-exists",
      description: "Submission row appears in contact_submissions",
      status: "skip",
      reason: "@neondatabase/serverless not installed",
      source: "scenarios/lead-capture.ts",
    });
    return finalize(scenario, assertions);
  }

  const sql = dbModule.neon(dbUrl);
  // Query for the row by test_run_id (set above)
  const rows = (await sql`
    SELECT first_name, email, source, extra_fields, disposition
    FROM contact_submissions
    WHERE extra_fields->>'test_run_id' = ${scenario.id}
    ORDER BY created_at DESC
    LIMIT 1
  `) as Array<{
    first_name: string;
    email: string;
    source: string;
    extra_fields: Record<string, unknown>;
    disposition: string;
  }>;

  if (rows.length === 0) {
    assertions.push({
      name: "db-row-exists",
      description: "Submission row appears in contact_submissions",
      status: "fail",
      reason: `No row found with extra_fields.test_run_id = '${scenario.id}'. Submission may have been blocked silently — check disposition column.`,
      source: "scenarios/lead-capture.ts",
    });
    return finalize(scenario, assertions);
  }

  const row = rows[0];
  assertions.push({
    name: "db-row-exists",
    description: "Submission row appears in contact_submissions",
    status: "pass",
  });

  // Verify expected fields
  for (const [key, expectedValue] of Object.entries(scenario.expectedFields)) {
    let actualValue: string;
    if (key === "source") actualValue = row.source;
    else if (key === "first_name") actualValue = row.first_name;
    else if (key === "email") actualValue = row.email;
    else if (key === "disposition") actualValue = row.disposition;
    else {
      const v = row.extra_fields?.[key];
      actualValue = typeof v === "string" ? v : JSON.stringify(v);
    }
    const matches = actualValue === expectedValue;
    assertions.push({
      name: `db-field::${key}`,
      description: `Field '${key}' matches expected value`,
      status: matches ? "pass" : "fail",
      reason: matches
        ? undefined
        : `Expected '${expectedValue}', got '${actualValue}'.`,
      source: "scenarios/lead-capture.ts",
    });
  }

  // Cleanup — delete the test row so the dashboard doesn't fill up with junk
  try {
    await sql`
      DELETE FROM contact_submissions
      WHERE extra_fields->>'test_run_id' = ${scenario.id}
    `;
  } catch {
    // Non-fatal — leave the row for manual cleanup
  }

  return finalize(scenario, assertions);
}

function finalize(
  scenario: LeadCaptureScenario,
  assertions: Assertion[],
): TestResult {
  return {
    id: scenario.id,
    category: "lead-capture",
    description: scenario.description,
    input: JSON.stringify(scenario.payload).slice(0, 100),
    expected: `submit succeeds; DB row matches expected fields`,
    assertions,
    status: statusFromAssertions(assertions),
  };
}
