import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostByPath,
  getRelatedPosts,
  formatPostDate,
  titleCase,
} from "@/lib/blog";
import Button from "@/components/ui/Button";
import Comments from "@/components/sections/Comments";
import { ArrowLeft, Clock } from "lucide-react";

type Params = { year: string; month: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getAllPosts().map((p) => ({
    year: p.year,
    month: p.month,
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { year, month, slug } = await params;
  const post = getPostByPath(year, month, slug);
  if (!post) return {};
  return {
    title: { absolute: post.metaTitle || `${post.title} - Kopf Logistics Group` },
    description: post.description,
    alternates: { canonical: post.urlPath },
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.metaTitle || post.title,
      description: post.description,
      url: post.urlPath,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.featuredImage
        ? [{ url: post.featuredImage, alt: post.featuredImageAlt }]
        : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year, month, slug } = await params;
  const post = getPostByPath(year, month, slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: post.author },
    datePublished: post.date,
    image: post.featuredImage
      ? `https://kopflogisticsgroup.com${post.featuredImage}`
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://kopflogisticsgroup.com${post.urlPath}`,
    },
    publisher: {
      "@type": "Organization",
      "@id": "https://kopflogisticsgroup.com/#organization",
    },
  };

  return (
    <article>
      <Script
        id={`article-ld-${post.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Editorial title block — clean, no image overlay */}
      <header
        className="relative"
        style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--hairline)" }}
      >
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 pt-12 pb-14 md:pt-20 md:pb-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mb-8 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] hover:text-[var(--accent)] transition"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Articles
          </Link>

          {/* Category eyebrow — no chapter mark, just clean editorial label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="kopf-chapter">§ {titleCase(post.category)}</span>
            <span className="h-px w-10" style={{ background: "var(--accent)" }} />
            <Link
              href={`/blog/?category=${post.category}`}
              className="kopf-eyebrow hover:opacity-70 transition"
            >
              View all in {titleCase(post.category)} →
            </Link>
          </div>

          {/* H1 — generous size, leading-tight, never on top of an image */}
          <h1
            className="font-[var(--font-anton)] uppercase leading-[1.02] tracking-tight text-4xl md:text-5xl lg:text-[3.75rem]"
            style={{ color: "var(--text)" }}
          >
            {post.title}
          </h1>

          {/* Description / standfirst */}
          {post.description && (
            <p
              className="mt-6 max-w-3xl text-lg md:text-xl leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              {post.description}
            </p>
          )}

          {/* Byline rule */}
          <div
            className="mt-10 pt-6 flex flex-wrap items-center gap-x-8 gap-y-3 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--text-muted)", borderTop: "1px solid var(--hairline-strong)" }}
          >
            <span className="inline-flex items-center gap-2">
              <span style={{ color: "var(--text-concrete)" }}>By</span>
              <span style={{ color: "var(--text)" }}>{post.author}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span style={{ color: "var(--text-concrete)" }}>Published</span>
              <time dateTime={post.date} style={{ color: "var(--text)" }}>
                {formatPostDate(post.date)}
              </time>
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
      </header>

      {/* Featured image as a clean specimen — separate from the title */}
      {post.featuredImage && (
        <figure className="relative max-w-5xl mx-auto px-6 lg:px-10 -mt-px">
          <div
            className="relative aspect-[16/9] overflow-hidden mt-12 md:mt-16"
            style={{ border: "1px solid var(--hairline-strong)" }}
          >
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
          {post.featuredImageAlt && post.featuredImageAlt !== post.title && (
            <figcaption
              className="mt-3 font-[var(--font-jetbrains)] text-[11px] uppercase tracking-[0.22em] text-center"
              style={{ color: "var(--text-concrete)" }}
            >
              {post.featuredImageAlt}
            </figcaption>
          )}
        </figure>
      )}

      {/* Body content */}
      <div className="px-6 lg:px-10 py-14 md:py-20">
        <div
          className="prose-kopf max-w-3xl mx-auto"
          // WordPress content is already sanitized HTML
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="max-w-3xl mx-auto mt-14 pt-10" style={{ borderTop: "1px solid var(--hairline-strong)" }}>
            <h3 className="kopf-eyebrow mb-4">§ Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 text-xs font-[var(--font-jetbrains)] uppercase tracking-[0.15em]"
                  style={{
                    border: "1px solid var(--hairline-strong)",
                    color: "var(--text-muted)",
                  }}
                >
                  {titleCase(t)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <aside
          className="max-w-3xl mx-auto mt-16 p-8 md:p-10 relative overflow-hidden"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--hairline-strong)" }}
        >
          <span className="kopf-eyebrow">§ Ready to ship with Kopf?</span>
          <h2
            className="mt-3 font-[var(--font-anton)] uppercase text-3xl md:text-4xl leading-tight tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Let&apos;s get you moving.
          </h2>
          <p className="mt-3 max-w-xl" style={{ color: "var(--text-muted)" }}>
            Whether you&apos;re a shipper, contract carrier, or exploring the
            Independent Freight Agent path, our team is ready to help you get started
            today.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/agent" variant="solid">Become a Freight Agent</Button>
            <Button href="/contact">Contact Kopf</Button>
          </div>
        </aside>

        {/* Comments — pulled from Postgres at runtime via /api/comments/<slug> */}
        <Comments
          postSlug={`${post.year}/${post.month}/${post.slug}`}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        />
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section
          className="px-6 lg:px-10 py-14 md:py-20"
          style={{ background: "var(--bg-elevated)", borderTop: "1px solid var(--hairline)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="kopf-chapter">§ Related</span>
              <span className="h-px w-10" style={{ background: "var(--accent)" }} />
              <span className="kopf-eyebrow">More on {titleCase(post.category)}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={r.urlPath}
                  className="group block relative overflow-hidden transition"
                  style={{ background: "var(--card)", border: "1px solid var(--hairline-strong)" }}
                >
                  {r.featuredImage && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={r.featuredImage}
                        alt={r.featuredImageAlt || r.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <time
                      className="block mb-2 font-[var(--font-jetbrains)] text-[10px] uppercase tracking-[0.22em]"
                      style={{ color: "var(--text-concrete)" }}
                    >
                      {formatPostDate(r.date)}
                    </time>
                    <h3
                      className="font-[var(--font-anton)] uppercase text-lg leading-tight tracking-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
