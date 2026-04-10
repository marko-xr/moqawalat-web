import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  const cover = service.coverImage || service.imageUrl || "/images/placeholder-before.svg";

  return (
    <article className="card service-card">
      <div className="service-card-media">
        <Image
          src={cover}
          alt={service.titleAr}
          width={800}
          height={500}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
