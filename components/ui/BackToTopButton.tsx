"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button that appears once the user has scrolled past
 * a threshold (600px). Mounted globally in app/layout.tsx so it lives on
 * every page.
 *
 * - Hidden by default (opacity 0 + pointer-events: none) so it never intercepts
 *   clicks before becoming visible
 * - Scroll listener uses requestAnimationFrame to avoid running state updates
 *   on every wheel tick
 * - z-40 sits below the sticky header (z-50) so they never visually conflict
 * - Respects prefers-reduced-motion (instant scroll instead of smooth)
 */
export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        ticking = false;
      });
    };
    onScroll(); // initialize (in case the page loads partway down)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 grid place-items-center w-11 h-11 rounded-full transition-opacity duration-200"
      style={{
        background: "var(--accent)",
        color: "var(--on-accent)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={2.4} />
    </button>
  );
}
