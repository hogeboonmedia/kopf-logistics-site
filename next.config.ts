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
    // Prefer modern formats. AVIF is ~25–35% smaller than WebP for photos,
    // WebP ~25% smaller than JPEG. Next.js falls back automatically for older
    // browsers. This is the single biggest lever for LCP on image-heavy pages.
    formats: ["image/avif", "image/webp"],
    // Next 16 rejects quality values not in this list (security: prevents
    // attackers from hammering the optimizer with random quality values to
    // inflate cost). Keep 75 (default) and add 40/50/60 for decorative bg
    // images that can tolerate lower quality.
    qualities: [40, 50, 60, 75, 80, 85, 90, 100],
    // Cache optimized image variants at the CDN for 30 days (default is 60s).
    // Next rebuilds regenerate keys so this doesn't cause stale images.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Keep compiled output smaller: drop console.* in production except warn/error.
  compiler: {
    removeConsole: { exclude: ["warn", "error"] },
  },
  // Per-import code-splitting for icon libs. Without this, importing a single
  // icon from lucide-react can pull the whole barrel file's metadata into the
  // bundle. With this, each icon becomes its own chunk and only what's used
  // ships. (Same trick works for date-fns, ramda, etc.)
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
      // --- Blog URL migration: date-based /YYYY/MM/slug/ → /blog/slug/ (Phase 3)
      { source: "/2017/05/tips-independent-freight-agents/", destination: "/blog/tips-independent-freight-agents/", permanent: true },
      { source: "/2017/05/why-should-a-millennial-consider-the-supply-chain/", destination: "/blog/why-should-a-millennial-consider-the-supply-chain/", permanent: true },
      { source: "/2017/06/leadership-tips-for-independent-freight-agents/", destination: "/blog/leadership-tips-for-independent-freight-agents/", permanent: true },
      { source: "/2017/10/helping-houston/", destination: "/blog/helping-houston/", permanent: true },
      { source: "/2017/11/4-ways-to-prepare-for-the-holiday-season/", destination: "/blog/4-ways-to-prepare-for-the-holiday-season/", permanent: true },
      { source: "/2017/12/9-cold-call-questions-independent-freight-brokers-should-be-asking/", destination: "/blog/9-cold-call-questions-independent-freight-brokers-should-be-asking/", permanent: true },
      { source: "/2017/12/how-does-bad-weather-impact-transportation/", destination: "/blog/how-does-bad-weather-impact-transportation/", permanent: true },
      { source: "/2017/12/the-habits-of-successful-freight-agents/", destination: "/blog/the-habits-of-successful-freight-agents/", permanent: true },
      { source: "/2017/12/tips-for-loading-dock-safety/", destination: "/blog/tips-for-loading-dock-safety/", permanent: true },
      { source: "/2018/03/5-helpful-tips-for-independent-freight-agents-before-and-after-the-cold-call/", destination: "/blog/5-helpful-tips-for-independent-freight-agents-before-and-after-the-cold-call/", permanent: true },
      { source: "/2018/04/geofencing-tracking/", destination: "/blog/geofencing-tracking/", permanent: true },
      { source: "/2018/04/the-four-cs-of-leadership/", destination: "/blog/the-four-cs-of-leadership/", permanent: true },
      { source: "/2019/06/5-ways-to-stay-connected-with-family-on-the-road/", destination: "/blog/5-ways-to-stay-connected-with-family-on-the-road/", permanent: true },
      { source: "/2019/07/how-drivers-can-stay-fit-on-the-road-tips-workout-ideas/", destination: "/blog/how-drivers-can-stay-fit-on-the-road-tips-workout-ideas/", permanent: true },
      { source: "/2019/08/ifa-work-life-balance/", destination: "/blog/ifa-work-life-balance/", permanent: true },
      { source: "/2019/09/thankatrucker/", destination: "/blog/thankatrucker/", permanent: true },
      { source: "/2019/10/agent-vs-broker/", destination: "/blog/agent-vs-broker/", permanent: true },
      { source: "/2019/11/honor-veterans/", destination: "/blog/honor-veterans/", permanent: true },
      { source: "/2019/12/freight-agent-marketing/", destination: "/blog/freight-agent-marketing/", permanent: true },
      { source: "/2020/01/benefits-of-3pl/", destination: "/blog/benefits-of-3pl/", permanent: true },
      { source: "/2020/02/freight-agent-motivation/", destination: "/blog/freight-agent-motivation/", permanent: true },
      { source: "/2020/03/generate-better-leads/", destination: "/blog/generate-better-leads/", permanent: true },
      { source: "/2020/04/freight-agent-customer-satisfaction/", destination: "/blog/freight-agent-customer-satisfaction/", permanent: true },
      { source: "/2020/05/how-to-negotiate-freight-rates-top-tips-for-success-in-logistics/", destination: "/blog/how-to-negotiate-freight-rates-top-tips-for-success-in-logistics/", permanent: true },
      { source: "/2020/06/best-cold-call-script-for-freight-agents/", destination: "/blog/best-cold-call-script-for-freight-agents/", permanent: true },
      { source: "/2020/07/freight-agent-employee-motivation/", destination: "/blog/freight-agent-employee-motivation/", permanent: true },
      { source: "/2020/07/our-story-family-faith-business/", destination: "/blog/our-story-family-faith-business/", permanent: true },
      { source: "/2020/08/freight-agent-goal-setting/", destination: "/blog/freight-agent-goal-setting/", permanent: true },
      { source: "/2020/09/qualities-great-truck-drivers/", destination: "/blog/qualities-great-truck-drivers/", permanent: true },
      { source: "/2020/10/truck-driver-pets/", destination: "/blog/truck-driver-pets/", permanent: true },
      { source: "/2020/11/gratitude-benefits/", destination: "/blog/gratitude-benefits/", permanent: true },
      { source: "/2020/12/trucker-healthy-eating/", destination: "/blog/trucker-healthy-eating/", permanent: true },
      { source: "/2021/01/freight-agents-balance-work-home-life/", destination: "/blog/freight-agents-balance-work-home-life/", permanent: true },
      { source: "/2021/02/3-mistakes-made-by-independent-freight-agents/", destination: "/blog/3-mistakes-made-by-independent-freight-agents/", permanent: true },
      { source: "/2021/03/women-in-trucking/", destination: "/blog/women-in-trucking/", permanent: true },
      { source: "/2021/04/truck-driver-facts/", destination: "/blog/truck-driver-facts/", permanent: true },
      { source: "/2021/05/top-3-truck-stops-for-drivers-across-the-country/", destination: "/blog/top-3-truck-stops-for-drivers-across-the-country/", permanent: true },
      { source: "/2021/06/career-in-transportation/", destination: "/blog/career-in-transportation/", permanent: true },
      { source: "/2021/08/communication-mistakes/", destination: "/blog/communication-mistakes/", permanent: true },
      { source: "/2021/12/driving-a-truck-the-best-safety-tips-for-truck-drivers/", destination: "/blog/driving-a-truck-the-best-safety-tips-for-truck-drivers/", permanent: true },
      { source: "/2021/12/how-to-start-a-career-in-logistics/", destination: "/blog/how-to-start-a-career-in-logistics/", permanent: true },
      { source: "/2021/12/the-best-tips-for-becoming-an-independent-freight-agent/", destination: "/blog/the-best-tips-for-becoming-an-independent-freight-agent/", permanent: true },
      { source: "/2021/12/what-influences-freight-shipping-costs/", destination: "/blog/what-influences-freight-shipping-costs/", permanent: true },
      { source: "/2022/01/package-delivery-drivers-how-to-become-one/", destination: "/blog/package-delivery-drivers-how-to-become-one/", permanent: true },
      { source: "/2022/01/shippers-how-to-choose-the-right-independent-freight-agents/", destination: "/blog/shippers-how-to-choose-the-right-independent-freight-agents/", permanent: true },
      { source: "/2022/01/shipping-vs-logistics-what-are-the-differences/", destination: "/blog/shipping-vs-logistics-what-are-the-differences/", permanent: true },
      { source: "/2022/02/4-reasons-to-become-a-truck-owner-operator/", destination: "/blog/4-reasons-to-become-a-truck-owner-operator/", permanent: true },
      { source: "/2022/02/brokerage-blogs-what-is-a-transportation-brokerage-company/", destination: "/blog/brokerage-blogs-what-is-a-transportation-brokerage-company/", permanent: true },
      { source: "/2022/02/how-long-do-reefer-trailers-last/", destination: "/blog/how-long-do-reefer-trailers-last/", permanent: true },
      { source: "/2022/02/tips-for-freight-agents-looking-to-secure-a-contract-carrier/", destination: "/blog/tips-for-freight-agents-looking-to-secure-a-contract-carrier/", permanent: true },
      { source: "/2022/02/truck-talk-temperatures-and-refrigerated-trucks/", destination: "/blog/truck-talk-temperatures-and-refrigerated-trucks/", permanent: true },
      { source: "/2022/02/what-are-the-top-benefits-of-team-driving-truck-jobs/", destination: "/blog/what-are-the-top-benefits-of-team-driving-truck-jobs/", permanent: true },
      { source: "/2022/02/what-is-no-touch-freight-and-why-does-it-matter-for-truck-drivers/", destination: "/blog/what-is-no-touch-freight-and-why-does-it-matter-for-truck-drivers/", permanent: true },
      { source: "/2022/02/when-do-truckers-have-to-undergo-a-dot-drug-screen/", destination: "/blog/when-do-truckers-have-to-undergo-a-dot-drug-screen/", permanent: true },
      { source: "/2022/04/3-things-you-need-to-know-about-a-career-in-shipping-and-logistics/", destination: "/blog/3-things-you-need-to-know-about-a-career-in-shipping-and-logistics/", permanent: true },
      { source: "/2022/04/4-ways-logistics-can-affect-your-supply-chain/", destination: "/blog/4-ways-logistics-can-affect-your-supply-chain/", permanent: true },
      { source: "/2022/04/suggested-meta-description/", destination: "/blog/suggested-meta-description/", permanent: true },
      { source: "/2022/05/common-myths-about-independent-freight-agents-you-should-know/", destination: "/blog/common-myths-about-independent-freight-agents-you-should-know/", permanent: true },
      { source: "/2022/05/how-to-hire-truck-drivers/", destination: "/blog/how-to-hire-truck-drivers/", permanent: true },
      { source: "/2022/05/what-are-the-benefits-of-outsourcing-logistics/", destination: "/blog/what-are-the-benefits-of-outsourcing-logistics/", permanent: true },
      { source: "/2022/05/what-are-the-pros-and-cons-of-shipping-by-road/", destination: "/blog/what-are-the-pros-and-cons-of-shipping-by-road/", permanent: true },
      { source: "/2022/06/become-a-freight-agency-owner/", destination: "/blog/become-a-freight-agency-owner/", permanent: true },
      { source: "/2022/09/4-tips-to-help-freight-agents-stay-organized/", destination: "/blog/4-tips-to-help-freight-agents-stay-organized/", permanent: true },
      { source: "/2022/09/why-strong-communication-is-a-must-for-freight-agents/", destination: "/blog/why-strong-communication-is-a-must-for-freight-agents/", permanent: true },
      { source: "/2022/10/5-top-ways-for-independent-freight-agents-to-land-a-customer/", destination: "/blog/5-top-ways-for-independent-freight-agents-to-land-a-customer/", permanent: true },
      { source: "/2022/10/why-customer-retention-is-important-for-freight-agents/", destination: "/blog/why-customer-retention-is-important-for-freight-agents/", permanent: true },
      { source: "/2022/12/cold-calling-prospects/", destination: "/blog/cold-calling-prospects/", permanent: true },
      { source: "/2023/01/increase-profit-margins/", destination: "/blog/increase-profit-margins/", permanent: true },
      { source: "/2023/02/high-performers/", destination: "/blog/high-performers/", permanent: true },
      { source: "/2023/05/remote-freight-broker-jobs/", destination: "/blog/remote-freight-broker-jobs/", permanent: true },
      { source: "/2023/06/freight-agent-benefits/", destination: "/blog/freight-agent-benefits/", permanent: true },
      { source: "/2023/07/freight-agent-productivity/", destination: "/blog/freight-agent-productivity/", permanent: true },
      { source: "/2023/08/can-you-be-a-freight-broker-and-a-carrier/", destination: "/blog/can-you-be-a-freight-broker-and-a-carrier/", permanent: true },
      { source: "/2023/09/freight-agent-job-description/", destination: "/blog/freight-agent-job-description/", permanent: true },
      { source: "/2023/10/diversify-book-of-business/", destination: "/blog/diversify-book-of-business/", permanent: true },
      { source: "/2023/11/industries-to-target/", destination: "/blog/industries-to-target/", permanent: true },
      { source: "/2023/12/cold-email-template/", destination: "/blog/cold-email-template/", permanent: true },
      { source: "/2024/01/shipper-questions-for-freight-agents/", destination: "/blog/shipper-questions-for-freight-agents/", permanent: true },
      { source: "/2024/02/common-challenges-for-freight-agents/", destination: "/blog/common-challenges-for-freight-agents/", permanent: true },
      { source: "/2024/02/what-is-a-freight-agent-everything-you-need-to-know/", destination: "/blog/what-is-a-freight-agent-everything-you-need-to-know/", permanent: true },
      { source: "/2024/03/truck-dispatcher-to-freight-agent/", destination: "/blog/truck-dispatcher-to-freight-agent/", permanent: true },
      { source: "/2024/04/what-is-a-freight-broker/", destination: "/blog/what-is-a-freight-broker/", permanent: true },
      { source: "/2024/05/freight-agent-stress/", destination: "/blog/freight-agent-stress/", permanent: true },
      { source: "/2024/06/how-freight-brokers-find-loads/", destination: "/blog/how-freight-brokers-find-loads/", permanent: true },
      { source: "/2024/07/can-freight-agents-work-from-home/", destination: "/blog/can-freight-agents-work-from-home/", permanent: true },
      { source: "/2024/08/how-freight-brokers-find-shippers/", destination: "/blog/how-freight-brokers-find-shippers/", permanent: true },
      { source: "/2024/09/freight-brokers-add-value-to-shippers/", destination: "/blog/freight-brokers-add-value-to-shippers/", permanent: true },
      { source: "/2024/10/freight-broker-training-classes/", destination: "/blog/freight-broker-training-classes/", permanent: true },
      { source: "/2024/11/where-do-freight-brokers-get-loads/", destination: "/blog/where-do-freight-brokers-get-loads/", permanent: true },
      { source: "/2024/12/freight-broker-sales-tips/", destination: "/blog/freight-broker-sales-tips/", permanent: true },
      { source: "/2025/01/freight-broker-sales-pitch/", destination: "/blog/freight-broker-sales-pitch/", permanent: true },
      { source: "/2025/02/books-for-freight-brokers/", destination: "/blog/books-for-freight-brokers/", permanent: true },
      { source: "/2025/03/refrigerated-freight-broker/", destination: "/blog/refrigerated-freight-broker/", permanent: true },
      { source: "/2025/04/liquid-bulk-freight-broker/", destination: "/blog/liquid-bulk-freight-broker/", permanent: true },
      { source: "/2025/05/how-to-build-a-larger-freight-broker-book-of-business/", destination: "/blog/how-to-build-a-larger-freight-broker-book-of-business/", permanent: true },
      { source: "/2025/06/successful-freight-broker/", destination: "/blog/successful-freight-broker/", permanent: true },
      { source: "/2025/07/how-to-bid-on-freight-contracts/", destination: "/blog/how-to-bid-on-freight-contracts/", permanent: true },
      { source: "/2025/08/a-list-of-healthy-meals-for-truck-drivers/", destination: "/blog/a-list-of-healthy-meals-for-truck-drivers/", permanent: true },
      { source: "/2025/09/what-are-freight-brokerage-services/", destination: "/blog/what-are-freight-brokerage-services/", permanent: true },
      { source: "/2025/10/no-touch-freight/", destination: "/blog/no-touch-freight/", permanent: true },
      { source: "/2025/11/working-with-a-carrier-vs-broker/", destination: "/blog/working-with-a-carrier-vs-broker/", permanent: true },
      { source: "/2025/12/freight-broker-commission-split/", destination: "/blog/freight-broker-commission-split/", permanent: true },
      { source: "/2026/01/a-guide-to-freight-broker-email-marketing/", destination: "/blog/a-guide-to-freight-broker-email-marketing/", permanent: true },
      { source: "/2026/02/how-to-create-email-subject-lines-that-freight-shippers-will-open/", destination: "/blog/how-to-create-email-subject-lines-that-freight-shippers-will-open/", permanent: true },
      { source: "/2026/03/high-converting-email-copy-for-freight-brokers/", destination: "/blog/high-converting-email-copy-for-freight-brokers/", permanent: true },
      { source: "/2026/04/become-an-independent-freight-agent/", destination: "/blog/become-an-independent-freight-agent/", permanent: true },
      { source: "/2026/04/test/", destination: "/blog/test/", permanent: true },
      // Also cover without trailing slash (belt-and-suspenders for any links without trailing slash)
      { source: "/2026/05/independent-freight-agent-vs-traditional-broker-which-career-fits-you/", destination: "/blog/independent-freight-agent-vs-traditional-broker-which-career-fits-you/", permanent: true },

      // --- Main-page slug changes (existing + Phase 7.3)
      { source: "/agents", destination: "/agent", permanent: true },
      { source: "/agents/", destination: "/agent/", permanent: true },
      { source: "/agents/:path*", destination: "/agent/:path*", permanent: true },
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
