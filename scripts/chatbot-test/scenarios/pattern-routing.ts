/**
 * Pattern routing scenario runner.
 *
 * Deterministic, fast — runs entirely offline. For each test case:
 *   1. Run the visitor message through the bot's findIntent() pattern matcher
 *   2. Determine if the matched intent has a flow or just responses
 *   3. Compare to the expected `flow:<id>` / `intent:<id>` / `no-match`
 */

import { findIntent } from "../../../lib/chatbot/matcher";
import type {
  ChatConfig,
  PatternRoutingScenario,
  TestResult,
  Assertion,
} from "../framework";
import { statusFromAssertions } from "../framework";

export function runPatternRouting(
  scenario: PatternRoutingScenario,
  chatConfig: ChatConfig,
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

  const assertion: Assertion = {
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

  // Sample reply (used for downstream Improver context, not asserted here)
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
    assertions: [assertion],
    status: statusFromAssertions([assertion]),
  };
}
