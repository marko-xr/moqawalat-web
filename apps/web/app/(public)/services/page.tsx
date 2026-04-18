import type { Metadata } from "next";
import PublicServicesClient from "@/components/services/PublicServicesClient";
import { SEO_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الخدمات",
  description: "اكتشف خدماتنا في الدهانات والعزل والأعمال الحديدية والجبس والديكور بالدمام.",
  keywords: SEO_KEYWORDS.services,
  alternates: { canonical: "/services" }
};

export default function ServicesPage() {
  return (
    <section className="section">
      <div className="container">
        <h1>خدمات المقاولات</h1>
        <PublicServicesClient />
      </div>
    </section>
  );
}
