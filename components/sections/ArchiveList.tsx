import Link from "next/link";
import { type Post, titleCase } from "@/lib/blog";

/**
 * Compact archive row list — used by both /blog/ (page 1, first 10 posts in
 * the archive tail) and /blog/page/N/ (pages 2+).
 *
 * One row per post: Date · Title · Category. Links to the post.
 */
export default function ArchiveList({ posts }: { posts: Post[] }) {
  return (
    <ul
      className="mt-10 divide-y"
      style={{
        borderTop: "1px solid var(--hairline-strong)",
        borderBottom: "1px solid var(--hairline-strong)",
      }}
    >
      {posts.map((p) => (
        <li key={p.slug} style={{ borderColor: "var(--hairline)" }}>
          <Link
            href={p.urlPath}
            className="group grid grid-cols-[auto_1fr_auto] gap-6 items-baseline py-5 transition"
          >
            <time
              className="font-[var(--font-jetbrains)] text-xs tabular-nums uppercase tracking-[0.22em]"
              style={{ color: "var(--text-concrete)" }}
            >
              {new Date(p.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </time>
            <span
              className="font-[var(--font-anton)] uppercase text-xl md:text-2xl leading-tight tracking-tight group-hover:text-[var(--accent)] transition"
              style={{ color: "var(--text)" }}
            >
              {p.title}
            </span>
            <span
              className="font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em] hidden md:inline"
              style={{ color: "var(--text-muted)" }}
            >
              {titleCase(p.category)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
