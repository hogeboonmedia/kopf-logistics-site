"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, X } from "lucide-react";
import type { EquipmentItem } from "@/lib/equipment";

/**
 * Bento grid of freight services. Each card opens a native <dialog> with
 * SEO-rich content (description, benefits, ideal cargo, industry fit).
 *
 * Accessibility:
 * - Cards are <button>s with aria-haspopup="dialog" and aria-controls.
 * - <dialog> uses the native HTML element so ESC + backdrop-click close work.
 * - Focus moves into the dialog on open and returns to the trigger on close.
 *
 * SEO:
 * - All dialog content is in the DOM at first paint (rendered server-side
 *   from the same data file as the JSON-LD ItemList on the page).
 * - Each dialog is wrapped in <article itemScope itemType="schema.org/Service">
 *   for additional microdata signals on top of the page-level JSON-LD.
 * - Each card shows the tagline at all times so visible body text references
 *   the service name in the document flow, not only inside the modal.
 */
export default function EquipmentBento({ items }: { items: EquipmentItem[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!openSlug) return;
    const dialog = document.getElementById(
      `equipment-${openSlug}`,
    ) as HTMLDialogElement | null;
    if (!dialog) return;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // Older Safari may throw if already open in another mode; fallback to .show()
        dialog.show();
      }
    }
  }, [openSlug]);

  function close() {
    if (!openSlug) return;
    const dialog = document.getElementById(
      `equipment-${openSlug}`,
    ) as HTMLDialogElement | null;
    if (dialog?.open) dialog.close();
    const trigger = triggerRefs.current.get(openSlug);
    setOpenSlug(null);
    // Return focus to the card that opened the dialog
    requestAnimationFrame(() => trigger?.focus());
  }

  return (
    <>
      <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            ref={(el) => {
              if (el) triggerRefs.current.set(item.slug, el);
              else triggerRefs.current.delete(item.slug);
            }}
            onClick={() => setOpenSlug(item.slug)}
            aria-haspopup="dialog"
            aria-controls={`equipment-${item.slug}`}
            aria-label={`Learn more about ${item.label} freight service`}
            className="kopf-equipment-card group relative p-6 transition flex flex-col items-start text-left cursor-pointer"
            style={{
              background: "color-mix(in srgb, var(--bg-elevated) 70%, transparent)",
              border: "1px solid var(--hairline-strong)",
            }}
          >
            <span
              className="font-[var(--font-jetbrains)] text-[10px] tabular-nums transition"
              style={{ color: "var(--text-concrete)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-3 w-16 h-10 relative">
              <Image
                src={`/kopf-original/images/${item.icon}`}
                alt=""
                fill
                sizes="64px"
                className="object-contain object-left theme-icon"
              />
            </div>
            <p
              className="mt-4 font-[var(--font-anton)] uppercase tracking-tight leading-tight"
              style={{ color: "var(--text)" }}
            >
              {item.label}
            </p>
            {/* Always-visible tagline = crawlable descriptive text in normal flow */}
            <p
              className="mt-2 text-xs leading-snug line-clamp-2"
              style={{ color: "var(--text-muted)" }}
            >
              {item.tagline}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1.5 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em] transition"
              style={{ color: "var(--accent)" }}
            >
              <Plus className="w-3 h-3" strokeWidth={2.5} />
              Details
            </span>
          </button>
        ))}
      </div>

      {/* All dialogs rendered server-side. Each opens via showModal() */}
      {items.map((item) => (
        <EquipmentDialog key={item.slug} item={item} onClose={close} />
      ))}
    </>
  );
}

function EquipmentDialog({
  item,
  onClose,
}: {
  item: EquipmentItem;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // Native <dialog> fires a "close" event on ESC, backdrop-click, or method.close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCloseEvent = () => onClose();
    dialog.addEventListener("close", onCloseEvent);
    return () => dialog.removeEventListener("close", onCloseEvent);
  }, [onClose]);

  // Click on backdrop closes (native ::backdrop click hits the dialog itself)
  function onBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inside) dialog.close();
  }

  return (
    <dialog
      id={`equipment-${item.slug}`}
      ref={dialogRef}
      onClick={onBackdropClick}
      className="kopf-equipment-dialog"
      aria-labelledby={`equipment-${item.slug}-title`}
    >
      <article
        itemScope
        itemType="https://schema.org/Service"
        className="kopf-equipment-dialog-inner"
      >
        <meta itemProp="serviceType" content={item.label} />
        <meta itemProp="category" content="Freight transportation" />

        <header className="kopf-equipment-dialog-header">
          <div className="flex items-center gap-3">
            <div className="w-12 h-9 relative shrink-0">
              <Image
                src={`/kopf-original/images/${item.icon}`}
                alt=""
                fill
                sizes="48px"
                className="object-contain object-left theme-icon"
              />
            </div>
            <span
              className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--text-concrete)" }}
            >
              Freight Service · Kopf Logistics Group
            </span>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => dialogRef.current?.close()}
            className="kopf-equipment-dialog-close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </header>

        <h3
          id={`equipment-${item.slug}-title`}
          className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl leading-[1.05] tracking-tight mt-6"
          style={{ color: "var(--text)" }}
          itemProp="name"
        >
          {item.label}
        </h3>
        <p
          className="mt-3 text-base md:text-lg leading-relaxed font-[var(--font-jetbrains)]"
          style={{ color: "var(--accent)" }}
        >
          {item.tagline}
        </p>

        <div
          className="mt-6 pt-6 text-base leading-relaxed"
          style={{ color: "var(--text-muted)", borderTop: "1px solid var(--hairline-strong)" }}
        >
          <p itemProp="description">{item.description}</p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-x-10 gap-y-8">
          <section>
            <h4 className="kopf-eyebrow mb-3">§ Why Kopf</h4>
            <ul className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {item.benefits.map((b) => (
                <li key={b} className="flex gap-3">
                  <span
                    className="font-[var(--font-jetbrains)] text-xs mt-0.5"
                    style={{ color: "var(--accent)" }}
                  >
                    →
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="kopf-eyebrow mb-3">§ Best Suited For</h4>
            <ul className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {item.bestFor.map((b) => (
                <li key={b} className="flex gap-3">
                  <span
                    className="font-[var(--font-jetbrains)] text-xs mt-0.5"
                    style={{ color: "var(--accent)" }}
                  >
                    →
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 pt-6" style={{ borderTop: "1px solid var(--hairline)" }}>
          <h4 className="kopf-eyebrow mb-3">§ Typical Cargo</h4>
          <div className="flex flex-wrap gap-2">
            {item.cargo.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.12em]"
                style={{
                  border: "1px solid var(--hairline-strong)",
                  color: "var(--text-muted)",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        <footer
          className="mt-8 pt-6 flex flex-wrap items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--hairline-strong)" }}
        >
          <div className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-concrete)" }}>
            Coverage · 48 Contiguous States
          </div>
          <Link
            href={item.ctaPath}
            className="kopf-btn kopf-btn--solid"
            onClick={() => dialogRef.current?.close()}
          >
            {item.ctaLabel}
            <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2.5} />
          </Link>
        </footer>
      </article>
    </dialog>
  );
}
