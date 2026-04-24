import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPosts,
  getAllCategories,
  formatPostDate,
  titleCase,
} from "@/lib/blog";
import SectionHeader from "@/components/ui/SectionHeader";
import { ArrowUpRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on becoming an independent freight agent, freight brokerage, trucking careers, and life on the road — from the team at Kopf Logistics Group.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const allPosts = getAllPosts();
  const categories = getAllCategories();
  const [hero, ...rest] = allPosts;
  const featured = rest.slice(0, 2);
  const latest = rest.slice(2, 12);
  const older = rest.slice(12);

  return (
    <>
      {/* Hero */}
      <section className="relative px-6 lg:px-10 pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ Blog</span>
            <span className="h-px w-10" style={{ background: "var(--accent)" }} />
            <span className="kopf-eyebrow">
              Insights for Agents, Shippers & Drivers
            </span>
          </div>
          <h1
            className="font-[var(--font-anton)] uppercase leading-[0.9] tracking-tight text-[14vw] sm:text-7xl md:text-8xl lg:text-[9rem]"
            style={{ color: "var(--text)" }}
          >
            The <span style={{ color: "var(--accent)" }}>Kopf</span>
            <br />
            Logbook
          </h1>
          <p
            className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {allPosts.length} articles on freight brokerage, carrier operations, driver
            life, and growing your independent agency — written by the people who run
            Kopf Logistics every day.
          </p>
        </div>
      </section>

      <div className="tread-divider" aria-hidden="true" />

      {/* Category filter bar */}
      <section className="px-6 lg:px-10 py-6" style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.22em]">
          <span className="kopf-eyebrow">Filter:</span>
          <Link
            href="/blog"
            className="transition hover:text-[var(--accent)]"
            style={{ color: "var(--text)" }}
          >
            All ({allPosts.length})
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/category/${c.slug}`}
              className="transition hover:text-[var(--accent)]"
              style={{ color: "var(--text-muted)" }}
            >
              {titleCase(c.slug)} ({c.count})
            </Link>
          ))}
        </div>
      </section>

      {/* HERO POST + 2 FEATURED */}
      <section className="px-6 lg:px-10 py-14 md:py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            chapter="01"
            eyebrow="Latest from the Logbook"
            title="Fresh off the Desk"
          />

          <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* Hero card */}
            {hero && (
              <Link
                href={hero.urlPath}
                className="group block relative overflow-hidden"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--hairline-strong)",
                }}
              >
                {hero.featuredImage && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={hero.featuredImage}
                      alt={hero.featuredImageAlt || hero.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <span
                      className="absolute top-5 left-5 px-3 py-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
                      style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                    >
                      {titleCase(hero.category)}
                    </span>
                  </div>
                )}
                <div className="p-7">
                  <div
                    className="flex items-center gap-4 mb-4 text-[11px] font-[var(--font-jetbrains)] uppercase tracking-[0.22em]"
                    style={{ color: "var(--text-concrete)" }}
                  >
                    <time dateTime={hero.date}>{formatPostDate(hero.date)}</time>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {hero.readingMinutes} min
                    </span>
                  </div>
                  <h3
                    className="font-[var(--font-anton)] uppercase text-3xl md:text-4xl leading-[1.05] tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {hero.title}
                  </h3>
                  <p
                    className="mt-4 leading-relaxed text-base md:text-lg line-clamp-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {hero.description}
                  </p>
                  <span
                    className="mt-6 inline-flex items-center gap-2 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em]"
                    style={{ color: "var(--accent)" }}
                  >
                    Read Article <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                  </span>
                </div>
              </Link>
            )}

            {/* 2 smaller featured posts */}
            <div className="grid gap-6">
              {featured.map((p) => (
                <PostCard key={p.slug} post={p} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest grid */}
      {latest.length > 0 && (
        <section
          className="px-6 lg:px-10 py-14 md:py-20"
          style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--hairline)" }}
        >
          <div className="max-w-7xl mx-auto">
            <SectionHeader chapter="02" eyebrow="More Recent" title="Latest Articles" />
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latest.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Archive list (all other posts) */}
      {older.length > 0 && (
        <section className="px-6 lg:px-10 py-14 md:py-20">
          <div className="max-w-7xl mx-auto">
            <SectionHeader chapter="03" eyebrow="Complete Archive" title="Every Article We've Written" />
            <ul className="mt-10 divide-y" style={{ borderTop: "1px solid var(--hairline-strong)", borderBottom: "1px solid var(--hairline-strong)" }}>
              {older.map((p) => (
                <li key={p.slug} style={{ borderColor: "var(--hairline)" }}>
                  <Link
                    href={p.urlPath}
                    className="group grid grid-cols-[auto_1fr_auto] gap-6 items-baseline py-5 transition"
                  >
                    <time
                      className="font-[var(--font-jetbrains)] text-xs tabular-nums uppercase tracking-[0.22em]"
                      style={{ color: "var(--text-concrete)" }}
                    >
                      {new Date(p.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
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
          </div>
        </section>
      )}
    </>
  );
}

function PostCard({
  post,
  compact = false,
}: {
  post: ReturnType<typeof getAllPosts>[number];
  compact?: boolean;
}) {
  return (
    <Link
      href={post.urlPath}
      className="group block relative overflow-hidden transition"
      style={{
        background: "var(--card)",
        border: "1px solid var(--hairline-strong)",
      }}
    >
      {post.featuredImage && (
        <div className={`relative overflow-hidden ${compact ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute top-4 left-4 px-3 py-1 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            {titleCase(post.category)}
          </span>
        </div>
      )}
      <div className={compact ? "p-5" : "p-6"}>
        <div
          className="flex items-center gap-3 mb-3 text-[10px] font-[var(--font-jetbrains)] uppercase tracking-[0.22em]"
          style={{ color: "var(--text-concrete)" }}
        >
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {post.readingMinutes} min
          </span>
        </div>
        <h3
          className={`font-[var(--font-anton)] uppercase leading-tight tracking-tight ${
            compact ? "text-xl" : "text-2xl"
          }`}
          style={{ color: "var(--text)" }}
        >
          {post.title}
        </h3>
        <p
          className={`mt-3 leading-relaxed line-clamp-2 ${compact ? "text-sm" : "text-sm"}`}
          style={{ color: "var(--text-muted)" }}
        >
          {post.description}
        </p>
      </div>
    </Link>
  );
}
