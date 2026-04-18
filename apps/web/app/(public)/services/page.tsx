import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import { getServices } from "@/lib/api";
import { isValidImageUrl } from "@/lib/media";
import { SEO_KEYWORDS } from "@/lib/seo";
import { resolveServiceMedia } from "@/lib/service-media-fallback";

export const dynamic = "force-dynamic";

function hasValidImage(imageSrc: string | null | undefined): imageSrc is string {
  return typeof imageSrc === "string" && isValidImageUrl(imageSrc, { allowPlaceholders: false });
}

export const metadata: Metadata = {
  title: "الخدمات",
  description: "اكتشف خدماتنا في الدهانات والعزل والأعمال الحديدية والجبس والديكور بالدمام.",
  keywords: SEO_KEYWORDS.services,
  alternates: { canonical: "/services" }
};

export default async function ServicesPage() {
  const services = await getServices();

  if (process.env.NODE_ENV !== "production") {
    services.forEach((service) => {
      const media = resolveServiceMedia(service);
      console.log("FRONTEND RECEIVED IMAGES", `service:${service.slug}`, {
        coverImage: media.coverImage || media.gallery?.[0] || null,
        galleryCount: Array.isArray(media.gallery) ? media.gallery.length : 0
      });
    });
  }

  const validServices = services.filter((service) => {
    const media = resolveServiceMedia(service);

    if (hasValidImage(media.coverImage)) {
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
