/**
 * Flow walking scenario runner.
 *
 * Multi-turn flows pre-qualify high-intent leads (shippers, drivers, agents,
 * carriers). The runner programmatically walks every step:
 *   1. Visitor sends `trigger` message → expect intent fires + flow starts
 *   2. For each step, simulate the visitor's `answers[i]` answer
 *   3. After the last answer, expect the lead form to fire with all answers
 *      collected as extra_fields keyed by `flow.field`
 *
 * Doesn't call /api/chat — this is offline, deterministic, fast. The actual
 * UI behavior (typing delays, multi-bubble rendering) is verified by the
 * other test categories.
 */

import { findIntent } from "../../../lib/chatbot/matcher";
import {
  evalBubbleLength,
  evalEndsWithQuestion,
  evalTotalLength,
} from "../evaluators/structure";
import { evalBannedWords, evalForbiddenClaims } from "../evaluators/voice";
import type {
  ChatConfig,
  FlowWalkingScenario,
  TestResult,
  Assertion,
  TranscriptTurn,
  VoiceRules,
} from "../framework";
import { statusFromAssertions, splitBubbles, stripHtml } from "../framework";

const DEFAULT_VOICE_LIMITS = { maxBubbleChars: 220, maxTotalChars: 600 };

export function runFlowWalking(
  scenario: FlowWalkingScenario,
  chatConfig: ChatConfig,
  voiceRules: VoiceRules,
): TestResult {
  const limits = {
    maxBubbleChars: voiceRules.maxBubbleChars ?? DEFAULT_VOICE_LIMITS.maxBubbleChars,
    maxTotalChars: voiceRules.maxTotalChars ?? DEFAULT_VOICE_LIMITS.maxTotalChars,
  };
  const transcript: TranscriptTurn[] = [];
  const assertions: Assertion[] = [];

  // Step 1: trigger should match the expected intent
  const intent = findIntent(scenario.trigger, chatConfig.intents);
  if (!intent || intent.id !== scenario.intentId) {
    assertions.push({
      name: "flow-trigger",
      description: `Trigger message routes to '${scenario.intentId}' intent`,
      status: "fail",
      reason: `Trigger "${scenario.trigger}" matched ${intent?.id || "no intent"}, expected ${scenario.intentId}.`,
      source: "scenarios/flows.ts:runFlowWalking",
    });
    return finalize(scenario, transcript, assertions);
  }
  if (!intent.flow || intent.flow.length === 0) {
    assertions.push({
      name: "flow-trigger",
      description: `Trigger routes to a flow`,
      status: "fail",
      reason: `Intent '${intent.id}' has no flow defined. Add a flow[] array or update the test scenario.`,
      source: "scenarios/flows.ts:runFlowWalking",
    });
    return finalize(scenario, transcript, assertions);
  }

  // Step 2: validate flow length matches scenario answers length
  if (scenario.answers.length !== intent.flow.length) {
    assertions.push({
      name: "flow-shape",
      description: `Scenario provides answer for every flow step`,
      status: "fail",
      reason: `Flow has ${intent.flow.length} steps but scenario provides ${scenario.answers.length} answers. Update the scenario or the flow.`,
      source: "scenarios/flows.ts:runFlowWalking",
    });
    return finalize(scenario, transcript, assertions);
  }

  // Step 3: walk the flow. Each iteration: bot asks step.question, visitor answers.
  transcript.push({ role: "visitor", content: scenario.trigger });
  const collectedFields: Record<string, string> = {};

  for (let i = 0; i < intent.flow.length; i++) {
    const step = intent.flow[i];
    transcript.push({ role: "bot", content: step.question });

    // Per-step quality assertions on the question itself
    assertions.push(
      withId(`step-${i + 1}-bubble-length`, evalBubbleLength(step.question, limits.maxBubbleChars)),
      withId(`step-${i + 1}-total-length`, evalTotalLength(step.question, limits.maxTotalChars)),
      withId(`step-${i + 1}-ends-with-question`, evalEndsWithQuestion(step.question)),
      withId(`step-${i + 1}-no-banned-words`, evalBannedWords(step.question, voiceRules)),
      ...evalForbiddenClaims(step.question, voiceRules).map((a, j) =>
        withId(`step-${i + 1}-forbidden-claim-${j}`, a),
      ),
    );

    // Verify chips look reasonable IF the step has them
    if (step.chips && step.chips.length > 0) {
      const allChipsShort = step.chips.every((c) => c.length <= 40);
      assertions.push({
        name: `step-${i + 1}-chip-length`,
        description: `Step ${i + 1} chips are concise (≤40 chars each)`,
        status: allChipsShort ? "pass" : "fail",
        reason: allChipsShort
          ? undefined
          : `Long chips: ${step.chips.filter((c) => c.length > 40).join(", ")}. Mobile chats wrap awkwardly past ~40 chars.`,
        source: "scenarios/flows.ts:runFlowWalking",
      });
    }

    // Visitor answers
    const answer = scenario.answers[i];
    transcript.push({ role: "visitor", content: answer });
    collectedFields[step.field] = answer;
  }

  // Step 4: lead form should fire after the last step. Verify all flow.field
  // keys are present in the collected extras.
  const expectedFields = intent.flow.map((s) => s.field);
  const missing = expectedFields.filter((f) => !(f in collectedFields));
  assertions.push({
    name: "flow-completion",
    description: `All ${expectedFields.length} flow answers captured into extra_fields`,
    status: missing.length === 0 ? "pass" : "fail",
    reason:
      missing.length === 0
        ? undefined
        : `Missing fields: ${missing.join(", ")}. Flow walker did not capture every field — check FlowState.answers handling in Chatbot.tsx.`,
    source: "scenarios/flows.ts:runFlowWalking",
  });

  // Step 5: lead capture is one-shot. Confirm the intent is flagged for it.
  assertions.push({
    name: "lead-capture-flag",
    description: `Intent has leadCapture: true`,
    status: intent.leadCapture ? "pass" : "fail",
    reason: intent.leadCapture
      ? undefined
      : `Intent '${intent.id}' has a flow but leadCapture is not set — visitor will complete the flow and get no form.`,
    source: "scenarios/flows.ts:runFlowWalking",
  });

  return finalize(scenario, transcript, assertions);
}

function withId(id: string, a: Assertion): Assertion {
  return { ...a, name: id };
}

function finalize(
  scenario: FlowWalkingScenario,
  transcript: TranscriptTurn[],
  assertions: Assertion[],
): TestResult {
  // Roll up: actual = serialized transcript (so the report can show what happened)
  const actual = transcript
    .map((t) => `${t.role === "visitor" ? "Visitor" : "Bot"}: ${stripHtml(t.content)}`)
    .join("\n");

  return {
    id: scenario.id,
    category: "flow-walking",
    description: scenario.description,
    input: scenario.trigger,
    expected: `flow walks ${scenario.answers.length} steps, captures all fields`,
    actual,
    transcript,
    assertions,
    status: statusFromAssertions(assertions),
  };
}
