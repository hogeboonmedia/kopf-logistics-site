import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminSession } from "@/lib/auth/session";

/**
 * Common chrome for the admin pages — top bar with nav, current user, sign-out.
 * Server component so it renders before client JS loads.
 */
export default function AdminShell({
  session,
  active,
  children,
}: {
  session: AdminSession;
  active: "moderate" | "inquiries" | "blocklists";
  children: ReactNode;
}) {
  const tabs: Array<{ id: typeof active; label: string; href: string }> = [
    { id: "moderate", label: "Comments", href: "/admin/moderate/" },
    { id: "inquiries", label: "Inquiries", href: "/admin/inquiries/" },
    { id: "blocklists", label: "Blocklists", href: "/admin/blocklists/" },
  ];

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <header
        className="px-6 lg:px-10 py-5 flex items-center justify-between gap-6 flex-wrap"
        style={{ borderBottom: "1px solid var(--hairline-strong)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/admin/"
            className="font-[var(--font-anton)] uppercase text-lg tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Kopf Admin
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className="px-4 py-2 text-xs uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition"
                  style={{
                    background: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--on-accent)" : "var(--text-muted)",
                    border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                  }}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div
          className="text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.18em]"
          style={{ color: "var(--text-concrete)" }}
        >
          Signed in as <strong style={{ color: "var(--text)" }}>@{session.login}</strong>
        </div>
      </header>

      <main className="px-6 lg:px-10 py-10 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
