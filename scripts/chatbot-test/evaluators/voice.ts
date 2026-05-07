/**
 * Voice + grounding evaluators.
 *
 * - Banned words (buzzwords, marketing-speak)
 * - Required jargon (industry terms — checked at the suite level, not per-test)
 * - Forbidden claims (specific patterns the bot must never say — e.g.,
 *   "your info lands in recruiter@..." style claims)
 */

import type { Assertion, VoiceRules } from "../framework";

export function evalBannedWords(
  reply: string,
  rules: VoiceRules,
): Assertion {
  const lc = reply.toLowerCase();
  const hits = rules.bannedWords.filter((word) => lc.includes(word.toLowerCase()));
  if (hits.length === 0) {
    return {
      name: "no-banned-words",
      description: `No banned phrasings (${rules.bannedWords.length} on the list)`,
      status: "pass",
    };
  }
  return {
    name: "no-banned-words",
    description: `No banned phrasings (${rules.bannedWords.length} on the list)`,
    status: "fail",
    reason: `Banned phrasing(s) detected: ${hits.map((h) => `"${h}"`).join(", ")}. These signal corporate-AI tone instead of an industry voice. Reword without them.`,
    source: "evaluators/voice.ts:evalBannedWords",
  };
}

export function evalForbiddenClaims(
  reply: string,
  rules: VoiceRules,
): Assertion[] {
  const claims = rules.forbiddenClaims ?? [];
  if (claims.length === 0) return [];

  return claims.map((claim) => {
    const matched = claim.pattern.test(reply);
    if (!matched) {
      return {
        name: `no-forbidden-claim::${claim.pattern.toString().slice(0, 30)}`,
        description: claim.rationale,
        status: "pass",
      };
    }
    return {
      name: `no-forbidden-claim::${claim.pattern.toString().slice(0, 30)}`,
      description: claim.rationale,
      status: "fail",
      reason: `Bot reply matched forbidden pattern ${claim.pattern.toString()}. ${claim.rationale}`,
      source: "evaluators/voice.ts:evalForbiddenClaims",
    };
  });
}
