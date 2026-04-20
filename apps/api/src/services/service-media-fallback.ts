import { isValidImageUrl, normalizeImageUrl } from "./media.js";

const UPLOADS_PREFIX = "/uploads/";
const UPLOADS_PREFIX_NO_SLASH = "uploads/";
const CLOUDINARY_BASE = "https://res.cloudinary.com/";
// Fallback to known cloud name so existing /uploads/... paths are always resolvable.
const CLOUDINARY_CLOUD_NAME =
  (typeof process !== "undefined" && process.env.CLOUDINARY_CLOUD_NAME?.trim()) || "dxvhj64r0";

function uploadsPathToCloudinaryUrl(trimmed: string): string {
  let publicId = "";
  if (trimmed.startsWith(UPLOADS_PREFIX)) {
    publicId = trimmed.slice(UPLOADS_PREFIX.length);
  } else if (trimmed.startsWith(UPLOADS_PREFIX_NO_SLASH)) {
    publicId = trimmed.slice(UPLOADS_PREFIX_NO_SLASH.length);
  }

  if (!publicId || !CLOUDINARY_CLOUD_NAME) {
    return trimmed;
  }

  return `${CLOUDINARY_BASE}${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
}

function normalizeServiceImageUrl(value: string): string {
  const trimmed = normalizeImageUrl(value);
  if (!trimmed) {
    return "";
  }

  // Convert local /uploads/... paths to full Cloudinary delivery URLs.
  if (trimmed.startsWith(UPLOADS_PREFIX) || trimmed.startsWith(UPLOADS_PREFIX_NO_SLASH)) {
    return uploadsPathToCloudinaryUrl(trimmed);
  }

  return trimmed;
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
