import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const cmsVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const leadVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/3gpp"
];

function isImageMimeType(mimeType: string) {
  return mimeType.toLowerCase().startsWith("image/");
}

function createUploader(options: { maxSizeMb: number; allowImages?: boolean; allowedTypes?: string[] }) {
  const { maxSizeMb, allowImages = false, allowedTypes = [] } = options;

  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if ((allowImages && isImageMimeType(file.mimetype)) || allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Unsupported file type"));
      }
    }
  });
}

export const upload = createUploader({ maxSizeMb: 25, allowImages: true, allowedTypes: leadVideoTypes });
export const cmsUpload = createUploader({ maxSizeMb: 25, allowImages: true, allowedTypes: cmsVideoTypes });
