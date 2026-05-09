/**
 * Pattern routing scenario runner.
 *
 * Deterministic, fast — runs entirely offline. For each test case:
 *   1. Run the visitor message through the bot's findIntent() pattern matcher
 *   2. Determine if the matched intent has a flow or just responses
 *   3. Compare to the expected `flow:<id>` / `intent:<id>` / `no-match`
 *   4. Audit the matched intent's responses[] against voice + structure rules
 *
 * The voice/structure audit (step 4) catches buzzwords + length issues + bad
 * formatting in the static config without needing the LLM. Originally the
 * runner only checked routing — that let buzzword leaks slip through silently.
 */

import { findIntent } from "../../../lib/chatbot/matcher";
import {
  evalBubbleLength,
  evalEndsWithQuestion,
  evalNoMarkdownLeaks,
  evalTotalLength,
} from "../evaluators/structure";
import { evalBannedWords, evalForbiddenClaims } from "../evaluators/voice";
import type {
  ChatConfig,
  PatternRoutingScenario,
  TestResult,
  Assertion,
  VoiceRules,
} from "../framework";
import { statusFromAssertions } from "../framework";

const DEFAULT_VOICE_LIMITS = { maxBubbleChars: 220, maxTotalChars: 600 };

export function runPatternRouting(
  scenario: PatternRoutingScenario,
  chatConfig: ChatConfig,
  voiceRules?: VoiceRules,
): TestResult {
  const intent = findIntent(scenario.visitor, chatConfig.intents);

  let actual: string;
  if (!intent) {
    actual = "no-match";
  } else if (intent.flow && intent.flow.length > 0) {
    actual = `flow:${intent.id}`;
  } else {
    actual = `intent:${intent.id}`;
  }

  const matches = actual === scenario.expect;

  const routingAssertion: Assertion = {
    name: "intent-routing",
    description: `Visitor "${scenario.visitor}" → ${scenario.expect}`,
    status: matches ? "pass" : "fail",
    reason: matches
      ? undefined
      : `Expected ${scenario.expect}, got ${actual}. ${
          actual.startsWith("intent:") || actual.startsWith("flow:")
            ? `Add a more-specific pattern to ${scenario.expect.split(":")[1]}, or weaken the patterns on ${actual.split(":")[1]} so it doesn't out-rank.`
            : "No intent matched. Add a pattern to the expected intent that catches this phrasing."
        }`,
    source: "scenarios/pattern-routing.ts",
  };

  const assertions: Assertion[] = [routingAssertion];

  // Voice + structure audit on every response variant of the matched intent.
  // Catches banned words, length issues, missing-question CTA, markdown leaks,
  // and forbidden claims in static config — without an LLM call.
  if (intent && voiceRules) {
    const limits = {
      maxBubbleChars: voiceRules.maxBubbleChars ?? DEFAULT_VOICE_LIMITS.maxBubbleChars,
      maxTotalChars: voiceRules.maxTotalChars ?? DEFAULT_VOICE_LIMITS.maxTotalChars,
    };
    const responses = intent.responses ?? [];
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      const tag = `response[${i}]`;
      assertions.push(
        renamed(`${tag}-bubble-length`, evalBubbleLength(r, limits.maxBubbleChars)),
        renamed(`${tag}-total-length`, evalTotalLength(r, limits.maxTotalChars)),
        renamed(`${tag}-ends-with-question`, evalEndsWithQuestion(r)),
        renamed(`${tag}-no-markdown-leaks`, evalNoMarkdownLeaks(r)),
        renamed(`${tag}-no-banned-words`, evalBannedWords(r, voiceRules)),
        ...evalForbiddenClaims(r, voiceRules).map((a, j) =>
          renamed(`${tag}-forbidden-claim-${j}`, a),
        ),
      );
    }
  }

  // Sample reply for downstream Improver context
  let sampleReply: string | undefined;
  if (intent) {
    if (intent.flow && intent.flow.length > 0) {
      sampleReply = intent.flow[0].question;
    } else if (intent.responses && intent.responses.length > 0) {
      sampleReply = intent.responses[0];
    }
  }

  return {
    id: scenario.id,
    category: "pattern-routing",
    description: scenario.description,
    input: scenario.visitor,
    expected: scenario.expect,
    actual: sampleReply ?? actual,
    assertions,
    status: statusFromAssertions(assertions),
  };
}

function renamed(id: string, a: Assertion): Assertion {
  return { ...a, name: id };
}
