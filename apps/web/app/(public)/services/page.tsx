import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import { getServices } from "@/lib/api";
import { SEO_KEYWORDS } from "@/lib/seo";
import { resolveServiceMedia } from "@/lib/service-media-fallback";

export const revalidate = 300;

function hasValidCloudinaryImage(imageSrc: string | null | undefined): imageSrc is string {
  return typeof imageSrc === "string" && imageSrc.startsWith("https://res.cloudinary.com/");
}

export const metadata: Metadata = {
  title: "الخدمات",
  description: "اكتشف خدماتنا في الدهانات والعزل والأعمال الحديدية والجبس والديكور بالدمام.",
  keywords: SEO_KEYWORDS.services,
  alternates: { canonical: "/services" }
};

export default async function ServicesPage() {
  const services = await getServices();
  const validServices = services.filter((service) => {
    const media = resolveServiceMedia(service);

    if (hasValidCloudinaryImage(media.coverImage)) {
      return true;
    }

    console.warn("Invalid service image for slug:", service.slug);
    return false;
  });

  return (
    <section className="section">
      <div className="container">
        <h1>خدمات المقاولات</h1>
        <div className="grid grid-services">
          {validServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
