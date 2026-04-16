import { isValidImageUrl, normalizeImageUrl, toCloudinaryDeliveryUrl } from "./media.js";

function normalizeServiceImageUrl(value: string): string {
  const normalized = normalizeImageUrl(value);
  const canonical = toCloudinaryDeliveryUrl(normalized);

  return canonical || normalized;
}

export function isValidServiceImageUrl(value: unknown): value is string {
  return isValidImageUrl(value);
}

export function isRealServiceImageUrl(value: unknown): value is string {
  return isValidServiceImageUrl(value);
}

export function resolveServiceMedia<T extends { slug?: string | null; titleAr?: string | null; coverImage?: string | null; imageUrl?: string | null; gallery?: string[] | null }>(
  service: T
): T & { coverImage: string | null; gallery: string[] } {
  const sanitizedGallery = Array.from(
    new Set(
      (Array.isArray(service.gallery) ? service.gallery : [])
        .map((item) => normalizeServiceImageUrl(String(item || "")))
        .filter(isRealServiceImageUrl)
    )
  );

  const gallery = sanitizedGallery;

  const coverCandidate =
    (typeof service.coverImage === "string" ? normalizeServiceImageUrl(service.coverImage) : "") ||
    (typeof service.imageUrl === "string" ? normalizeServiceImageUrl(service.imageUrl) : "");

  const coverImage = isValidServiceImageUrl(coverCandidate) ? coverCandidate : null;

  return {
    ...service,
    coverImage,
    gallery
  };
}

export function collectInvalidImageUrls(values: string[]): string[] {
  return values.map((item) => String(item || "").trim()).filter((item) => item.length > 0 && !isValidServiceImageUrl(item));
}
