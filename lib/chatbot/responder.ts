import type { ChatIntent } from "./types";

/**
 * Per-intent variant tracker — rotates through the response/suggestion
 * variants in order so a user who asks the same question twice gets a
 * different phrasing the second time. Resets when the bot is closed
 * + reopened (state lives in the React component, not module scope).
 */
export interface ResponderState {
  responseVariant: Record<string, number>;
  suggestionVariant: Record<string, number>;
  failCount: number;
  lastTopic: string | null;
}

export function createResponderState(): ResponderState {
  return {
    responseVariant: {},
    suggestionVariant: {},
    failCount: 0,
    lastTopic: null,
  };
}

export function getResponse(intent: ChatIntent, state: ResponderState): string {
  const id = intent.id;
  const idx = (state.responseVariant[id] ?? 0) % intent.responses.length;
  state.responseVariant[id] = (state.responseVariant[id] ?? 0) + 1;
  state.lastTopic = id;
  state.failCount = 0;
  return intent.responses[idx];
}

export function getSuggestions(intent: ChatIntent, state: ResponderState): string[] {
  const id = intent.id;
  const sets = intent.suggestions ?? [];
  if (sets.length === 0) return [];
  const idx = (state.suggestionVariant[id] ?? 0) % sets.length;
  state.suggestionVariant[id] = (state.suggestionVariant[id] ?? 0) + 1;
  return sets[idx];
}

export function incrementFail(state: ResponderState): number {
  state.failCount++;
  return state.failCount;
}
