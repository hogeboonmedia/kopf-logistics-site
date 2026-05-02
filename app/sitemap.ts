import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kopflogisticsgroup.com";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/shippers/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/agent/`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/carriers/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/drivers/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact/`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/blog/`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/privacy-policy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const allPosts = getAllPosts();

  const blogPages: MetadataRoute.Sitemap = allPosts.map((p) => ({
    url: `${base}${p.urlPath}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Paginated archive routes — /blog/page/2/, /blog/page/3/, etc.
  // Page 1 of the archive lives at /blog/ (already included above).
  const ARCHIVE_PER_PAGE = 10;
  const archiveCount = Math.max(0, allPosts.length - 13); // 1 hero + 2 featured + 10 latest = 13
  const totalArchivePages = Math.ceil(archiveCount / ARCHIVE_PER_PAGE);
  const archivePages: MetadataRoute.Sitemap = [];
  for (let i = 2; i <= totalArchivePages; i++) {
    archivePages.push({
      url: `${base}/blog/page/${i}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  return [...staticPages, ...blogPages, ...archivePages];
}
