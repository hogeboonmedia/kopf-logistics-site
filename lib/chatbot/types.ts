/**
 * Type definitions for the Kopf chatbot config.
 *
 * The schema mirrors the welcome-bot config used in
 * revenue-engine/demos/welcome-bot/configs/*.json so we can swap to that
 * format later (or use it for a hosted-iframe variant) without rewriting
 * the matching logic.
 */

export interface ChatIntent {
  /** Unique id, used for response/suggestion variant tracking. */
  id: string;
  /** Regex source strings (case-insensitive). Longer patterns score higher. */
  patterns: string[];
  /**
   * Plain-text or simple HTML responses. The bot rotates between variants.
   * Multi-bubble: separate bubbles with `<br><br>` — the renderer splits
   * on it and shows each chunk as its own message bubble with a typing
   * delay between them. Keep individual chunks under 180 chars when
   * possible. Every response should end with a question OR a clear next
   * step (link/phone) to keep the visitor engaged.
   */
  responses: string[];
  /** Sets of follow-up suggestion chips. Bot rotates between sets. */
  suggestions?: string[][];
  /**
   * If true, after the response the bot offers an inline lead-capture
   * form (name + email + phone). Triggers ONCE per session — once the
   * visitor submits or dismisses, no further intents will re-prompt.
   * Use for high-intent moments: shipper inquiry, agent/driver application,
   * tracking, contact, etc.
   *
   * The lead-form scheduling is "cancel-and-reschedule" — if the visitor
   * sends another message before the form appears, we cancel the timer
   * and let the conversation continue. The form re-schedules after the
   * NEXT bot reply if we're still in a high-intent flow.
   */
  leadCapture?: boolean;
  /**
   * Optional structured flow that fires INSTEAD of the regular `responses`
   * when the intent matches. Each step asks one question (with optional
   * quick-reply chips). Visitor's answers are collected and passed to the
   * lead form as `extra_fields` so dispatch knows what they're asking about.
   *
   * Use for high-intent moments where pre-qualifying the lead matters:
   * shipper, driver, agent, carrier.
   */
  flow?: FlowStep[];
}

/** One question in a persona-routed flow. */
export interface FlowStep {
  /** Field name used in the lead-form's extra_fields payload. */
  field: string;
  /** Question text shown as the bot's bubble. */
  question: string;
  /** Optional quick-reply chips. If absent, visitor types a free-text answer. */
  chips?: string[];
}

export interface ChatBehavior {
  greetings: string[];
  defaultSuggestions: string[][];
  privacyNotice?: string;
  fallbackMessages: string[];
  frustrationResponse: string;
  frustrationSuggestions: string[];
}

export interface ChatCompany {
  name: string;
  tagline: string;
  poweredBy?: string;
}

export interface ChatConfig {
  company: ChatCompany;
  behavior: ChatBehavior;
  intents: ChatIntent[];
}
