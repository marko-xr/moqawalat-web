import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cairo } from "next/font/google";
import { HOMEPAGE_SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/seo";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "مقاولات عامة الدمام",
    template: "%s | مقاولات عامة الدمام"
  },
  description: HOMEPAGE_SEO_DESCRIPTION,
  keywords: [...SEO_KEYWORDS.global, ...SEO_KEYWORDS.services],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    title: "مقاولات عامة الدمام",
    description: HOMEPAGE_SEO_DESCRIPTION,
    siteName: "مقاولات عامة الدمام"
  },
  icons: {
    icon: "/images/logo-mark.png",
    apple: "/images/logo-full.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>{children}</body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
