"use client";

import Link from "next/link";
import { ReactNode, MouseEvent } from "react";
import { ArrowUpRight } from "lucide-react";

interface Props {
  href: string;
  children: ReactNode;
  variant?: "outline" | "solid";
  external?: boolean;
  arrow?: boolean;
  className?: string;
}

/**
 * Editorial CTA button. Renders one of three forms based on `href`:
 *   - "#anchor"     → plain <a> with custom onClick that re-runs scrollIntoView
 *                     on EVERY click. (Native browser hash navigation only
 *                     scrolls when the hash *changes* — clicking the same
 *                     hash link a second time is a no-op. This handler bypasses
 *                     that to make in-page anchor buttons reliable.)
 *   - external=true → <a target="_blank" rel="noopener noreferrer">
 *   - otherwise     → Next.js <Link> for client-side navigation
 */
export default function Button({
  href,
  children,
  variant = "outline",
  external,
  arrow = true,
  className = "",
}: Props) {
  const cls = `kopf-btn ${variant === "solid" ? "kopf-btn--solid" : ""} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />}
    </>
  );

  // In-page anchor link: intercept click so the second / third / nth click
  // still scrolls. We also call history.replaceState so the URL still updates
  // without triggering a hash-change cycle.
  if (href.startsWith("#")) {
    const onAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
      // Let modifier-clicks (open in new tab, etc.) behave normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return; // fall through to default browser hash behavior
      e.preventDefault();
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      // Update the URL without re-firing browser hash navigation
      try {
        history.replaceState(null, "", href);
      } catch {
        /* ignore — some sandboxed contexts disallow replaceState */
      }
    };
    return (
      <a href={href} onClick={onAnchorClick} className={cls}>
        {content}
      </a>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
