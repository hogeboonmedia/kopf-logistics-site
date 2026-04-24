"use client";

import { Star } from "lucide-react";

export interface Testimonial {
  name: string;
  role: string;
  date: string;
  text: string;
  stars: number;
}

/**
 * Scrolling marquee of real 5-star Google reviews.
 * Two rows, opposite directions. Pauses on hover.
 */
export default function TestimonialsMarquee({
  testimonials,
  rating,
  total,
}: {
  testimonials: Testimonial[];
  rating: number;
  total: number;
}) {
  // Split testimonials into two rows so both sides scroll differently
  const mid = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, mid);
  const rowB = testimonials.slice(mid);

  return (
    <div className="relative">
      {/* Edge fades */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, var(--bg), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
      />

      <div className="overflow-hidden">
        <div className="kopf-marquee-track py-4">
          {[...rowA, ...rowA].map((t, i) => (
            <TestimonialCard key={`A-${i}`} {...t} />
          ))}
        </div>
      </div>

      <div className="overflow-hidden mt-6">
        <div
          className="kopf-marquee-track py-4"
          style={{ animationDirection: "reverse", animationDuration: "70s" }}
        >
          {[...rowB, ...rowB].map((t, i) => (
            <TestimonialCard key={`B-${i}`} {...t} />
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div
        className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t pt-8"
        style={{ borderColor: "var(--hairline)" }}
      >
        <div className="flex items-center gap-3">
          <GoogleG />
          <div className="text-left">
            <div className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--text-concrete)" }}>
              Google Reviews
            </div>
            <div className="font-[var(--font-anton)] text-2xl leading-none" style={{ color: "var(--text)" }}>
              {rating.toFixed(1)}
              <span className="text-sm font-[var(--font-jetbrains)] ml-2" style={{ color: "var(--text-muted)" }}>
                / 5.0
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="kopf-star w-5 h-5" strokeWidth={0} />
          ))}
        </div>
        <div className="font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
          Based on {total} Verified Reviews
        </div>
        <a
          href="https://www.google.com/search?q=kopf%20logistics%20group#mpd=~939958079496673605/customers/reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="kopf-btn"
        >
          Read All Reviews
        </a>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, date, text, stars }: Testimonial) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className="shrink-0 w-[340px] md:w-[420px] p-7 flex flex-col relative transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "var(--card)",
        border: "1px solid var(--hairline-strong)",
        minHeight: "260px",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 grid place-items-center font-[var(--font-anton)] uppercase text-lg tracking-tight"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            {initials}
          </div>
          <div>
            <div className="font-[var(--font-anton)] uppercase text-lg leading-none" style={{ color: "var(--text)" }}>
              {name}
            </div>
            <div
              className="mt-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "var(--text-concrete)" }}
            >
              {role} · {date}
            </div>
          </div>
        </div>
        <GoogleG className="w-6 h-6 shrink-0 opacity-80" />
      </div>

      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="kopf-star w-4 h-4" strokeWidth={0} />
        ))}
      </div>

      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: "var(--text-muted)" }}
      >
        &ldquo;{text}&rdquo;
      </p>
    </article>
  );
}

function GoogleG({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Google" role="img">
      <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.4 7.3-17.2z" />
      <path fill="#34A853" d="M24 48c6.6 0 12.2-2.2 16.3-5.9l-7.9-6c-2.2 1.4-5 2.3-8.4 2.3-6.4 0-11.9-4.4-13.9-10.2H1.9v6.4C5.9 42.3 14.3 48 24 48z" />
      <path fill="#FBBC05" d="M10.1 28.2c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7V12.4H1.9C.7 14.7 0 17.5 0 20.5s.7 5.8 1.9 8.1l8.2-6.4z" />
      <path fill="#EA4335" d="M24 9.5c3.6 0 6.8 1.2 9.3 3.7l7-7C36.2 2.1 30.6 0 24 0 14.3 0 5.9 5.7 1.9 12.4l8.2 6.4C12.1 13 17.6 9.5 24 9.5z" />
    </svg>
  );
}
