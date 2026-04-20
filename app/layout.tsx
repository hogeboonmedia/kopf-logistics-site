import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kopf Logistics Group | People Powered Logistics",
    template: "%s | Kopf Logistics Group",
  },
  description:
    "Kopf Logistics Group — 50+ years of freight brokerage in Elkhart, Indiana. Serving shippers, agents, carriers and drivers across 48 states.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kopflogistics.com",
    siteName: "Kopf Logistics Group",
    title: "Kopf Logistics Group | People Powered Logistics",
    description:
      "Kopf Logistics Group — 50+ years of freight brokerage in Elkhart, Indiana. Serving shippers, agents, carriers and drivers across 48 states.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kopf Logistics Group | People Powered Logistics",
    description:
      "Kopf Logistics Group — 50+ years of freight brokerage in Elkhart, Indiana.",
  },
  metadataBase: new URL("https://kopflogistics.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#1C1917] text-stone-100 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
