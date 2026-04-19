import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import { getServices } from "@/lib/api";
import { SEO_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الخدمات",
  description: "اكتشف خدماتنا في الدهانات والعزل والأعمال الحديدية والجبس والديكور بالدمام.",
  keywords: SEO_KEYWORDS.services,
  alternates: { canonical: "/services" }
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <section className="section">
      <div className="container">
        <h1>خدمات المقاولات</h1>
        {services.length === 0 ? (
          <p className="admin-empty">لا توجد خدمات متاحة حاليا.</p>
        ) : (
          <div className="grid grid-services">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
