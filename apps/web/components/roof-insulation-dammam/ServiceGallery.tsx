import Image from "next/image";

type ServiceGalleryProps = {
  title?: string;
  images?: string[];
  fallbackImage?: string;
  altPrefix?: string;
};

function sanitizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  );
}

export default function ServiceGallery({
  title = "معرض صور الخدمة",
  images = [],
  fallbackImage = "/images/placeholder-after.svg",
  altPrefix = "صورة خدمة"
}: ServiceGalleryProps) {
  const normalizedImages = sanitizeImages(images);
  const galleryImages = normalizedImages.length > 0 ? normalizedImages : [fallbackImage];

  return (
    <section className="service-gallery-wrap" aria-label={title}>
      <h2 className="service-gallery-heading">{title}</h2>
      <div className="service-gallery">
        {galleryImages.map((src, index) => (
          <figure className="service-gallery-item" key={`${src}-${index}`}>
            <div className="service-gallery-media">
              <Image
                src={src}
                alt={`${altPrefix} - صورة ${index + 1}`}
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <figcaption className="service-gallery-caption">
              <span className="service-gallery-caption-index">الصورة {index + 1}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
