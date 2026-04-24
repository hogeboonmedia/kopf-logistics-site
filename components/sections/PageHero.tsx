import Image from "next/image";
import { ReactNode } from "react";

interface Props {
  chapter: string;
  eyebrow: string;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  backgroundImage?: string;
  children?: ReactNode;
}

export default function PageHero({
  chapter,
  eyebrow,
  title,
  subtitle,
  backgroundImage,
  children,
}: Props) {
  return (
    <section className="relative overflow-hidden isolate">
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center -z-20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-kopf-ink)] via-[var(--color-kopf-ink)]/90 to-[var(--color-kopf-ink)]/50"
          />
          <div aria-hidden="true" className="kopf-grain -z-10" />
        </>
      )}

      <div className="relative px-6 lg:px-10 pt-20 pb-24 md:pt-32 md:pb-36">
        <div className="max-w-6xl">
          <div className="flex items-center gap-3 mb-6 kopf-fade-up">
            <span className="kopf-chapter">§ {chapter}</span>
            <span className="h-px w-10 bg-[var(--color-kopf-orange)]" />
            <span className="kopf-eyebrow">{eyebrow}</span>
          </div>

          <h1 className="text-[12vw] sm:text-7xl md:text-8xl lg:text-[8rem] leading-[0.9] font-[var(--font-anton)] uppercase tracking-tight text-[var(--color-kopf-bone)] kopf-fade-up kopf-fade-up-delay-1">
            {title}
          </h1>

          {subtitle && (
            <div className="mt-8 max-w-3xl text-base md:text-lg leading-relaxed text-[var(--color-kopf-bone-muted)] kopf-fade-up kopf-fade-up-delay-2">
              {subtitle}
            </div>
          )}

          {children && (
            <div className="mt-10 kopf-fade-up kopf-fade-up-delay-3">{children}</div>
          )}
        </div>
      </div>

      {/* Tire-tread divider */}
      <div className="tread-divider" aria-hidden="true" />
    </section>
  );
}
