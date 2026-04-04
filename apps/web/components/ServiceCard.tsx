import Link from "next/link";
import type { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  const cover = service.coverImage || service.imageUrl || "/images/placeholder-before.svg";

  return (
    <article className="card service-card">
      <div className="service-card-media">
        <img src={cover} alt={service.titleAr} loading="lazy" decoding="async" />
      </div>
      <h3>{service.titleAr}</h3>
      <p>{service.shortDescAr}</p>
      <Link href={`/services/${service.slug}`} className="btn btn-outline">
        تفاصيل الخدمة
      </Link>
    </article>
  );
}
