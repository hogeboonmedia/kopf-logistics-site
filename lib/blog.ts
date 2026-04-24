import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** Frontmatter schema persisted on disk in content/blog/**.mdx. */
export interface PostMeta {
  title: string;
  metaTitle?: string;
  description: string;
  date: string;
  slug: string;
  year: string;
  month: string;
  category: string;
  categories: string[];
  tags: string[];
  author: string;
  featuredImage: string;
  featuredImageAlt: string;
  canonical: string;
  wpId: number;
}

export interface Post extends PostMeta {
  bodyHtml: string;
  urlPath: string;
  readingMinutes: number;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function wordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

let cache: Post[] | null = null;

/** Load and cache all posts, sorted newest-first. */
export function getAllPosts(): Post[] {
  if (cache) return cache;

  if (!fs.existsSync(CONTENT_DIR)) {
    cache = [];
    return cache;
  }

  const posts: Post[] = walk(CONTENT_DIR).map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const meta = data as Partial<PostMeta>;
    const words = wordCount(content);

    // Derive year/month/slug from the file path so the URL is the source of
    // truth (not whatever Marissa typed in the frontmatter editor). This means
    // a post at content/blog/2026/04/my-post.mdx is *always* served at
    // /2026/04/my-post/ regardless of frontmatter drift. Falls back to
    // frontmatter for any legacy post that doesn't follow the layout.
    const rel = path.relative(CONTENT_DIR, file);
    const parts = rel.split(path.sep); // e.g. ["2026", "04", "my-post.mdx"]
    const pathYear = parts.length >= 3 ? parts[0] : meta.year ?? "";
    const pathMonth = parts.length >= 3 ? parts[1] : meta.month ?? "";
    const pathSlug = parts.length >= 1
      ? parts[parts.length - 1].replace(/\.mdx?$/, "")
      : meta.slug ?? "";

    const merged: PostMeta = {
      title: meta.title ?? "",
      metaTitle: meta.metaTitle,
      description: meta.description ?? "",
      date: meta.date ?? "",
      slug: pathSlug,
      year: pathYear,
      month: pathMonth,
      category: meta.category ?? "uncategorized",
      categories: meta.categories ?? [],
      tags: meta.tags ?? [],
      author: meta.author ?? "",
      featuredImage: meta.featuredImage ?? "",
      featuredImageAlt: meta.featuredImageAlt ?? "",
      canonical: meta.canonical ?? "",
      wpId: meta.wpId ?? 0,
    };

    return {
      ...merged,
      bodyHtml: content,
      urlPath: `/${merged.year}/${merged.month}/${merged.slug}/`,
      readingMinutes: Math.max(1, Math.round(words / 220)),
    };
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = posts;
  return posts;
}

export function getPostByPath(
  year: string,
  month: string,
  slug: string
): Post | undefined {
  return getAllPosts().find(
    (p) => p.year === year && p.month === month && p.slug === slug
  );
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const scored = all.map((p) => {
    let score = 0;
    if (p.category === post.category) score += 3;
    for (const t of p.tags) if (post.tags.includes(t)) score += 1;
    return { post: p, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export function getAllCategories(): { slug: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const post of getAllPosts()) {
    for (const c of post.categories) counts[c] = (counts[c] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllTags(): { slug: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const post of getAllPosts()) {
    for (const t of post.tags) counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count);
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
