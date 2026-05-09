/**
 * cb_anon — client-side profile for returning visitor UX.
 *
 * Stored in localStorage under key "cb_anon". Written only when the user
 * explicitly grants consent (either via in-chat prompt or lead capture).
 * Cleared by "Forget me" action.
 *
 * Server owns cross-session storage; this is the client-side read layer
 * that lets us show "Welcome back, Marisa" before the first SSE round-trip.
 */

const KEY = "cb_anon";

export interface ChatProfile {
  firstName?: string;
  email?: string;
  sessionId?: string;
  lastTopic?: string;
  consentGranted: boolean;
  updatedAt: number;
}

export function getProfile(): ChatProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatProfile;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProfile(patch: Partial<ChatProfile>): void {
  if (typeof window === "undefined") return;
  const existing = getProfile() ?? { consentGranted: false, updatedAt: 0 };
  const next: ChatProfile = { ...existing, ...patch, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function hasConsent(): boolean {
  return getProfile()?.consentGranted === true;
}

export function grantConsent(): void {
  saveProfile({ consentGranted: true });
}
