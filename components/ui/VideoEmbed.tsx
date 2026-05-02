"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface Props {
  youTubeId: string;
  title: string;
  aspect?: "16/9" | "4/3";
}

export default function VideoEmbed({ youTubeId, title, aspect = "16/9" }: Props) {
  const [active, setActive] = useState(false);
  const aspectClass = aspect === "16/9" ? "aspect-[16/9]" : "aspect-[4/3]";
  const thumb = `https://img.youtube.com/vi/${youTubeId}/maxresdefault.jpg`;
  const fallback = `https://img.youtube.com/vi/${youTubeId}/hqdefault.jpg`;

  if (active) {
    return (
      <div className={`relative ${aspectClass} w-full bg-[var(--color-kopf-ink-2)] overflow-hidden border border-white/[0.08]`}>
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Play video: ${title}`}
      className={`relative ${aspectClass} w-full group overflow-hidden border border-white/[0.08] bg-[var(--color-kopf-ink-2)] cursor-pointer`}
    >
      <Image
        src={thumb}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 960px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
        unoptimized
      />
      {/* Two-layer overlay for readability, same pattern YouTube/Netflix use:
        * (1) A very subtle full-thumbnail dim so the centered Play button has
        *     consistent contrast against any thumbnail color.
        * (2) A bottom-up dark gradient covering roughly the lower half, which
        *     guarantees the title sits on a dark backdrop no matter what the
        *     YouTube thumbnail happens to contain. */}
      <span className="absolute inset-0 bg-black/15" aria-hidden="true" />
      <span
        className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/85 via-black/50 to-transparent"
        aria-hidden="true"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-[var(--color-kopf-orange)] scale-110 blur-xl opacity-50 group-hover:opacity-75 transition" />
          <span className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-[var(--color-kopf-orange)] grid place-items-center transform transition-transform duration-200 group-hover:scale-105">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-kopf-ink)] translate-x-[2px]" fill="currentColor" />
          </span>
        </span>
      </span>
      <span className="absolute bottom-6 left-6 right-6 text-left">
        <span className="block kopf-eyebrow mb-1">▶ Play Video</span>
        <span
          className="block text-[var(--color-kopf-bone)] text-lg md:text-xl font-[var(--font-anton)] uppercase tracking-tight leading-tight"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          {title}
        </span>
      </span>
    </button>
  );
}
