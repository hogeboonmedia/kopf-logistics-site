import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kopflogisticsgroup.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/shippers`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/freight-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/carriers`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/drivers`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/technology`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ];
}
