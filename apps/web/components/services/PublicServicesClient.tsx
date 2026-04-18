"use client";

import { useEffect, useMemo, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import { isValidImageUrl } from "@/lib/media";
import { resolveServiceMedia } from "@/lib/service-media-fallback";
import type { Service } from "@/lib/types";

const SERVICES_API_URL = "https://moqawalatapi-production.up.railway.app/api/services";

function hasValidImage(imageSrc: string | null | undefined): imageSrc is string {
  return typeof imageSrc === "string" && isValidImageUrl(imageSrc, { allowPlaceholders: false });
}

export default function PublicServicesClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const res = await fetch(SERVICES_API_URL, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const payload = (await res.json()) as unknown;
        const list = Array.isArray(payload)
          ? (payload as Service[])
          : Array.isArray((payload as { data?: unknown })?.data)
            ? ((payload as { data: Service[] }).data || [])
            : [];

        if (!cancelled) {
          setServices(list);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("تعذر تحميل الخدمات");
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  const validServices = useMemo(() => {
    return services.filter((service) => {
      const media = resolveServiceMedia(service);
      const image = media.coverImage || media.imageUrl || media.gallery?.[0] || "";

      return hasValidImage(image);
    });
  }, [services]);

  if (loading) {
    return <div className="card admin-empty">جاري تحميل الخدمات...</div>;
  }

  if (error) {
    return <div className="card admin-error-box">{error}</div>;
  }

  if (validServices.length === 0) {
    return <div className="card admin-empty">لا توجد خدمات متاحة حاليا.</div>;
  }

  return (
    <div className="grid grid-services">
      {validServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
