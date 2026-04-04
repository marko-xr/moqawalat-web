import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Cairo } from "next/font/google";
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
  description:
    "خدمات مقاولات عامة بالدمام: دهانات، عزل أسطح، أعمال حديد، جبس وديكورات. اطلب عرض سعر الآن عبر الواتساب أو الاتصال المباشر.",
  keywords: [
    "مقاولات عامة الدمام",
    "مقاول دهانات الدمام",
    "عزل اسطح الخبر",
    "مظلات وسواتر الظهران",
    "جبس وديكور المنطقة الشرقية"
  ],
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/images/logo-mark.png",
    apple: "/images/logo-full.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>{children}</body>
      <GoogleAnalytics gaId="G-MNQF5LXNWP" />
    </html>
  );
}
