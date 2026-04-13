const cloudinarySecureUrlPattern = /^https:\/\/res\.cloudinary\.com\/.+/i;
const imageExtensionPattern = /\.(jpg|jpeg|png|webp|avif|gif)$/i;

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

  const shouldSplitByComma =
    trimmed.includes(",") &&
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("/uploads/") &&
    !trimmed.startsWith("uploads/");

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

function extractCloudinaryUrl(file: Express.Multer.File): string {
  const candidate =
    (file as Express.Multer.File & { secure_url?: string; url?: string }).secure_url ||
    (file as Express.Multer.File & { secure_url?: string; url?: string }).url ||
    file.path;

  if (typeof candidate !== "string") {
    throw new Error("Upload failed: Cloudinary URL was not returned.");
  }

  const normalized = candidate.trim();

  if (!cloudinarySecureUrlPattern.test(normalized)) {
    throw new Error("Upload failed: invalid Cloudinary secure URL.");
  }

  return normalized;
}

async function optimizeLocalUpload(file: Express.Multer.File): Promise<string> {
  const absolutePath = String(file.path || "").trim();
  const filename = String(file.filename || "").trim();

  if (!absolutePath && !filename) {
    throw new Error("Upload failed: local file path is missing.");
  }

  const sourcePath = absolutePath;
  const sourceFileName = filename || sourcePath.split(/[\\/]/).pop() || "";
  const sourceExtension = sourceFileName.split(".").pop()?.toLowerCase() || "";

  if (!sourcePath || sourcePath.startsWith("http://") || sourcePath.startsWith("https://")) {
    return `/uploads/${sourceFileName}`;
  }

  if (sourceExtension === "webp") {
    return `/uploads/${sourceFileName}`;
  }

  if (!imageExtensionPattern.test(sourceFileName)) {
    return `/uploads/${sourceFileName}`;
  }

  const path = await import("node:path");
  const fs = await import("node:fs/promises");
  const { default: sharp } = await import("sharp");

  const parsed = path.parse(sourcePath);
  const outputName = `${parsed.name}.webp`;
  const outputPath = path.join(parsed.dir, outputName);

  await sharp(sourcePath)
    .rotate()
    .resize({ width: 2048, withoutEnlargement: true })
    .webp({ quality: 86, effort: 5 })
    .toFile(outputPath);

  await fs.unlink(sourcePath).catch(() => undefined);

  return `/uploads/${outputName}`;
}

async function extractUploadedUrl(file: Express.Multer.File): Promise<string> {
  const cloudinaryCandidate =
    (file as Express.Multer.File & { secure_url?: string; url?: string }).secure_url ||
    (file as Express.Multer.File & { secure_url?: string; url?: string }).url;

  if (typeof cloudinaryCandidate === "string" && cloudinaryCandidate.trim()) {
    const normalized = cloudinaryCandidate.trim();

    if (cloudinarySecureUrlPattern.test(normalized)) {
      return normalized;
    }

    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      return normalized;
    }
  }

  return optimizeLocalUpload(file);
}

export async function uploadMediaFile(file: Express.Multer.File | undefined, _folder: string): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  return extractUploadedUrl(file);
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
