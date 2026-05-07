/**
 * Structure evaluators — deterministic checks on the SHAPE of a bot reply.
 *
 * Per-bubble length, total length, ends-with-question/CTA. Used by every
 * scenario kind that produces a bot reply.
 */

import type { Assertion } from "../framework";
import { splitBubbles, stripHtml } from "../framework";

const QUESTION_RE =
  /[?]|\b(want me to|how about|which|interested|let me know|tell me|do you|are you|have you|got|need|looking for)\b[^.]*$/i;

export function evalBubbleLength(
  reply: string,
  maxBubbleChars: number,
): Assertion {
  const bubbles = splitBubbles(reply);
  const lengths = bubbles.map((b) => stripHtml(b).length);
  const longest = Math.max(0, ...lengths);

  if (longest <= maxBubbleChars) {
    return {
      name: "bubble-length",
      description: `Each bubble ≤ ${maxBubbleChars} visible chars`,
      status: "pass",
    };
  }
  return {
    name: "bubble-length",
    description: `Each bubble ≤ ${maxBubbleChars} visible chars`,
    status: "fail",
    reason: `Longest bubble was ${longest} chars (limit ${maxBubbleChars}). Consider splitting on <br><br> or trimming the message.`,
    source: "evaluators/structure.ts:evalBubbleLength",
  };
}

export function evalTotalLength(
  reply: string,
  maxTotalChars: number,
): Assertion {
  const total = stripHtml(reply).length;
  if (total <= maxTotalChars) {
    return {
      name: "total-length",
      description: `Total reply ≤ ${maxTotalChars} visible chars`,
      status: "pass",
    };
  }
  return {
    name: "total-length",
    description: `Total reply ≤ ${maxTotalChars} visible chars`,
    status: "fail",
    reason: `Reply is ${total} chars (limit ${maxTotalChars}). Trim non-essential context; defer detail to dispatch or follow-up.`,
    source: "evaluators/structure.ts:evalTotalLength",
  };
}

/**
 * Check that the LAST bubble of the reply ends with a question or actionable
 * CTA. We look at the last bubble specifically (not the whole reply) because
 * with multi-bubble replies, the question always lands at the end.
 */
export function evalEndsWithQuestion(reply: string): Assertion {
  const bubbles = splitBubbles(reply);
  const last = bubbles[bubbles.length - 1] || reply;
  const visibleLast = stripHtml(last);

  if (QUESTION_RE.test(visibleLast)) {
    return {
      name: "ends-with-question",
      description: "Last bubble ends with a question or CTA",
      status: "pass",
    };
  }
  return {
    name: "ends-with-question",
    description: "Last bubble ends with a question or CTA",
    status: "fail",
    reason: `Last bubble was "${visibleLast.slice(-100)}" — no question mark, no probing follow-up, no clear next step. Add a probing question or "Want me to grab your info?" style CTA.`,
    source: "evaluators/structure.ts:evalEndsWithQuestion",
  };
}

/**
 * Check that the reply has multiple bubbles when it goes over a SOFT length
 * threshold — encourages the renderer's text-message cadence. Optional;
 * single-bubble replies under the soft threshold are fine.
 */
export function evalMultiBubbleWhenLong(reply: string): Assertion {
  const bubbles = splitBubbles(reply);
  const total = stripHtml(reply).length;
  if (total < 240 || bubbles.length >= 2) {
    return {
      name: "multi-bubble-cadence",
      description: "Replies > 240 chars use multi-bubble pacing (<br><br>)",
      status: "pass",
    };
  }
  return {
    name: "multi-bubble-cadence",
    description: "Replies > 240 chars use multi-bubble pacing (<br><br>)",
    status: "fail",
    reason: `Reply is ${total} chars but rendered as a single bubble. Add a <br><br> break to split it for natural pacing.`,
    source: "evaluators/structure.ts:evalMultiBubbleWhenLong",
  };
}

/**
 * Detect leaked markdown that should have been HTML. The chatbot's renderer
 * sanitizes this server-side, but failures here are still an LLM-output
 * quality signal — Claude is supposed to use HTML directly.
 */
export function evalNoMarkdownLeaks(reply: string): Assertion {
  // After server-side sanitizing, no raw ** or [text](url) should remain
  const hasBold = /\*\*[^*]+\*\*/.test(reply);
  const hasMdLink = /\[[^\]]+\]\([^)]+\)/.test(reply);
  if (!hasBold && !hasMdLink) {
    return {
      name: "no-markdown-leaks",
      description: "No raw markdown bold/links",
      status: "pass",
    };
  }
  const issues = [];
  if (hasBold) issues.push("**bold**");
  if (hasMdLink) issues.push("[text](url)");
  return {
    name: "no-markdown-leaks",
    description: "No raw markdown bold/links",
    status: "fail",
    reason: `Markdown leaked through: ${issues.join(", ")}. Sanitizer should have caught this — investigate route.ts sanitizeMarkdownLeaks().`,
    source: "evaluators/structure.ts:evalNoMarkdownLeaks",
  };
}
