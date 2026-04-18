"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import type { Service } from "@/lib/types";

const SERVICES_API_URL = "https://moqawalatapi-production.up.railway.app/api/services";
const API_ORIGIN = "https://moqawalatapi-production.up.railway.app";

function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/")) return `${API_ORIGIN}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_ORIGIN}/${trimmed}`;
  return trimmed;
}

function normalizeService(service: Service): Service {
  return {
    ...service,
    coverImage: normalizeImageUrl(service.coverImage) ?? undefined,
    imageUrl: normalizeImageUrl(service.imageUrl) ?? undefined,
    gallery: Array.isArray(service.gallery)
      ? service.gallery.map((u) => normalizeImageUrl(u)).filter((u): u is string => u !== null)
      : []
  };
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
          setServices(list.map(normalizeService));
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

  if (loading) {
    return <div className="card admin-empty">جاري تحميل الخدمات...</div>;
  }

  if (error) {
    return <div className="card admin-error-box">{error}</div>;
  }

  if (services.length === 0) {
    return <div className="card admin-empty">لا توجد خدمات متاحة حاليا.</div>;
  }

  return (
    <div className="grid grid-services">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
