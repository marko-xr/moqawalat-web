"use client";

import Link from "next/link";
import type { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  const image =
    service.coverImage ||
    service.imageUrl ||
    (Array.isArray(service.gallery) ? service.gallery[0] : null) ||
    null;

  return (
    <article className="card service-card">
      {image && (
        <div className="service-card-media">
          <img
            src={image}
            alt={service.titleAr}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <h3>{service.titleAr}</h3>
      <p>{service.shortDescAr}</p>
      <Link href={`/services/${service.slug}`} className="btn btn-outline" prefetch={false}>
        تفاصيل الخدمة
      </Link>
    </article>
  );
}
