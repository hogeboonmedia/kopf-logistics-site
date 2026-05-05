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
  /** Plain-text or simple HTML responses. The bot rotates between variants. */
  responses: string[];
  /** Sets of follow-up suggestion chips. Bot rotates between sets. */
  suggestions?: string[][];
  /**
   * If true, after the response the bot offers an inline lead-capture
   * form (name + email + phone). Triggers ONCE per session — once the
   * visitor submits or dismisses, no further intents will re-prompt.
   * Use for high-intent moments: shipper inquiry, agent/driver application,
   * tracking, contact, etc.
   */
  leadCapture?: boolean;
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
