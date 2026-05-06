#!/usr/bin/env node
/**
 * Chatbot conversation test harness.
 *
 * Runs ~14 representative visitor queries through:
 *   1. The offline pattern matcher (lib/chatbot/matcher.ts + kopf-config.ts)
 *   2. The live /api/chat endpoint (LLM fallback)
 *
 * For each response, evaluates against the "feels human" criteria:
 *   - LENGTH: each bubble under ~200 chars (visible content)
 *   - ENGAGEMENT: ends with a question or clear CTA
 *   - MULTI-BUBBLE: uses <br><br> for natural pacing on longer replies
 *   - INDUSTRY VOICE: doesn't use buzzword phrasings
 *   - FLOW vs RESPONSE: high-intent intents kick off a flow
 *
 * Run:   node scripts/test-chatbot-conversations.mjs
 * Run with custom URL: TEST_BASE_URL=https://… node scripts/...
 *
 * Output: per-test verdict + summary report.
 */

import { kopfChatConfig } from "../lib/chatbot/kopf-config.ts";
import { findIntent } from "../lib/chatbot/matcher.ts";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// ── Test cases ────────────────────────────────────────────────────────────
// Each case represents a real visitor scenario. Mix of pattern-match hits
// (should match an intent) and free-form questions (should fall to LLM).

const TESTS = [
  // ── Pattern-matched (should hit intents and start flows) ──────────────
  { id: "T01", visitor: "Hi", expect: "intent:greeting" },
  { id: "T02", visitor: "I want to ship freight", expect: "flow:shippers" },
  { id: "T03", visitor: "I need a quote for some loads", expect: "flow:shippers" },
  { id: "T04", visitor: "I'm a CDL driver looking for work", expect: "flow:drivers" },
  { id: "T05", visitor: "How do I become an owner-operator?", expect: "flow:drivers" },
  { id: "T06", visitor: "Tell me about the freight agent program", expect: "flow:agents" },
  { id: "T07", visitor: "How do I become a carrier?", expect: "flow:carriers" },
  { id: "T08", visitor: "What services do you offer?", expect: "intent:services" },
  { id: "T09", visitor: "Where are you located?", expect: "intent:location" },
  { id: "T10", visitor: "What's your phone number?", expect: "intent:contact" },
  { id: "T11", visitor: "About Kopf Logistics", expect: "intent:about" },

  // ── LLM fallback (should produce grounded, short, follow-up replies) ──
  { id: "T12", visitor: "Do you guys haul livestock from Texas to Montana?", expect: "llm" },
  { id: "T13", visitor: "What are your detention pay rates?", expect: "llm" },
  { id: "T14", visitor: "Do you double-broker loads?", expect: "llm" },
  { id: "T15", visitor: "I'm trying to get into freight brokerage, any advice?", expect: "llm" },
  { id: "T16", visitor: "What's the average rate per mile for owner-operators in your network?", expect: "llm" },
];

// ── Evaluation criteria ───────────────────────────────────────────────────

const QUESTION_RE = /[?]|\b(want me to|how about|which|what|where|when|interested|let me know|tell me)\b[^.]*$/i;
const BUZZWORDS = [
  "best-in-class",
  "cutting-edge",
  "world-class",
  "synergy",
  "leverage",
  "optimize",
  "optimized",
  "seamless",
  "robust",
  "innovative",
  "industry-leading",
  "next-generation",
];

function visibleLength(html) {
  return html.replace(/<[^>]*>/g, "").length;
}

function splitBubbles(html) {
  return html
    .split(/<br\s*\/?>\s*<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function evaluateReply(reply) {
  const bubbles = splitBubbles(reply);
  const visibleTotal = visibleLength(reply);
  const lastBubble = bubbles[bubbles.length - 1] || reply;
  const lastVisible = visibleLength(lastBubble).toString();
  const longestBubble = Math.max(...bubbles.map(visibleLength));
  const endsWithQuestion = QUESTION_RE.test(lastBubble.replace(/<[^>]*>/g, ""));
  const lc = reply.toLowerCase();
  const buzzwordHit = BUZZWORDS.find((b) => lc.includes(b));

  const issues = [];
  if (longestBubble > 220) issues.push(`bubble too long (${longestBubble} chars > 220)`);
  if (visibleTotal > 600) issues.push(`total too long (${visibleTotal} chars > 600)`);
  if (!endsWithQuestion) issues.push("no question/CTA at end");
  if (buzzwordHit) issues.push(`buzzword: "${buzzwordHit}"`);

  return {
    bubbleCount: bubbles.length,
    longestBubble,
    visibleTotal,
    lastVisible,
    endsWithQuestion,
    buzzwordHit,
    issues,
    pass: issues.length === 0,
  };
}

// ── Test runners ──────────────────────────────────────────────────────────

async function runPatternTest(test) {
  const intent = findIntent(test.visitor, kopfChatConfig.intents);
  if (!intent) {
    return { test, kind: "no-match", reply: null, eval: null };
  }

  // High-intent intents with flows fire the flow's first question
  if (intent.flow && intent.flow.length > 0) {
    const firstStep = intent.flow[0];
    return {
      test,
      kind: `flow:${intent.id}`,
      reply: firstStep.question,
      chips: firstStep.chips || null,
      eval: evaluateReply(firstStep.question),
    };
  }

  // Otherwise show the first response variant
  const reply = intent.responses[0];
  return {
    test,
    kind: `intent:${intent.id}`,
    reply,
    chips: intent.suggestions?.[0] || null,
    eval: evaluateReply(reply),
  };
}

async function runLlmTest(test) {
  try {
    const res = await fetch(`${BASE_URL}/api/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: test.visitor, history: [] }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok || !json.reply) {
      return {
        test,
        kind: "llm-error",
        reply: null,
        error: `HTTP ${res.status}: ${json.error || "unknown"}`,
        eval: null,
      };
    }
    return {
      test,
      kind: "llm",
      reply: json.reply,
      eval: evaluateReply(json.reply),
    };
  } catch (err) {
    return { test, kind: "llm-error", reply: null, error: String(err), eval: null };
  }
}

// ── Output formatting ─────────────────────────────────────────────────────

function fmt(s, w) {
  if (s.length <= w) return s.padEnd(w);
  return s.slice(0, w - 1) + "…";
}

function printResult(r) {
  const ok = r.eval?.pass ? "✓" : r.eval ? "✗" : "—";
  const expectedKind = r.test.expect;
  const actualKind = r.kind;
  const matched = expectedKind === actualKind ? "✓" : "✗";

  console.log(`\n${r.test.id}  ${ok}  Visitor: "${r.test.visitor}"`);
  console.log(`     Expected: ${expectedKind}    Actual: ${actualKind}  ${matched}`);
  if (r.error) {
    console.log(`     ERROR: ${r.error}`);
    return;
  }
  if (!r.reply) {
    console.log(`     (no reply — pattern matcher returned null and this isn't an LLM test)`);
    return;
  }

  // Print the reply, with bubble breaks visualized
  const bubbles = splitBubbles(r.reply);
  bubbles.forEach((b, i) => {
    console.log(`     ${i === 0 ? "Reply:" : "      "} ${fmt(b.replace(/<[^>]*>/g, ""), 110)}`);
  });

  if (r.chips) {
    console.log(`     Chips: ${r.chips.join(" | ")}`);
  }

  if (r.eval) {
    console.log(
      `     Stats: ${r.eval.bubbleCount} bubble(s), longest ${r.eval.longestBubble}c, total ${r.eval.visibleTotal}c, ${r.eval.endsWithQuestion ? "Q✓" : "Q✗"}`,
    );
    if (r.eval.issues.length > 0) {
      console.log(`     Issues: ${r.eval.issues.join("; ")}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n=== Kopf Chatbot Conversation Test Harness ===`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Tests: ${TESTS.length}`);
  console.log(`\nCriteria:`);
  console.log(`  - Each bubble ≤ 220 visible chars`);
  console.log(`  - Total reply ≤ 600 visible chars`);
  console.log(`  - Last bubble ends with question or CTA`);
  console.log(`  - No buzzwords ("best-in-class", "optimized", etc.)`);
  console.log(`  - Pattern-matched intent kind matches expectation`);

  const results = [];
  for (const test of TESTS) {
    const r = test.expect === "llm" ? await runLlmTest(test) : await runPatternTest(test);
    printResult(r);
    results.push(r);
  }

  // Summary
  console.log(`\n=== Summary ===`);
  const total = results.length;
  const evaluated = results.filter((r) => r.eval).length;
  const passed = results.filter((r) => r.eval?.pass).length;
  const intentMatched = results.filter((r) => r.kind === r.test.expect).length;

  console.log(`Pattern/intent matching: ${intentMatched}/${total} matched expectation`);
  console.log(`Quality criteria: ${passed}/${evaluated} passed all checks`);
  if (passed < evaluated) {
    console.log(`\nFailures:`);
    results
      .filter((r) => r.eval && !r.eval.pass)
      .forEach((r) => {
        console.log(`  ${r.test.id} (${r.kind}): ${r.eval.issues.join("; ")}`);
      });
  }
}

main().catch((e) => {
  console.error("Test harness crashed:", e);
  process.exit(1);
});
