/**
 * LLM fallback scenario runner.
 *
 * Tests off-script questions that should fall through to /api/chat (Claude
 * grounded in lib/chatbot/kb.ts). Verifies BOTH:
 *   - Deterministic structure: short bubbles, ends-with-question, no markdown
 *     leaks, no banned words, no forbidden claims
 *   - LLM-graded behavior: did the reply ground in the KB? did it ask a
 *     probing follow-up? did it avoid quoting specific rates?
 *
 * Hits the live /api/chat/ endpoint — needs the dev server running OR a
 * production URL via TEST_BASE_URL.
 */

import {
  evalBubbleLength,
  evalEndsWithQuestion,
  evalMultiBubbleWhenLong,
  evalNoMarkdownLeaks,
  evalTotalLength,
} from "../evaluators/structure";
import { evalBannedWords, evalForbiddenClaims } from "../evaluators/voice";
import { grade } from "../llm-grader";
import type {
  LlmFallbackScenario,
  TestResult,
  Assertion,
  VoiceRules,
} from "../framework";
import { statusFromAssertions } from "../framework";

const DEFAULT_VOICE_LIMITS = { maxBubbleChars: 220, maxTotalChars: 600 };

export async function runLlmFallback(
  scenario: LlmFallbackScenario,
  apiUrl: string,
  voiceRules: VoiceRules,
): Promise<TestResult> {
  const limits = {
    maxBubbleChars: voiceRules.maxBubbleChars ?? DEFAULT_VOICE_LIMITS.maxBubbleChars,
    maxTotalChars: voiceRules.maxTotalChars ?? DEFAULT_VOICE_LIMITS.maxTotalChars,
  };
  const assertions: Assertion[] = [];
  let reply: string | undefined;
  let httpStatus: number | undefined;

  try {
    const res = await fetch(`${apiUrl}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: scenario.visitor, history: [] }),
    });
    httpStatus = res.status;
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      reply?: string;
      error?: string;
    };

    if (httpStatus === 429) {
      return {
        id: scenario.id,
        category: "llm-fallback",
        description: scenario.description,
        input: scenario.visitor,
        expected: "grounded LLM reply",
        assertions: [],
        status: "skip",
        notes: `Rate limited (429). Wait an hour or hit the suite from a different IP.`,
      };
    }

    if (!res.ok || !json.ok || !json.reply) {
      assertions.push({
        name: "llm-reachable",
        description: "LLM endpoint returns a valid reply",
        status: "error",
        reason: `HTTP ${httpStatus}: ${json.error || "no reply field"}. Check ANTHROPIC_API_KEY in env.`,
        source: "scenarios/llm-fallback.ts",
      });
      return finalize(scenario, undefined, assertions);
    }

    reply = json.reply;
  } catch (err) {
    assertions.push({
      name: "llm-reachable",
      description: "LLM endpoint reachable",
      status: "error",
      reason: `Network error: ${err instanceof Error ? err.message : String(err)}. Is the dev server running at ${apiUrl}?`,
      source: "scenarios/llm-fallback.ts",
    });
    return finalize(scenario, undefined, assertions);
  }

  // Deterministic structure checks
  assertions.push(
    evalBubbleLength(reply, limits.maxBubbleChars),
    evalTotalLength(reply, limits.maxTotalChars),
    evalEndsWithQuestion(reply),
    evalMultiBubbleWhenLong(reply),
    evalNoMarkdownLeaks(reply),
    evalBannedWords(reply, voiceRules),
    ...evalForbiddenClaims(reply, voiceRules),
  );

  // LLM-graded rubrics (optional per scenario)
  for (const rubric of scenario.rubrics ?? []) {
    const result = await grade(rubric.question, scenario.visitor, reply);
    assertions.push({
      name: `rubric::${rubric.name}`,
      description: rubric.question,
      status: result.pass ? "pass" : "fail",
      reason: result.pass
        ? undefined
        : `Haiku judge said FAIL: ${result.reason}${result.cached ? " (cached)" : ""}`,
      source: "scenarios/llm-fallback.ts (LLM-graded)",
    });
  }

  return finalize(scenario, reply, assertions);
}

function finalize(
  scenario: LlmFallbackScenario,
  reply: string | undefined,
  assertions: Assertion[],
): TestResult {
  return {
    id: scenario.id,
    category: "llm-fallback",
    description: scenario.description,
    input: scenario.visitor,
    expected: "grounded LLM reply (short, ends with question, no buzzwords)",
    actual: reply,
    assertions,
    status: statusFromAssertions(assertions),
  };
}
