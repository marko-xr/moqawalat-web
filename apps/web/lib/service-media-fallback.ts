import { isValidImageUrl } from "@/lib/media";

export function resolveServiceMedia<T extends { slug?: string | null; titleAr?: string | null; coverImage?: string | null; imageUrl?: string | null; gallery?: string[] | null }>(
  service: T
): T & { coverImage: string | null; gallery: string[] } {

  const sanitizedGallery = Array.from(
    new Set(
      (Array.isArray(service.gallery) ? service.gallery : [])
        .map((item) => String(item || "").trim())
        .filter((item) => isValidImageUrl(item, { allowPlaceholders: false }))
    )
  );

  const gallery = sanitizedGallery;

  const coverCandidate =
    (typeof service.coverImage === "string" ? service.coverImage.trim() : "") ||
    (typeof service.imageUrl === "string" ? service.imageUrl.trim() : "");

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
