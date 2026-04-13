import Image from "next/image";
import { sanitizeImageList } from "@/lib/media";

type ServiceGalleryProps = {
  title?: string;
  images?: string[];
  altPrefix?: string;
};

export default function ServiceGallery({
  title = "معرض صور الخدمة",
  images = [],
  altPrefix = "صورة خدمة"
}: ServiceGalleryProps) {
  const galleryImages = sanitizeImageList(images, { allowPlaceholders: false });

  if (galleryImages.length === 0) {
    return null;
  }

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
          </figure>
        ))}
      </div>
    </section>
  );
}
