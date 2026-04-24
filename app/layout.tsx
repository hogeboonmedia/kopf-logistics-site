import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";

// Anton = display type (hero + section H1/H2). Preloaded so the above-fold
// hero doesn't flash in fallback font.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Inter = body text. Small subset loaded for first paint.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono = eyebrows, tabular numbers, phone numbers. Not on the LCP
// critical path, so skip the automatic <link rel="preload"> — saves one
// round-trip on first paint.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Playfair removed — was only used in 3 blockquotes with Georgia as the
// fallback. Georgia is a universally-available system serif, so dropping the
// web-font download saves ~25 KB + 1 preload round-trip.

export const metadata: Metadata = {
  title: {
    default: "Home - Kopf Logistics Group",
    template: "%s - Kopf Logistics Group",
  },
  description:
    "Explore Kopf Logistics Group's 50+ years of excellence in trucking logistics with our advanced TMS, 24/7 support, and tailored solutions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kopflogisticsgroup.com",
    siteName: "Kopf Logistics Group",
    title: "Home - Kopf Logistics Group",
    description:
      "Explore Kopf Logistics Group's 50+ years of excellence in trucking logistics with our advanced TMS, 24/7 support, and tailored solutions.",
    images: [
      {
        url: "/kopf-original/images/truck_full_5-1000x670-1.png",
        width: 1000,
        height: 670,
        alt: "Kopf Logistics Group - 50 Years of Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home - Kopf Logistics Group",
    description:
      "Explore Kopf Logistics Group's 50+ years of excellence in trucking logistics with our advanced TMS, 24/7 support, and tailored solutions.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://kopflogisticsgroup.com"),
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0B08",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kopflogisticsgroup.com/#organization",
      name: "Kopf Logistics Group",
      url: "https://kopflogisticsgroup.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://kopflogisticsgroup.com/wp-content/uploads/2021/06/kopf_orangelogo_no_bg_02.png",
        width: 240,
        height: 111,
      },
      sameAs: [
        "https://www.facebook.com/kopflogisticsgroup/",
        "https://www.linkedin.com/company/kopf-logistics-group/",
        "https://www.youtube.com/channel/UCWhdS8UttCsDr0hrhMCcIqA",
        "https://www.instagram.com/kopflogistics",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+15743495600",
        contactType: "customer service",
        areaServed: "US",
        availableLanguage: ["English"],
      },
      description:
        "Kopf Logistics Group is a family-owned freight brokerage founded in 1966 in Elkhart, Indiana, providing truckload, LTL, temperature-controlled, open-deck, bulk, and power-only transportation across 48 states.",
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://kopflogisticsgroup.com/#localbusiness",
      name: "Kopf Logistics Group",
      image: "https://kopflogisticsgroup.com/wp-content/uploads/2021/06/kopf_orangelogo_no_bg_02.png",
      telephone: "+15743495600",
      email: "recruiter@kopflogisticsgroup.com",
      url: "https://kopflogisticsgroup.com/",
      address: {
        "@type": "PostalAddress",
        streetAddress: "2311 Toledo Road",
        addressLocality: "Elkhart",
        addressRegion: "IN",
        postalCode: "46516",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 41.67555, longitude: -85.92795 },
      priceRange: "$$",
      sameAs: [
        "https://www.facebook.com/kopflogisticsgroup/",
        "https://www.linkedin.com/company/kopf-logistics-group/",
        "https://www.instagram.com/kopflogistics",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/* Preconnect hints cut latency for third-party resources that load
          * after first paint: YouTube thumbnails (video embeds), Cloudflare
          * Turnstile (contact form + comments), GitHub OAuth API (admin login). */}
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <body className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Script
          id="kopf-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
