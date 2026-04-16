import { v2 as cloudinary } from "cloudinary";

type CloudinaryEnv = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

let configured = false;

function readCloudinaryEnv(): CloudinaryEnv {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
    apiKey: process.env.CLOUDINARY_API_KEY?.trim() || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || ""
  };
}

export function getMissingCloudinaryEnvVars() {
  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();

  return [
    ["CLOUDINARY_CLOUD_NAME", cloudName],
    ["CLOUDINARY_API_KEY", apiKey],
    ["CLOUDINARY_API_SECRET", apiSecret]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

function applyCloudinaryConfigIfAvailable() {
  const { cloudName, apiKey, apiSecret } = readCloudinaryEnv();

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    configured = true;
  }

  return true;
}

export function getCloudinaryCloudName() {
  return readCloudinaryEnv().cloudName;
}

export function isCloudinaryConfigured() {
  return applyCloudinaryConfigIfAvailable();
}

export function ensureCloudinaryConfigured() {
  if (applyCloudinaryConfigIfAvailable()) {
    return;
  }

  const missing = getMissingCloudinaryEnvVars();
  throw new Error(`Cloudinary is not configured. Missing env vars: ${missing.join(", ")}`);
}

export { cloudinary };