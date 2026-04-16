const CLOUDINARY_SECURE_PREFIX = "https://res.cloudinary.com/";
const RELATIVE_IMAGE_PREFIXES = ["/uploads/", "/images/", "uploads/", "images/", "./", "../"];

export function isCloudinarySecureUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return normalized.startsWith(CLOUDINARY_SECURE_PREFIX);
}

export function normalizeImageUrl(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function isValidImageUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = normalizeImageUrl(value);
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalized)) {
    return false;
  }

  return RELATIVE_IMAGE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function flattenStringLike(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenStringLike(item));
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => flattenStringLike(item));
    }

    if (typeof parsed === "string") {
      const normalized = parsed.trim();
      return normalized ? [normalized] : [];
    }
  } catch {
    // Not JSON, continue with plain-text parsing.
  }

  const shouldSplitByComma = trimmed.includes(",") && !trimmed.startsWith("http://") && !trimmed.startsWith("https://");

  if (shouldSplitByComma) {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

function asStringArray(value: unknown): string[] {
  return flattenStringLike(value);
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }

  return undefined;
}

function extractUploadedMediaUrl(file: Express.Multer.File): string {
  const candidate = (file as Express.Multer.File & { secure_url?: string }).secure_url || file.path;

  if (typeof candidate !== "string") {
    throw new Error("INVALID_UPLOAD_URL");
  }

  const normalized = normalizeImageUrl(candidate);

  if (!isValidImageUrl(normalized)) {
    throw new Error("INVALID_UPLOAD_URL");
  }

  return normalized;
}

export async function uploadMediaFile(file: Express.Multer.File | undefined, _folder: string): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  return extractUploadedMediaUrl(file);
}

export async function uploadMediaFiles(files: Express.Multer.File[] | undefined, folder: string): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  const uploads = files.map((file) => uploadMediaFile(file, folder));
  const results = await Promise.all(uploads);
  return results.filter((value): value is string => Boolean(value));
}

export function parseGallery(value: unknown): string[] {
  return asStringArray(value);
}

export function parseBoolean(value: unknown): boolean | undefined {
  return toBoolean(value);
}
