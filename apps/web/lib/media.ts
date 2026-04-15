const PLACEHOLDER_IMAGES = [
  "/images/placeholder-before.svg",
  "/images/placeholder-after.svg"
] as const;

type SanitizeOptions = {
  allowPlaceholders?: boolean;
};

function isPlaceholderImage(value: string) {
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_IMAGES.some((item) => normalized.includes(item));
}

export function isValidImageUrl(value: unknown, options: SanitizeOptions = {}): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (!options.allowPlaceholders && isPlaceholderImage(trimmed)) {
    return false;
  }

  if (trimmed.startsWith("data:image/")) {
    return true;
  }

  if (
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/_next/") ||
    (trimmed.startsWith("/") && !trimmed.startsWith("/uploads/"))
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
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
