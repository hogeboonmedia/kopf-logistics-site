"use client";

import { Component, type ReactNode } from "react";

/**
 * Error boundary specifically for the chat lead form.
 *
 * If anything inside ChatLeadForm crashes — bad state update, render error,
 * unexpected null — this boundary catches it and renders a fallback bubble
 * with a recovery action. Without this, a thrown error would propagate up to
 * Chatbot.tsx and unmount the entire chat window (visitor sees a blank chat
 * area with no way to recover except closing + reopening — what the user
 * just reported as "the chat window went blank").
 *
 * The fallback bubble:
 *   - Apologizes
 *   - Surfaces a "call dispatch" CTA (always works, never breaks)
 *   - Logs the error to the console for debugging
 */

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ChatErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }): void {
    // Log so we can debug from browser DevTools without losing the chat
    console.error("[chatbot] Lead form crashed:", error);
    if (info.componentStack) {
      console.error("[chatbot] Component stack:", info.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex justify-start">
          <div
            className="max-w-[88%] px-4 py-3 text-sm leading-relaxed kopf-chat-bubble"
            style={{
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--hairline)",
              borderRadius: "16px 16px 16px 4px",
            }}
          >
            Something glitched on my end with the form — sorry about that.
            <br />
            <br />
            For immediate help, call dispatch at{" "}
            <a
              href="tel:5743495600"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              <strong>574.349.5600</strong>
            </a>{" "}
            (24/7) or use the contact form at{" "}
            <a
              href="/contact/"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              /contact
            </a>
            .
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
