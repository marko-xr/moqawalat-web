import type { Metadata } from "next";
import { getServiceBySlug, getServices } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "الخدمة غير موجودة",
      description: "الخدمة المطلوبة غير متاحة حاليا"
    };
  }

  return {
    title: service.seoTitleAr || service.titleAr,
    description: service.seoDescriptionAr || service.shortDescAr,
    alternates: { canonical: `/services/${service.slug}` }
  };
}

export default async function ServiceDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const cover = service.coverImage || service.imageUrl || "/images/placeholder-before.svg";
  const gallery: string[] = service.gallery || [];
  const videoUrl = service.videoUrl || "";

  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "مقاولات عامة الدمام",
    areaServed: ["الدمام", "الخبر", "الظهران"],
    telephone: `+${phone}`,
    url: baseUrl
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.titleAr,
    description: service.shortDescAr,
    url: `${baseUrl}/services/${service.slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: "مقاولات عامة الدمام"
    }
  };

  let embedUrl = "";
  let isVideoFile = false;
  if (videoUrl) {
    const lower = videoUrl.toLowerCase();
    isVideoFile = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
    if (!isVideoFile) {
      try {
        const parsed = new URL(videoUrl);
        if (parsed.hostname.includes("youtu.be")) {
          embedUrl = `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
        } else if (parsed.hostname.includes("youtube.com")) {
          embedUrl = `https://www.youtube.com/embed/${parsed.searchParams.get("v") || ""}`;
        }
      } catch {
        embedUrl = "";
      }
    }
  }

  return (
    <section className="section">
      <div className="container service-details">
        <div className="service-hero">
          <div>
            <h1>{service.titleAr}</h1>
            <p className="lead">{service.shortDescAr}</p>
          </div>
          <div className="service-hero-media">
            <Image
              src={cover}
              alt={service.titleAr}
              width={1280}
              height={853}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div className="card service-body">
          <p>{service.contentAr}</p>
        </div>

        {gallery.length ? (
          <div className="service-gallery">
            {gallery.map((src, index) => (
              <div className="service-gallery-item" key={`${src}-${index}`}>
                <Image
                  src={src}
                  alt={`${service.titleAr} ${index + 1}`}
                  width={1000}
                  height={750}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : null}

        {videoUrl ? (
          <div className="card service-video">
            {isVideoFile ? (
              <video controls src={videoUrl} />
            ) : embedUrl ? (
              <iframe
                title="service video"
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a className="btn btn-outline" href={videoUrl} target="_blank" rel="noreferrer">
                مشاهدة الفيديو
              </a>
            )}
          </div>
        ) : null}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </section>
  );
}
