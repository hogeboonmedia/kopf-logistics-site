import Link from "next/link";
import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface Props {
  href: string;
  children: ReactNode;
  variant?: "outline" | "solid";
  external?: boolean;
  arrow?: boolean;
  className?: string;
}

export default function Button({
  href,
  children,
  variant = "outline",
  external,
  arrow = true,
  className = "",
}: Props) {
  const cls = `kopf-btn ${variant === "solid" ? "kopf-btn--solid" : ""} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
