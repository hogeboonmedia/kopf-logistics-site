import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPaginatedPosts } from "@/lib/blog";
import ArchiveList from "@/components/sections/ArchiveList";
import BlogPagination from "@/components/sections/BlogPagination";

const ARCHIVE_PER_PAGE = 10;

type Params = { num: string };

/**
 * Build all paginated archive routes at compile time.
 *
 * Page 1 lives at /blog/ (not /blog/page/1/) so generateStaticParams returns
 * pages 2 through totalPages. Anything outside that range gets notFound().
 */
export async function generateStaticParams(): Promise<Params[]> {
  const allPosts = getAllPosts();
  const older = allPosts.slice(13); // 1 hero + 2 featured + 10 latest = 13
  const totalPages = Math.ceil(older.length / ARCHIVE_PER_PAGE);
  const params: Params[] = [];
  for (let i = 2; i <= totalPages; i++) {
    params.push({ num: String(i) });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { num } = await params;
  const pageNum = Number.parseInt(num, 10);
  const allPosts = getAllPosts();
  const older = allPosts.slice(13);
  const { totalPages } = getPaginatedPosts(older, pageNum, ARCHIVE_PER_PAGE);

  // rel=prev / rel=next emitted via metadata.other so Google still gets the
  // pagination hints. Page 2's "prev" points to /blog/ (not /blog/page/1/)
  // because page 1 lives at the canonical /blog/ URL.
  const prevHref =
    pageNum === 2
      ? "https://kopflogisticsgroup.com/blog/"
      : `https://kopflogisticsgroup.com/blog/page/${pageNum - 1}/`;
  const nextHref =
    pageNum < totalPages
      ? `https://kopflogisticsgroup.com/blog/page/${pageNum + 1}/`
      : null;

  const otherTags: Record<string, string> = {};
  if (pageNum > 1) otherTags["link:prev"] = prevHref;
  if (nextHref) otherTags["link:next"] = nextHref;

  return {
    title: { absolute: `Blog Archive · Page ${pageNum} of ${totalPages} - Kopf Logistics Group` },
    description: `Browse the Kopf Logistics archive — page ${pageNum} of ${totalPages}. Insights on freight brokerage, trucking, and life on the road.`,
    alternates: { canonical: `/blog/page/${pageNum}/` },
  };
}

export default async function BlogArchivePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { num } = await params;
  const pageNum = Number.parseInt(num, 10);

  if (!Number.isFinite(pageNum) || pageNum < 2) notFound();

  const allPosts = getAllPosts();
  const older = allPosts.slice(13);
  const page = getPaginatedPosts(older, pageNum, ARCHIVE_PER_PAGE);

  if (pageNum > page.totalPages) notFound();

  return (
    <>
      {/* Header — clean breadcrumb + page label, no hero/featured re-show */}
      <section
        className="px-6 lg:px-10 pt-16 pb-10 md:pt-24 md:pb-14"
        style={{ borderBottom: "1px solid var(--hairline)" }}
      >
        <div className="max-w-7xl mx-auto">
          <Link
            href="/blog/"
            className="inline-flex items-center gap-2 mb-6 font-[var(--font-jetbrains)] text-xs uppercase tracking-[0.22em] hover:text-[var(--accent)] transition"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Articles
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="kopf-chapter">§ Archive</span>
            <span className="h-px w-10" style={{ background: "var(--accent)" }} />
            <span className="kopf-eyebrow">
              Page {pageNum} of {page.totalPages}
            </span>
          </div>

          <h1
            className="font-[var(--font-anton)] uppercase leading-[0.95] tracking-tight text-4xl md:text-5xl lg:text-6xl"
            style={{ color: "var(--text)" }}
          >
            Every Article
            <br />
            <span style={{ color: "var(--accent)" }}>We&apos;ve Written</span>
          </h1>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-14 md:py-20">
        <div className="max-w-7xl mx-auto">
          <ArchiveList posts={page.posts} />
          <BlogPagination
            currentPage={page.currentPage}
            totalPages={page.totalPages}
          />
        </div>
      </section>
    </>
  );
}
