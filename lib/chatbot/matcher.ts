import { normalize } from "./normalizer";
import type { ChatIntent } from "./types";

/**
 * Find the best-matching intent for a user message.
 *
 * Strategy: try every regex pattern across every intent. The intent whose
 * matched pattern is the longest "wins" — longer regex == more specific.
 * Returns null if nothing matched (caller should use a fallback message).
 */
export function findIntent(text: string, intents: ChatIntent[]): ChatIntent | null {
  const norm = normalize(text);
  let best: ChatIntent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    for (const pattern of intent.patterns) {
      try {
        const regex = new RegExp(pattern, "i");
        if (regex.test(norm)) {
          const score = pattern.length;
          if (score > bestScore) {
            bestScore = score;
            best = intent;
          }
        }
      } catch {
        // Bad pattern — ignore so a single bad regex can't break matching.
      }
    }
  }

  return best;
}

const FRUSTRATION_RE =
  /\b(useless|stupid|hate|terrible|awful|horrible|frustrated|annoyed|broken|worst|sucks|rubbish|pointless|waste|wtf|wth|piece of (s|junk|crap)|doesn'?t work|not helpful)\b/i;

export function isFrustrated(text: string): boolean {
  return FRUSTRATION_RE.test(text);
}
