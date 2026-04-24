import type { NextConfig } from "next";

// Content-Security-Policy assembled here so the directives are easy to scan.
// Notes on the choices:
//   - 'unsafe-inline' on scripts is needed for Next.js's inline boot script
//     and the JSON-LD <script> tags. We could move to nonces, but for a
//     mostly-static marketing site the trade-off isn't worth the complexity.
//   - challenges.cloudflare.com — Turnstile (contact form + comments).
//   - unpkg.com — Sveltia CMS bundle loaded on /admin/.
//   - api.github.com / github.com — Sveltia talks to GitHub for repo writes.
//   - data: on img-src — needed for the lucide icon SVGs Next.js inlines.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://unpkg.com https://www.youtube.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com",
  "img-src 'self' data: blob: https://kopflogisticsgroup.com https://img.youtube.com https://images.pexels.com https://avatars.githubusercontent.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "connect-src 'self' https://api.github.com https://github.com https://challenges.cloudflare.com",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: csp },
  // Defend against MIME sniffing on downloads
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kopflogisticsgroup.com", pathname: "/wp-content/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Sveltia reads /admin/config.yml at page load. If the browser caches a
      // stale copy (which happens whenever we tweak the config), the editor
      // silently uses the old config and breaks. no-cache forces revalidation.
      {
        source: "/admin/config.yml",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
    ];
  },
  async redirects() {
    return [
      // --- Main-page slug changes (existing)
      { source: "/freight-agents", destination: "/agent", permanent: true },
      { source: "/freight-agents/:path*", destination: "/agent/:path*", permanent: true },
      { source: "/technology", destination: "/#technology-made-to-measure", permanent: true },
      { source: "/technology/:path*", destination: "/#technology-made-to-measure", permanent: true },

      // --- Legacy image paths: WP stored images at /wp-content/uploads/*.
      // We moved blog images to /blog-images/ and the hero/service art to /kopf-original/images/.
      // Google Image Search still indexes the old paths — preserve the ranking juice with 301s.
      {
        source: "/wp-content/uploads/2017/:path*",
        destination: "/blog-images/2017/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2018/:path*",
        destination: "/blog-images/2018/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2019/:path*",
        destination: "/blog-images/2019/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2020/:path*",
        destination: "/blog-images/2020/:path*",
        permanent: true,
      },
      // Site-asset overrides (2021/06) — specific rules match before the year catch-all
      { source: "/wp-content/uploads/2021/06/kopf_orangelogo_no_bg_02.png", destination: "/kopf-original/images/kopf_orangelogo_no_bg_02.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/Kopf-logo_white.png", destination: "/kopf-original/images/Kopf-logo_white.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/Kopf-logo_white-300x171.png", destination: "/kopf-original/images/Kopf-logo_white-300x171.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/klg_hp_blue_bg_tread2.png", destination: "/kopf-original/images/klg_hp_blue_bg_tread2.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/01_TRUCKLOAD.png", destination: "/kopf-original/images/01_TRUCKLOAD.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/02_TEMPERATURE-CONTROLLED.png", destination: "/kopf-original/images/02_TEMPERATURE-CONTROLLED.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/03_OPEN-DECK.png", destination: "/kopf-original/images/03_OPEN-DECK.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/04_LESS-THAN-TRUCKLOAD.png", destination: "/kopf-original/images/04_LESS-THAN-TRUCKLOAD.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/05_BULK-TRANSPORT.png", destination: "/kopf-original/images/05_BULK-TRANSPORT.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/06_POWER-ONLY.png", destination: "/kopf-original/images/06_POWER-ONLY.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/07_DROP-TRAILER-SERVICE.png", destination: "/kopf-original/images/07_DROP-TRAILER-SERVICE.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/08_DROP-HOOK-SERVICE.png", destination: "/kopf-original/images/08_DROP-HOOK-SERVICE.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/09_TRAILER-INTERCHANGE.png", destination: "/kopf-original/images/09_TRAILER-INTERCHANGE.png", permanent: true },
      { source: "/wp-content/uploads/2021/06/10_OWNER-OPERATORS.png", destination: "/kopf-original/images/10_OWNER-OPERATORS.png", permanent: true },

      // Site-asset overrides (2021/07)
      { source: "/wp-content/uploads/2021/07/ada-compliant.png", destination: "/kopf-original/images/ada-compliant.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/home_bg_tech.jpg", destination: "/kopf-original/images/home_bg_tech.jpg", permanent: true },
      { source: "/wp-content/uploads/2021/07/home_bg_quote2.jpg", destination: "/kopf-original/images/home_bg_quote2.jpg", permanent: true },
      { source: "/wp-content/uploads/2021/07/leroy_sig.png", destination: "/kopf-original/images/leroy_sig.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/letter_title.png", destination: "/kopf-original/images/letter_title.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/operate_bg_orange.jpg", destination: "/kopf-original/images/operate_bg_orange.jpg", permanent: true },
      { source: "/wp-content/uploads/2021/07/01_icon-150x150.png", destination: "/kopf-original/images/01_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/02_icon-150x150.png", destination: "/kopf-original/images/02_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/03_icon-150x150.png", destination: "/kopf-original/images/03_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/04_icon-150x150.png", destination: "/kopf-original/images/04_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/05_icon-150x150.png", destination: "/kopf-original/images/05_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/07_icon-150x150.png", destination: "/kopf-original/images/07_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/08_icon-150x150.png", destination: "/kopf-original/images/08_icon-150x150.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/drivers_road.png", destination: "/kopf-original/images/drivers_road.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/drivers_regional.png", destination: "/kopf-original/images/drivers_regional.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/drivers_part-time.png", destination: "/kopf-original/images/drivers_part-time.png", permanent: true },
      { source: "/wp-content/uploads/2021/07/drivers_casual.png", destination: "/kopf-original/images/drivers_casual.png", permanent: true },

      // Site-asset overrides (2022)
      { source: "/wp-content/uploads/2022/02/truck_full_5-1000x670-1.png", destination: "/kopf-original/images/truck_full_5-1000x670-1.png", permanent: true },
      { source: "/wp-content/uploads/2022/03/shippers_bg2.jpg", destination: "/kopf-original/images/shippers_bg2.jpg", permanent: true },

      // Site-asset override (2023)
      { source: "/wp-content/uploads/2023/05/100K-image_kopf_Carriers-Page-e1684786563592-300x224.png", destination: "/kopf-original/images/100K-image_kopf_Carriers-Page-e1684786563592-300x224.png", permanent: true },

      // Year catch-alls (apply to everything else — i.e. blog images)
      { source: "/wp-content/uploads/2021/:path*", destination: "/blog-images/2021/:path*", permanent: true },
      { source: "/wp-content/uploads/2022/:path*", destination: "/blog-images/2022/:path*", permanent: true },
      {
        source: "/wp-content/uploads/2023/:path*",
        destination: "/blog-images/2023/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2024/:path*",
        destination: "/blog-images/2024/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2025/:path*",
        destination: "/blog-images/2025/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/uploads/2026/:path*",
        destination: "/blog-images/2026/:path*",
        permanent: true,
      },

      // --- Category and tag archive pages: WordPress created index pages at
      // /category/<slug>/ and /tag/<slug>/ that Google has indexed. We don't rebuild
      // these per-archive pages (yet) — route them to the main blog index with a
      // query-string hint so the content is still reachable.
      {
        source: "/category/:slug",
        destination: "/blog/?category=:slug",
        permanent: true,
      },
      {
        source: "/tag/:slug",
        destination: "/blog/?tag=:slug",
        permanent: true,
      },

      // --- Author archives (low priority on Kopf's site)
      { source: "/author/:slug*", destination: "/blog", permanent: true },

      // --- Pagination on the old blog archive (?paged=2 etc.)
      { source: "/page/:num", destination: "/blog", permanent: true },

      // --- WP feed URLs
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/feed/:path*", destination: "/blog", permanent: true },
      { source: "/comments/feed", destination: "/blog", permanent: true },

      // --- Legacy WP admin / xmlrpc paths — hard 404-ing these is fine SEO-wise
      // but we send them home to prevent bot traffic from hitting unknown endpoints.
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-login.php", destination: "/", permanent: false },
      { source: "/xmlrpc.php", destination: "/", permanent: false },

      // --- Trailing path conveniences
      { source: "/home", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
