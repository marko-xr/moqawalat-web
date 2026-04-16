import Link from "next/link";
import type { Service } from "@/lib/types";
import { resolveServiceMedia } from "@/lib/service-media-fallback";
import ClientImage from "@/components/ClientImage";

export default function ServiceCard({ service }: { service: Service }) {
  const media = resolveServiceMedia(service);
  const cover = media.coverImage;

  if (!cover) {
    throw new Error(`MISSING_SERVICE_COVER_IMAGE:${service.slug}`);
  }

  return (
    <article className="card service-card">
      <div className="service-card-media">
        <ClientImage
          src={cover}
          alt={service.titleAr}
          width={800}
          height={500}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={82}
          loading="lazy"
          errorContext={`service-card:${service.slug}`}
        />
      </div>
      <h3>{service.titleAr}</h3>
      <p>{service.shortDescAr}</p>
      <Link href={`/services/${service.slug}`} className="btn btn-outline" prefetch={false}>
        تفاصيل الخدمة
      </Link>
    </article>
  );
}
