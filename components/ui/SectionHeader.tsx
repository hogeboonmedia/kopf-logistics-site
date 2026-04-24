import { ReactNode } from "react";

interface Props {
  chapter: string;
  eyebrow: string;
  title: string | ReactNode;
  kicker?: string | ReactNode;
  align?: "left" | "center";
}

export default function SectionHeader({
  chapter,
  eyebrow,
  title,
  kicker,
  align = "left",
}: Props) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${alignClass} max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
      <div className={`flex items-center gap-3 mb-4 ${align === "center" ? "justify-center" : ""}`}>
        <span className="kopf-chapter">§ {chapter}</span>
        <span className="h-px w-10" style={{ background: "var(--accent)" }} />
        <span className="kopf-eyebrow">{eyebrow}</span>
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-[var(--font-anton)] uppercase leading-[0.95] tracking-tight" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      {kicker && (
        <div className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-muted)" }}>
          {kicker}
        </div>
      )}
    </div>
  );
}
