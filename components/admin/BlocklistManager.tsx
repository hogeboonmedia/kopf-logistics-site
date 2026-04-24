"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Entry {
  value: string;
  reason: string | null;
  added_at: string;
  added_by: string | null;
}

export default function BlocklistManager({
  kind,
  initial,
  placeholder,
  description,
}: {
  kind: "ip" | "country" | "keyword";
  initial: Entry[];
  placeholder: string;
  description: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/blocklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, value: value.trim(), reason: reason.trim() || undefined }),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setBusy(false);
    if (res.ok && j.ok) {
      setValue("");
      setReason("");
      router.refresh();
    } else {
      setError(j.error || "Failed");
    }
  }

  async function remove(v: string) {
    if (!confirm(`Remove "${v}" from blocklist?`)) return;
    const res = await fetch("/api/admin/blocklists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, value: v }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <section className="mb-12">
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span
            className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
            style={{ color: "var(--text-concrete)" }}
          >
            New entry
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--hairline-strong)",
              color: "var(--text)",
            }}
          />
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span
            className="text-[10px] uppercase tracking-[0.22em] font-[var(--font-jetbrains)]"
            style={{ color: "var(--text-concrete)" }}
          >
            Reason (optional)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="why are we blocking this?"
            className="px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--hairline-strong)",
              color: "var(--text)",
            }}
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={busy || !value.trim()}
          className="kopf-btn kopf-btn--solid disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add"}
        </button>
      </div>

      {error && (
        <div
          className="text-sm mb-4 p-3"
          style={{
            border: "1px solid var(--hairline-strong)",
            color: "#ff8b80",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ border: "1px solid var(--hairline-strong)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--bg-elevated)" }}>
            <tr className="text-left font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]">
              <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }}>Value</th>
              <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }}>Reason</th>
              <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }}>Added</th>
              <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }}>By</th>
              <th className="px-4 py-3" style={{ color: "var(--text-concrete)" }} />
            </tr>
          </thead>
          <tbody>
            {initial.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center" style={{ color: "var(--text-muted)" }}>
                  None blocked.
                </td>
              </tr>
            ) : (
              initial.map((e) => (
                <tr key={e.value} style={{ borderTop: "1px solid var(--hairline)" }}>
                  <td className="px-4 py-3 font-[var(--font-jetbrains)] tabular-nums" style={{ color: "var(--text)" }}>
                    {e.value}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {e.reason ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3 text-xs font-[var(--font-jetbrains)] tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(e.added_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-[var(--font-jetbrains)]" style={{ color: "var(--text-muted)" }}>
                    {e.added_by ?? "system"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(e.value)}
                      className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition"
                      style={{ border: "1px solid var(--hairline-strong)", color: "var(--text-muted)" }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
