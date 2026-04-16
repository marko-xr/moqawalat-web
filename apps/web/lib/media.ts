const RELATIVE_IMAGE_PREFIXES = ["/uploads/", "/images/", "uploads/", "images/", "./", "../"];
const CLOUDINARY_SECURE_PREFIX = "https://res.cloudinary.com/";

type SanitizeOptions = {
  allowPlaceholders?: boolean;
};

type CloudinaryResolveOptions = {
  cloudName?: string;
  allowPublicId?: boolean;
};

function extractUploadsPublicId(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("/uploads/")) {
    return normalized.slice("/uploads/".length);
  }

  if (normalized.startsWith("uploads/")) {
    return normalized.slice("uploads/".length);
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized);
      return extractUploadsPublicId(parsed.pathname || "");
    } catch {
      return "";
    }
  }

  return "";
}

function normalizePublicIdCandidate(value: string) {
  const normalized = value.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("images/") || normalized.startsWith("./") || normalized.startsWith("../")) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalized)) {
    return "";
  }

  return normalized;
}

export function toCloudinaryDeliveryUrl(value: unknown, options: CloudinaryResolveOptions = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith(CLOUDINARY_SECURE_PREFIX)) {
    return normalized;
  }

  const cloudName = (options.cloudName || "").trim();
  if (!cloudName) {
    return "";
  }

  const baseUrl = `${CLOUDINARY_SECURE_PREFIX}${cloudName}/image/upload`;
  const uploadsPublicId = normalizePublicIdCandidate(extractUploadsPublicId(normalized));

  if (uploadsPublicId) {
    return `${baseUrl}/${uploadsPublicId}`;
  }

  const directPublicId = options.allowPublicId ? normalizePublicIdCandidate(normalized) : "";
  if (directPublicId) {
    return `${baseUrl}/${directPublicId}`;
  }

  return "";
}

export function isValidImageUrl(value: unknown, options: SanitizeOptions = {}): value is string {
  void options;

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return false;
  }

  return RELATIVE_IMAGE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

function flattenImageTokens(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenImageTokens(item));
  }

  const raw = String(value).trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.flatMap((item) => flattenImageTokens(item));
    }

    if (typeof parsed === "string") {
      const normalized = parsed.trim();
      return normalized ? [normalized] : [];
    }
  } catch {
    // Not JSON, continue as plain token.
  }

  return [raw];
}

export function sanitizeImageList(value: unknown, options: SanitizeOptions = {}): string[] {
  return Array.from(
    new Set(
      flattenImageTokens(value).filter((item) => isValidImageUrl(item, options))
    )
  );
}

export function pickFirstImage(value: unknown, options: SanitizeOptions = {}): string | null {
  const [first] = sanitizeImageList(value, options);
  return first || null;
}
