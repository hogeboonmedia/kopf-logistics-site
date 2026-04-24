"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentRowActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: "pending" | "spam" | "approved";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(s: "approved" | "spam" | "pending") {
    setBusy(s);
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  async function del() {
    if (!confirm("Permanently delete this comment? Cannot be undone.")) return;
    setBusy("delete");
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus !== "approved" && (
        <ActionButton
          label={busy === "approved" ? "…" : "Approve"}
          onClick={() => setStatus("approved")}
          tone="primary"
          disabled={busy !== null}
        />
      )}
      {currentStatus !== "spam" && (
        <ActionButton
          label={busy === "spam" ? "…" : "Mark Spam"}
          onClick={() => setStatus("spam")}
          tone="default"
          disabled={busy !== null}
        />
      )}
      {currentStatus !== "pending" && (
        <ActionButton
          label={busy === "pending" ? "…" : "Send to Queue"}
          onClick={() => setStatus("pending")}
          tone="default"
          disabled={busy !== null}
        />
      )}
      <ActionButton
        label={busy === "delete" ? "…" : "Delete"}
        onClick={del}
        tone="danger"
        disabled={busy !== null}
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone,
  disabled,
}: {
  label: string;
  onClick: () => void;
  tone: "primary" | "default" | "danger";
  disabled?: boolean;
}) {
  const styles =
    tone === "primary"
      ? { background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }
      : tone === "danger"
        ? { background: "transparent", color: "#ff8b80", borderColor: "#ff8b80" }
        : { background: "transparent", color: "var(--text-muted)", borderColor: "var(--hairline-strong)" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-[var(--font-jetbrains)] transition disabled:opacity-50"
      style={{ ...styles, borderWidth: 1, borderStyle: "solid" }}
    >
      {label}
    </button>
  );
}
