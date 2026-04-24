import { Mail, Phone } from "lucide-react";

export default function PhoneEmailBlock({ align = "left" }: { align?: "left" | "center" }) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start";
  return (
    <div
      className={`flex flex-col gap-2 ${alignClass} font-[var(--font-jetbrains)] tabular-nums text-sm`}
      style={{ color: "var(--text)" }}
    >
      <a
        href="mailto:recruiter@kopflogisticsgroup.com"
        className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
      >
        <Mail className="w-4 h-4" /> E: recruiter@kopflogisticsgroup.com
      </a>
      <a
        href="tel:5743495600"
        className="inline-flex items-center gap-2 hover:text-[var(--accent)] transition"
      >
        <Phone className="w-4 h-4" /> T: 574.349.5600
      </a>
    </div>
  );
}
