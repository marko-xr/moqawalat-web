const CLOUDINARY_SECURE_PREFIX = "https://res.cloudinary.com/";
const LOCAL_IMAGE_PREFIX = "/images/";

type SanitizeOptions = {
  allowPlaceholders?: boolean;
};

export function isValidImageUrl(value: unknown, options: SanitizeOptions = {}): value is string {
  void options;

  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return (
    trimmed.startsWith(CLOUDINARY_SECURE_PREFIX) ||
    trimmed.startsWith(LOCAL_IMAGE_PREFIX)
  );
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
