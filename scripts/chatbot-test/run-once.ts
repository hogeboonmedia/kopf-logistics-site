#!/usr/bin/env node
/**
 * Single-iteration runner — used by --iterate mode to guarantee a fresh
 * Node process (and fresh ESM module cache) per iteration.
 *
 * The cache-busting query-string approach (`import("...?t=123")`) doesn't
 * work reliably under tsx — TypeScript loaders normalize specifiers, so
 * the query string gets stripped before reaching Node's resolver. The
 * subprocess approach sidesteps the cache entirely.
 *
 * Usage:
 *   tsx scripts/chatbot-test/run-once.ts --client=kopf --output=path.json [--e2e] [--dry]
 *
 * Output: writes the TestRun JSON to --output (or stdout if not given).
 * Exit code 0 = ran successfully (regardless of test outcome).
 *               1 = framework error (couldn't load config, etc.)
 */

import { writeFileSync } from "node:fs";
import { runTests, type ClientTestConfig } from "./framework";

interface OnceArgs {
  client: string;
  output?: string;
  e2e: boolean;
  dry: boolean;
}

function parseArgs(argv: string[]): OnceArgs {
  const args: OnceArgs = { client: "kopf", e2e: false, dry: false };
  for (const a of argv) {
    if (a === "--e2e") args.e2e = true;
    else if (a === "--dry") args.dry = true;
    else if (a.startsWith("--client=")) args.client = a.slice("--client=".length);
    else if (a.startsWith("--output=")) args.output = a.slice("--output=".length);
  }
  return args;
}

async function loadClientConfig(clientId: string): Promise<ClientTestConfig> {
  const candidates = [`./cases-${clientId}.ts`, `./cases-${clientId}/index.ts`];
  for (const c of candidates) {
    try {
      const mod = (await import(c)) as { config?: ClientTestConfig };
      if (mod.config) return mod.config;
    } catch {
      // try next
    }
  }
  console.error(`No client config for "${clientId}"`);
  process.exit(1);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadClientConfig(args.client);
  const run = await runTests({ config, e2e: args.e2e, dry: args.dry });
  const json = JSON.stringify(run, null, 2);
  if (args.output) {
    writeFileSync(args.output, json);
  } else {
    process.stdout.write(json);
  }
}

main().catch((err) => {
  console.error("run-once crashed:", err);
  process.exit(1);
});
