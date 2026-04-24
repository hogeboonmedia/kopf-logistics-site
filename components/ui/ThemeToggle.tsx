"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem("kopf-theme") : null) as Theme | null;
    const prefersLight = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial: Theme = stored ?? (prefersLight ? "light" : "dark");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("kopf-theme", next);
  };

  if (!mounted) {
    // Render a placeholder matching size to avoid layout shift
    return <span aria-hidden="true" className={`inline-block w-11 h-11 ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`group relative grid place-items-center w-11 h-11 border transition-all overflow-hidden ${className}`}
      style={{
        borderColor: "var(--hairline-strong)",
        color: "var(--text)",
      }}
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: "var(--accent)" }} />
      <span className="relative grid place-items-center group-hover:text-[var(--on-accent)] transition-colors">
        {theme === "dark" ? (
          <Sun className="w-4 h-4" strokeWidth={2} />
        ) : (
          <Moon className="w-4 h-4" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}
