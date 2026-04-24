"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ip: string | null;
  country: string | null;
}

export default function InquiryRowActions({ ip, country }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"ip" | "country" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function blockIp() {
    if (!ip) return;
    if (!confirm(`Block all submissions from IP ${ip}?`)) return;
    setBusy("ip");
    setMsg(null);
    const res = await fetch("/api/admin/blocklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "ip", value: ip, reason: "Blocked from inquiries dashboard" }),
    });
    setBusy(null);
    if (res.ok) {
      setMsg("blocked");
      router.refresh();
    } else {
      setMsg("error");
    }
  }

  async function blockCountry() {
    if (!country) return;
    if (!confirm(`Block ALL submissions from country ${country}?`)) return;
    setBusy("country");
    setMsg(null);
    const res = await fetch("/api/admin/blocklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "country", value: country, reason: "Blocked from inquiries dashboard" }),
    });
    setBusy(null);
    if (res.ok) {
      setMsg("blocked");
      router.refresh();
    } else {
      setMsg("error");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {ip && (
        <button
          type="button"
          onClick={blockIp}
          disabled={busy !== null}
          className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition disabled:opacity-50"
          style={{ border: "1px solid var(--hairline-strong)", color: "var(--text-muted)" }}
        >
          {busy === "ip" ? "…" : `Block ${ip}`}
        </button>
      )}
      {country && (
        <button
          type="button"
          onClick={blockCountry}
          disabled={busy !== null}
          className="px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition disabled:opacity-50"
          style={{ border: "1px solid var(--hairline-strong)", color: "var(--text-muted)" }}
        >
          {busy === "country" ? "…" : `Block ${country}`}
        </button>
      )}
      {msg === "blocked" && (
        <span
          className="text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)]"
          style={{ color: "var(--accent)" }}
        >
          Added to blocklist
        </span>
      )}
      {msg === "error" && (
        <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "#ff6b6b" }}>
          Failed
        </span>
      )}
    </div>
  );
}
