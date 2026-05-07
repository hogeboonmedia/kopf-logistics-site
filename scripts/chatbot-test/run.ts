#!/usr/bin/env node
/**
 * Chatbot test framework — CLI entry point.
 *
 * Usage:
 *   npx tsx scripts/chatbot-test/run.ts                  # run kopf, default mode
 *   npx tsx scripts/chatbot-test/run.ts --client=kopf    # explicit client
 *   npx tsx scripts/chatbot-test/run.ts --dry            # skip live LLM calls
 *   npx tsx scripts/chatbot-test/run.ts --e2e            # include lead capture
 *   npx tsx scripts/chatbot-test/run.ts --improve        # generate proposed fixes (no apply)
 *   npx tsx scripts/chatbot-test/run.ts --iterate=3      # autonomous loop
 *   npx tsx scripts/chatbot-test/run.ts --no-open        # don't open the report in browser
 *
 * Environment:
 *   TEST_BASE_URL=https://...   point LLM tests at production
 *   ANTHROPIC_API_KEY=sk-...    required for LLM grader + Improver
 *   DATABASE_URL=...            required for --e2e DB verification
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { runTests, type ClientTestConfig, type TestRun } from "./framework";
import { writeHtmlReport, printConsoleSummary } from "./report";
import { generateFix, applyFix, rollbackFix, type ProposedFix } from "./improver";

interface Args {
  client: string;
  dry: boolean;
  e2e: boolean;
  improve: boolean;
  iterate: number;
  noOpen: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    client: "kopf",
    dry: false,
    e2e: false,
    improve: false,
    iterate: 0,
    noOpen: false,
  };
  for (const a of argv) {
    if (a === "--dry") args.dry = true;
    else if (a === "--e2e") args.e2e = true;
    else if (a === "--improve") args.improve = true;
    else if (a === "--no-open") args.noOpen = true;
    else if (a.startsWith("--client=")) args.client = a.slice("--client=".length);
    else if (a.startsWith("--iterate=")) {
      const n = parseInt(a.slice("--iterate=".length), 10);
      if (!Number.isFinite(n) || n < 1 || n > 5) {
        console.error(`--iterate must be an integer 1-5, got ${a}`);
        process.exit(2);
      }
      args.iterate = n;
    }
  }
  return args;
}

async function loadClientConfig(clientId: string): Promise<ClientTestConfig> {
  const candidates = [
    `./cases-${clientId}.ts`,
    `./cases-${clientId}/index.ts`,
  ];
  for (const c of candidates) {
    try {
      const mod = (await import(c)) as { config?: ClientTestConfig };
      if (mod.config) return mod.config;
    } catch {
      // Try next
    }
  }
  console.error(
    `\nNo client config found for "${clientId}".\nLooked for:\n  ${candidates.join("\n  ")}\n\nCreate a file like scripts/chatbot-test/cases-${clientId}.ts that exports a 'config' constant — see CLIENT_TEMPLATE.md.\n`,
  );
  process.exit(2);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadClientConfig(args.client);

  if (args.iterate > 0) {
    await runIterateMode(config, args);
    return;
  }

  // Single run
  const run = await runTests({ config, e2e: args.e2e, dry: args.dry });

  // Improver — generate fixes if requested
  let fixes: Record<string, ProposedFix> = {};
  if (args.improve) {
    fixes = await generateFixes(run, config);
  }

  const htmlPath = writeHtmlReport(run, { fixes });
  printConsoleSummary(run, htmlPath);
  writeJsonReport(run, fixes);

  if (!args.noOpen) openInBrowser(htmlPath);

  // Exit code reflects test outcome
  const failed = run.results.filter((r) => r.status === "fail" || r.status === "error").length;
  process.exit(failed > 0 ? 1 : 0);
}

async function generateFixes(
  run: TestRun,
  config: ClientTestConfig,
): Promise<Record<string, ProposedFix>> {
  const failures = run.results.filter(
    (r) => r.status === "fail" || r.status === "error",
  );
  if (failures.length === 0) return {};

  console.log(`\n→ Generating proposed fixes for ${failures.length} failure(s)...`);
  const fixes: Record<string, ProposedFix> = {};
  for (const result of failures) {
    process.stdout.write(`  ${result.id}: `);
    const r = await generateFix({ result, voiceRules: config.voiceRules });
    if (r.ok) {
      fixes[result.id] = r.fix;
      console.log("✓ fix generated");
    } else {
      console.log(`✗ skipped (${r.reason})`);
    }
  }
  return fixes;
}

async function runIterateMode(config: ClientTestConfig, args: Args): Promise<void> {
  console.log(`\n=== --iterate=${args.iterate} mode ===`);

  // Always work on a fresh branch
  const branchName = `auto/test-fixes-${new Date().toISOString().slice(0, 10)}-${process.pid}`;
  console.log(`→ Creating working branch: ${branchName}`);
  try {
    execSync(`git checkout -b ${branchName}`, { stdio: "pipe" });
  } catch (err) {
    console.error(
      `\n✗ Could not create branch. Make sure your working tree is clean.\n${err instanceof Error ? err.message : err}\n`,
    );
    process.exit(2);
  }

  let lastRun: TestRun | undefined;
  let lastFailCount = Infinity;

  for (let i = 1; i <= args.iterate; i++) {
    console.log(`\n--- Iteration ${i}/${args.iterate} ---`);

    const run = await runTests({ config, e2e: args.e2e, dry: args.dry });
    const failures = run.results.filter(
      (r) => r.status === "fail" || r.status === "error",
    );
    const passing = run.results.filter((r) => r.status === "pass").length;
    console.log(`Pass: ${passing}/${run.results.length}, Fail: ${failures.length}`);

    if (failures.length === 0) {
      console.log(`✓ All tests passing — stopping iteration.`);
      lastRun = run;
      break;
    }

    if (failures.length >= lastFailCount) {
      console.log(`⚠ No improvement (${failures.length} failures, was ${lastFailCount}) — stopping.`);
      lastRun = run;
      break;
    }
    lastFailCount = failures.length;
    lastRun = run;

    // Generate + apply fixes
    const fixes = await generateFixes(run, config);
    if (Object.keys(fixes).length === 0) {
      console.log(`⚠ No fixes generated — stopping.`);
      break;
    }

    const previousContents: Array<{ fix: ProposedFix; before: string }> = [];
    for (const [testId, fix] of Object.entries(fixes)) {
      const result = applyFix(fix);
      if (!result.ok) {
        console.log(`  ✗ ${testId}: apply failed (${result.reason})`);
        continue;
      }
      previousContents.push({ fix, before: result.previousContent });
      console.log(`  ✓ ${testId}: applied fix to ${fix.filePath}`);
    }

    // Quick TypeScript syntax check on touched files
    const touched = [...new Set(previousContents.map((p) => p.fix.filePath))];
    if (!quickTscCheck(touched)) {
      console.log(`  ✗ TypeScript check failed — rolling back this iteration.`);
      for (const { fix, before } of previousContents) rollbackFix(fix, before);
      break;
    }

    // Commit each iteration
    try {
      execSync(`git add ${touched.join(" ")}`, { stdio: "pipe" });
      execSync(
        `git commit -m "auto-fix: iteration ${i} (${Object.keys(fixes).length} test(s) addressed)"`,
        { stdio: "pipe" },
      );
    } catch {
      // No changes to commit (all fixes rolled back) — continue
    }
  }

  // Generate final report on the LAST run
  if (lastRun) {
    const htmlPath = writeHtmlReport(lastRun, {});
    printConsoleSummary(lastRun, htmlPath);
    if (!args.noOpen) openInBrowser(htmlPath);
  }

  console.log(`\nWorking branch: ${branchName}`);
  console.log(`Review with:  git diff main`);
  console.log(`Merge with:   git checkout main && git merge ${branchName}`);
  console.log(`Discard with: git checkout main && git branch -D ${branchName}`);
}

function quickTscCheck(files: string[]): boolean {
  // Just check the project compiles. Cheap because Next.js build is cached.
  const r = spawnSync("npx", ["tsc", "--noEmit", "--pretty", "false", ...files], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (r.status !== 0) {
    console.log(`    tsc output: ${(r.stdout + r.stderr).slice(0, 400)}`);
    return false;
  }
  return true;
}

function writeJsonReport(run: TestRun, fixes: Record<string, ProposedFix>): void {
  writeFileSync(
    "test-results/results.json",
    JSON.stringify({ run, fixes }, null, 2),
  );
}

function openInBrowser(htmlPath: string): void {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    spawnSync(cmd, [htmlPath], { stdio: "ignore", detached: true });
  } catch {
    // Non-fatal — just printing the path is fine
  }
}

main().catch((err) => {
  console.error("Test framework crashed:", err);
  process.exit(2);
});
