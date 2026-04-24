import type { Metadata, Viewport } from "next";
import { Anton, Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

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
      className={`${anton.variable} ${inter.variable} ${jetbrains.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
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
