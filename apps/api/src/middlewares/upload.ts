import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary, ensureCloudinaryConfigured } from "../config/cloudinary.js";

const routeFolderMap = new Map<string, string>([
  ["/api/services", "moqawalat/services"],
  ["/api/service-seo", "moqawalat/seo-services"],
  ["/api/projects", "moqawalat/projects"],
  ["/api/blog", "moqawalat/blog"],
  ["/api/leads", "moqawalat/leads"]
]);

function resolveUploadFolder(baseUrl: string): string {
  const normalizedBaseUrl = baseUrl.toLowerCase();

  for (const [routePrefix, folder] of routeFolderMap.entries()) {
    if (normalizedBaseUrl.startsWith(routePrefix)) {
      return folder;
    }
  }

  return "moqawalat/misc";
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => {
    ensureCloudinaryConfigured();

    return {
      folder: resolveUploadFolder(req.baseUrl || req.originalUrl || ""),
      resource_type: "image",
      transformation: [{ width: 2048, crop: "limit", fetch_format: "webp", quality: "auto:best" }]
    };
  }
});

function isImageMimeType(mimeType: string) {
  return mimeType.toLowerCase().startsWith("image/");
}

function createUploader(options: { maxSizeMb: number }) {
  const { maxSizeMb } = options;

  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (isImageMimeType(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Unsupported file type"));
      }
    }
  });
}

function getUploadedFiles(req: Request): Express.Multer.File[] {
  const single = req.file ? [req.file] : [];

  if (!req.files) {
    return single;
  }

  if (Array.isArray(req.files)) {
    return [...single, ...req.files];
  }

  const grouped = Object.values(req.files).flat();
  return [...single, ...grouped];
}

export function ensureNonEmptyUploads(req: Request, res: Response, next: NextFunction) {
  const files = getUploadedFiles(req);
  const hasEmptyFile = files.some((file) => typeof file.size !== "number" || file.size <= 0);

  if (hasEmptyFile) {
    return res.status(400).json({
      message: "Empty upload is not allowed.",
      code: "EMPTY_UPLOAD"
    });
  }

  return next();
}

export const upload = createUploader({ maxSizeMb: 25 });
export const cmsUpload = createUploader({ maxSizeMb: 25 });
