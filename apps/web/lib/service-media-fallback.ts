import { isValidImageUrl } from "@/lib/media";

const CLOUDINARY_DELIVERY_BASE = "https://res.cloudinary.com/";
const CLOUDINARY_CLOUD_NAME_CLIENT =
  (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim() || "dxvhj64r0";

function normalizeClientImageUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("/uploads/")) {
    const publicId = trimmed.slice("/uploads/".length);
    return `${CLOUDINARY_DELIVERY_BASE}${CLOUDINARY_CLOUD_NAME_CLIENT}/image/upload/${publicId}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${CLOUDINARY_DELIVERY_BASE}${CLOUDINARY_CLOUD_NAME_CLIENT}/image/upload/${trimmed}`;
  }

  return trimmed;
}

export function resolveServiceMedia<T extends { slug?: string | null; titleAr?: string | null; coverImage?: string | null; imageUrl?: string | null; gallery?: string[] | null }>(
  service: T
): T & { coverImage: string | null; gallery: string[] } {

  const sanitizedGallery = Array.from(
    new Set(
      (Array.isArray(service.gallery) ? service.gallery : [])
        .map((item) => normalizeClientImageUrl(String(item || "")))
        .filter((item) => isValidImageUrl(item, { allowPlaceholders: false }))
    )
  );

  const gallery = sanitizedGallery;

  const coverCandidate =
    (typeof service.coverImage === "string" ? normalizeClientImageUrl(service.coverImage) : "") ||
    (typeof service.imageUrl === "string" ? normalizeClientImageUrl(service.imageUrl) : "");

  const coverImage =
    isValidImageUrl(coverCandidate, { allowPlaceholders: false })
      ? coverCandidate
      : null;

  return {
    ...service,
    coverImage,
    gallery
  };
}
