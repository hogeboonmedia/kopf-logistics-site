/**
 * Chatbot test framework — core types + runner.
 *
 * Three subsystems orbit this file:
 *   1. Test runner (this file) — executes scenarios, collects results
 *   2. The Improver — generates proposed fixes for failures (improver.ts)
 *   3. Visual report — renders results as HTML (report.ts)
 *
 * Designed to be reusable across multiple clients. Per-client config lives
 * in `cases-<client>.ts` and provides the chat config import, voice rules,
 * and test scenarios. The framework itself is client-agnostic.
 *
 * See README.md for usage.
 */

import type { ChatConfig, ChatIntent, FlowStep } from "../../lib/chatbot/types";

// ────────────────────────────────────────────────────────────────────────────
// Result types — drive both the console reporter AND the HTML report
// ────────────────────────────────────────────────────────────────────────────

export type AssertionStatus = "pass" | "fail" | "skip" | "error";

export interface Assertion {
  /** Short rule name shown in the report (e.g., "bubble-length", "ends-with-question"). */
  name: string;
  /** Human-readable description of what was checked. */
  description: string;
  status: AssertionStatus;
  /** Failure detail — why the assertion didn't hold. */
  reason?: string;
  /** Source location of the rule (file:line) so the Improver knows where to look. */
  source?: string;
}

export type TestCategory =
  | "pattern-routing"
  | "flow-walking"
  | "llm-fallback"
  | "edge-case"
  | "lead-capture";

export interface TestResult {
  id: string;
  category: TestCategory;
  /** One-line description of what this test exercises. */
  description: string;
  /** The visitor input (or a short summary for multi-turn tests). */
  input: string;
  /** What the bot was supposed to do. */
  expected: string;
  /** What the bot actually returned (full reply, multi-bubble where applicable). */
  actual?: string;
  /** Multi-turn transcript (used for flow walking + lead capture E2E). */
  transcript?: TranscriptTurn[];
  /** All assertions evaluated for this test. */
  assertions: Assertion[];
  /** Roll-up: pass if every assertion passed, fail if any failed, error if the test crashed. */
  status: AssertionStatus;
  /** Time the test took, in ms. */
  durationMs?: number;
  /** Free-form notes from the runner (rate limit hits, network errors, etc.). */
  notes?: string;
}

export interface TranscriptTurn {
  role: "visitor" | "bot";
  content: string;
}

export interface TestRun {
  /** Identifier for this run — matches the client config's id. */
  clientId: string;
  /** ISO timestamp when the run started. */
  startedAt: string;
  /** Total run wall time, ms. */
  durationMs: number;
  /** Where the LLM tests pointed (localhost vs production). */
  apiUrl: string;
  /** All results, in run order. */
  results: TestResult[];
  /** Whether `--e2e` was on for this run. */
  e2e: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Client config — what each per-client cases-<client>.ts file exports
// ────────────────────────────────────────────────────────────────────────────

export interface ForbiddenClaim {
  /** Regex to match against bot replies. If matched, this rule fails. */
  pattern: RegExp;
  /** Why this is forbidden — surfaces in the failure reason + Improver prompt. */
  rationale: string;
  /** Severity tag — affects how visible the failure is in the report. */
  severity?: "critical" | "warning";
}

export interface VoiceRules {
  /** Phrases the bot must NEVER use (buzzwords, marketing-speak). */
  bannedWords: string[];
  /** Industry-specific terms the bot SHOULD use to demonstrate fluency. Optional. */
  requiredJargon?: string[];
  /** Specific claims the bot must not make (e.g., naming an internal mailbox). */
  forbiddenClaims?: ForbiddenClaim[];
  /** Per-bubble visible-character cap (default 220). */
  maxBubbleChars?: number;
  /** Per-reply total visible-character cap (default 600). */
  maxTotalChars?: number;
}

export interface ClientTestConfig {
  /** Slug used for branch names, report titles, etc. */
  clientId: string;
  /** Lazy import of the client's chat config (so the framework can run multi-client). */
  loadChatConfig: () => Promise<ChatConfig>;
  /** API URL for live LLM tests. Defaults to TEST_BASE_URL env var or localhost. */
  apiUrl?: string;
  /** Voice rules applied to every test. */
  voiceRules: VoiceRules;
  /** All test scenarios for this client. */
  scenarios: TestScenario[];
}

// ────────────────────────────────────────────────────────────────────────────
// Test scenarios — discriminated union, one shape per category
// ────────────────────────────────────────────────────────────────────────────

interface ScenarioBase {
  id: string;
  description: string;
}

export interface PatternRoutingScenario extends ScenarioBase {
  kind: "pattern-routing";
  /** Visitor message to test. */
  visitor: string;
  /**
   * Expected match result:
   *   - `flow:<intentId>` — the intent has a flow and should kick it off
   *   - `intent:<intentId>` — the intent matched, no flow (responses[] used)
   *   - `no-match` — no pattern should match, LLM fallback should fire
   */
  expect: `flow:${string}` | `intent:${string}` | "no-match";
}

export interface FlowWalkingScenario extends ScenarioBase {
  kind: "flow-walking";
  /** Visitor message that should trigger this flow. */
  trigger: string;
  /** Expected intent id (must have a flow). */
  intentId: string;
  /** Answer to give at each step, in order. Length must match flow length. */
  answers: string[];
}

export interface LlmFallbackScenario extends ScenarioBase {
  kind: "llm-fallback";
  /** Off-script visitor question. */
  visitor: string;
  /** Optional LLM-graded rubrics this reply must satisfy. */
  rubrics?: LlmRubric[];
}

export interface LlmRubric {
  /** Short id used in the report. */
  name: string;
  /** Question for the Haiku judge. Should be answerable with PASS/FAIL. */
  question: string;
}

export interface EdgeCaseScenario extends ScenarioBase {
  kind: "edge-case";
  visitor: string;
  /** Expected behavior key — drives custom evaluation. */
  expect:
    | "frustration-response"
    | "fallback-message"
    | "stays-in-role"
    | "stays-in-voice";
}

export interface LeadCaptureScenario extends ScenarioBase {
  kind: "lead-capture";
  /** Sample payload to POST to /api/contact/. */
  payload: Record<string, unknown>;
  /** Expected DB row column values to verify. */
  expectedFields: Record<string, string>;
}

export type TestScenario =
  | PatternRoutingScenario
  | FlowWalkingScenario
  | LlmFallbackScenario
  | EdgeCaseScenario
  | LeadCaptureScenario;

// ────────────────────────────────────────────────────────────────────────────
// Runner — orchestrates per-scenario evaluation
// ────────────────────────────────────────────────────────────────────────────

export interface RunOptions {
  /** Which client config to run. */
  config: ClientTestConfig;
  /** Run lead-capture E2E? Defaults to false (safe — no DB writes). */
  e2e?: boolean;
  /** Dry run — skip live LLM calls, just check pattern routing + flows. */
  dry?: boolean;
}

/**
 * Run all scenarios from the client config and return aggregated results.
 *
 * Individual scenario runners (in scenarios/) are imported here lazily so a
 * cycle in pattern-routing imports doesn't break flow-walking, etc.
 */
export async function runTests(opts: RunOptions): Promise<TestRun> {
  const { config, e2e = false, dry = false } = opts;
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const chatConfig = await config.loadChatConfig();
  const apiUrl = config.apiUrl || process.env.TEST_BASE_URL || "http://localhost:3000";

  const results: TestResult[] = [];

  // Lazy imports so this module stays cheap to load
  const { runPatternRouting } = await import("./scenarios/pattern-routing");
  const { runFlowWalking } = await import("./scenarios/flows");
  const { runLlmFallback } = await import("./scenarios/llm-fallback");
  const { runEdgeCase } = await import("./scenarios/edge-cases");
  const { runLeadCapture } = await import("./scenarios/lead-capture");

  for (const scenario of config.scenarios) {
    const tStart = Date.now();
    let result: TestResult;
    try {
      switch (scenario.kind) {
        case "pattern-routing":
          result = runPatternRouting(scenario, chatConfig, config.voiceRules);
          break;
        case "flow-walking":
          result = runFlowWalking(scenario, chatConfig, config.voiceRules);
          break;
        case "llm-fallback":
          if (dry) {
            result = stubResult(scenario, "skip", "skipped (--dry mode)");
          } else {
            result = await runLlmFallback(scenario, apiUrl, config.voiceRules);
          }
          break;
        case "edge-case":
          if (dry && requiresLlm(scenario)) {
            result = stubResult(scenario, "skip", "skipped (--dry mode)");
          } else {
            result = await runEdgeCase(scenario, chatConfig, apiUrl, config.voiceRules);
          }
          break;
        case "lead-capture":
          if (!e2e) {
            result = stubResult(scenario, "skip", "skipped (use --e2e to run)");
          } else {
            result = await runLeadCapture(scenario, apiUrl);
          }
          break;
      }
    } catch (err) {
      result = stubResult(
        scenario,
        "error",
        `Test crashed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    result.durationMs = Date.now() - tStart;
    results.push(result);
  }

  return {
    clientId: config.clientId,
    startedAt,
    durationMs: Date.now() - t0,
    apiUrl,
    results,
    e2e,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers — used by both this file and scenario runners
// ────────────────────────────────────────────────────────────────────────────

function categoryOf(s: TestScenario): TestCategory {
  switch (s.kind) {
    case "pattern-routing":
      return "pattern-routing";
    case "flow-walking":
      return "flow-walking";
    case "llm-fallback":
      return "llm-fallback";
    case "edge-case":
      return "edge-case";
    case "lead-capture":
      return "lead-capture";
  }
}

function stubResult(
  s: TestScenario,
  status: AssertionStatus,
  notes: string,
): TestResult {
  return {
    id: s.id,
    category: categoryOf(s),
    description: s.description,
    input: "visitor" in s ? s.visitor : "trigger" in s ? s.trigger : "(no input)",
    expected: "expected" in s ? String(s.expect) : "—",
    assertions: [],
    status,
    notes,
  };
}

function requiresLlm(s: EdgeCaseScenario): boolean {
  // Some edge cases test LLM behavior; some test pure pattern routing.
  return s.expect === "stays-in-role" || s.expect === "stays-in-voice";
}

/** Roll up assertion statuses into the test's overall status. */
export function statusFromAssertions(assertions: Assertion[]): AssertionStatus {
  if (assertions.length === 0) return "skip";
  if (assertions.some((a) => a.status === "error")) return "error";
  if (assertions.some((a) => a.status === "fail")) return "fail";
  if (assertions.every((a) => a.status === "pass")) return "pass";
  return "skip";
}

/** Strip HTML tags + collapse whitespace — used for length checks + transcripts. */
export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Split a bot reply on `<br><br>` so we can count bubbles. */
export function splitBubbles(html: string): string[] {
  return html
    .split(/<br\s*\/?>\s*<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Look up an intent by id; helper for flow + edge-case scenarios. */
export function findIntentById(
  chatConfig: ChatConfig,
  id: string,
): ChatIntent | undefined {
  return chatConfig.intents.find((i) => i.id === id);
}

/** Re-export commonly-used types for scenario authors. */
export type { ChatConfig, ChatIntent, FlowStep };
