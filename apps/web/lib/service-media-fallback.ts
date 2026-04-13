import { isValidImageUrl } from "@/lib/media";

const SERVICE_DEFAULT_IMAGES = [
  "/images/services/default-01.svg",
  "/images/services/default-02.svg",
  "/images/services/default-03.svg",
  "/images/services/default-04.svg",
  "/images/services/default-05.svg"
] as const;

const SERVICE_FALLBACK_PREFIX = "/images/services/default-";

function isServiceFallbackImage(value: string): boolean {
  return value.trim().startsWith(SERVICE_FALLBACK_PREFIX);
}

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getServiceFallbackGallery(seed: string, count = 4): string[] {
  const safeCount = Math.min(5, Math.max(3, count));
  const start = hashSeed(seed || "service") % SERVICE_DEFAULT_IMAGES.length;

  return Array.from({ length: safeCount }, (_, offset) => {
    const imageIndex = (start + offset) % SERVICE_DEFAULT_IMAGES.length;
    return SERVICE_DEFAULT_IMAGES[imageIndex];
  });
}

export function resolveServiceMedia<T extends { slug?: string | null; titleAr?: string | null; coverImage?: string | null; imageUrl?: string | null; gallery?: string[] | null }>(
  service: T,
  fallbackCount = 4
): T & { coverImage: string; gallery: string[] } {
  const seed = `${service.slug || ""}|${service.titleAr || ""}`;

  const sanitizedGallery = Array.from(
    new Set(
      (Array.isArray(service.gallery) ? service.gallery : [])
        .map((item) => String(item || "").trim())
        .filter((item) => isValidImageUrl(item, { allowPlaceholders: false }) && !isServiceFallbackImage(item))
    )
  );

  const fallbackGallery = getServiceFallbackGallery(seed, fallbackCount);
  const gallery = sanitizedGallery.length > 0 ? sanitizedGallery : fallbackGallery;

  const coverCandidate =
    (typeof service.coverImage === "string" ? service.coverImage.trim() : "") ||
    (typeof service.imageUrl === "string" ? service.imageUrl.trim() : "");

  const coverImage =
    isValidImageUrl(coverCandidate, { allowPlaceholders: false }) && !isServiceFallbackImage(coverCandidate)
      ? coverCandidate
      : gallery[0];

  return {
    ...service,
    coverImage,
    gallery
  };
}
