import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import path from "node:path";

const hasCloudinary =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
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

async function uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
  const isImage = file.mimetype.toLowerCase().startsWith("image/");

  const response = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: isImage ? "image" : "auto",
    use_filename: true,
    unique_filename: true,
    ...(isImage
      ? {
          transformation: [
            {
              width: 1920,
              crop: "limit",
              fetch_format: "auto",
              quality: "auto:good"
            }
          ]
        }
      : {})
  });

  await fs.unlink(file.path).catch(() => undefined);
  return response.secure_url;
}

function localUploadUrl(file: Express.Multer.File) {
  return `/uploads/${path.basename(file.path)}`;
}

export async function uploadMediaFile(file: Express.Multer.File | undefined, folder: string): Promise<string | undefined> {
  if (!file) {
    return undefined;
  }

  if (hasCloudinary) {
    return uploadToCloudinary(file, folder);
  }

  return localUploadUrl(file);
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
