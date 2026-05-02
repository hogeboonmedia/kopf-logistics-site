"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const nav = [
  { label: "Shippers", href: "/shippers" },
  { label: "Carriers", href: "/carriers" },
  { label: "Drivers", href: "/drivers" },
  { label: "Freight Agents", href: "/agent" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Brand-blue header treatment — chosen via prototype A/B/C review (Variant B,
// at 70% mix instead of the prototype's original 88%, for more atmosphere).
//   - 70% var(--accent-2) blue + 30% transparent → photo behind ghosts through
//   - 12px backdrop blur for readability
//   - Always-on (no scroll dependency) for consistent brand expression
const HEADER_BG = "color-mix(in srgb, var(--accent-2) 70%, transparent)";
const HEADER_BORDER = "1px solid rgba(255, 255, 255, 0.12)";
// Text on blue needs a brighter color than the original muted concrete used
// against the dark warm-ink backdrop. Bone-tinted whites read cleanly here.
const HEADER_TEXT = "rgba(245, 239, 230, 0.95)";
const HEADER_TEXT_MUTED = "rgba(245, 239, 230, 0.78)";
const HEADER_HAIRLINE = "rgba(255, 255, 255, 0.18)";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: HEADER_BG,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: HEADER_BORDER,
      }}
    >
      {/* Top utility strip */}
      <div
        className="hidden md:flex items-center justify-between px-6 lg:px-10 py-2 text-[11px] font-[var(--font-jetbrains)] tracking-[0.18em] uppercase"
        style={{ borderBottom: `1px solid ${HEADER_HAIRLINE}`, color: HEADER_TEXT_MUTED }}
      >
        <span className="flex items-center gap-6">
          <span>Est. 1966 · Elkhart, Indiana</span>
          <span className="hidden lg:inline">Terminals: Elkhart IN · Athens GA · Seaford DE</span>
        </span>
        <span className="flex items-center gap-6">
          {/* Address NOT in clear-text source — defeats email scrapers.
            * Reassembled at hydration; JS-disabled visitors see the /contact link. */}
          <Link
            href="/contact"
            className="hover:text-[var(--accent)] transition"
            data-email-cipher="cmVjcnVpdGVyQGtvcGZsb2dpc3RpY3Nncm91cC5jb20="
          >
            <span suppressHydrationWarning>Contact Recruiting</span>
          </Link>
          <a href="tel:5743495600" className="flex items-center gap-1.5 hover:text-[var(--accent)] transition">
            <Phone className="w-3 h-3" strokeWidth={2} />
            574.349.5600
          </a>
        </span>
      </div>

      <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Kopf Logistics Group — Home" className="flex items-center gap-3">
          <Image
            src="/kopf-original/images/kopf_orangelogo_no_bg_02.png"
            alt="Kopf Logistics Group"
            width={150}
            height={64}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-[0.22em] font-[var(--font-jetbrains)] font-medium transition-colors"
                style={{
                  color: active ? "var(--accent)" : HEADER_TEXT,
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget.style.color = "var(--accent)");
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget.style.color = HEADER_TEXT);
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-grid" />
          <Link href="/agent" className="kopf-btn kopf-btn--solid hidden md:inline-flex">
            Become an Agent
          </Link>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid place-items-center w-11 h-11 transition"
            style={{
              border: `1px solid ${HEADER_HAIRLINE}`,
              color: HEADER_TEXT,
            }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden" style={{ borderTop: "1px solid var(--hairline)", background: "var(--bg)" }}>
          <nav className="flex flex-col">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-6 py-4 text-sm uppercase tracking-[0.2em] font-[var(--font-jetbrains)]"
                  style={{
                    color: active ? "var(--accent)" : "var(--text)",
                    borderBottom: "1px solid var(--hairline)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--hairline)" }}>
              <span className="kopf-eyebrow">Theme</span>
              <ThemeToggle />
            </div>
            <Link
              href="/agent"
              className="px-6 py-5 uppercase tracking-[0.22em] text-xs font-[var(--font-jetbrains)] font-semibold"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              Become an Agent →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
