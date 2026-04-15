import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || "";

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

export const missingCloudinaryEnvVars = [
  ["CLOUDINARY_CLOUD_NAME", cloudName],
  ["CLOUDINARY_API_KEY", apiKey],
  ["CLOUDINARY_API_SECRET", apiSecret]
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

export function ensureCloudinaryConfigured() {
  if (isCloudinaryConfigured) {
    return;
  }

  const missing = missingCloudinaryEnvVars.join(", ");
  throw new Error(`Cloudinary is not configured. Missing required environment variables: ${missing}`);
}

export { cloudinary };