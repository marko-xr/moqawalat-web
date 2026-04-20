import type { Metadata } from "next";
import { getServiceBySlug, getServices } from "@/lib/api";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/site-url";
import { pickFirstImage, sanitizeImageList } from "@/lib/media";
import { resolveServiceMedia } from "@/lib/service-media-fallback";
import ServiceImageDebugPanel from "@/components/dev/ServiceImageDebugPanel";
import ClientImage from "@/components/ClientImage";

export const revalidate = 300;

function hasValidCloudinaryImage(imageSrc: string | null | undefined): imageSrc is string {
  return typeof imageSrc === "string" && imageSrc.startsWith("https://res.cloudinary.com/");
}

export async function generateStaticParams() {
  const services = await getServices();

  return services
    .filter((service) => {
      const media = resolveServiceMedia(service);
      const cover =
        pickFirstImage([media.coverImage, media.imageUrl], { allowPlaceholders: false }) || media.gallery[0] || null;

      if (hasValidCloudinaryImage(cover)) {
        return true;
      }

      console.warn("Invalid service image for slug:", service.slug);
      return false;
    })
    .map((service) => ({ slug: service.slug }));
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

  const media = resolveServiceMedia(service);
  const gallery: string[] = sanitizeImageList(media.gallery, { allowPlaceholders: false });
  const cover = pickFirstImage([media.coverImage, media.imageUrl], { allowPlaceholders: false }) || media.gallery[0] || null;
  const galleryDescriptions: string[] = Array.isArray(service.galleryDescriptions) ? service.galleryDescriptions : [];
  const videoUrl = service.videoUrl || "";

  if (!hasValidCloudinaryImage(cover)) {
    console.warn("Invalid service image for slug:", service.slug);
    return notFound();
  }

  if (gallery.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("FRONTEND SERVICE GALLERY EMPTY", service.slug);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[service-page]", service.slug, {
      coverImage: cover,
      galleryCount: gallery.length,
      rawGalleryType: Array.isArray(service.gallery) ? "array" : typeof service.gallery
    });
  }

  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
  const baseUrl = getSiteUrl();

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
            <ClientImage
              src={cover}
              alt={service.titleAr}
              width={1280}
              height={853}
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              priority
              errorContext={`service-hero:${service.slug}`}
            />
          </div>
        </div>

        <div className="card service-body">
          <p>{service.contentAr}</p>
        </div>

        {gallery.length > 0 ? (
          <section className="service-gallery-wrap" aria-label="معرض صور الخدمة">
            <h2 className="service-gallery-heading">معرض صور الخدمة</h2>
            <div className="service-gallery">
              {gallery.map((src, index) => {
                const caption = galleryDescriptions[index]?.trim() ?? "";

                return (
                  <figure className="service-gallery-item" key={`${src}-${index}`}>
                    <div className="service-gallery-media">
                      <ClientImage
                        src={src}
                        alt={caption || `${service.titleAr} - صورة خدمة`}
                        width={1000}
                        height={750}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={84}
                        loading="lazy"
                        errorContext={`service-gallery:${service.slug}`}
                      />
                    </div>
                    {caption ? (
                      <figcaption className="service-gallery-caption">
                        <p className="service-gallery-caption-text">{caption}</p>
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          </section>
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

        {process.env.NODE_ENV !== "production" ? (
          <ServiceImageDebugPanel
            pageSlug={service.slug}
            coverImage={media.coverImage || media.imageUrl || null}
            gallery={media.gallery}
            sourceLabel="services/[slug]"
          />
        ) : null}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </section>
  );
}
