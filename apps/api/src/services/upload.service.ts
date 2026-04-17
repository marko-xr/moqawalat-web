import { uploadMediaFile, uploadMediaFiles } from "./media.js";

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";

function assertCloudinaryUrl(url: string | undefined) {
  if (!url) {
    return;
  }

  const cloudinaryMode = Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim());
  if (cloudinaryMode && !url.startsWith(CLOUDINARY_PREFIX)) {
    throw new Error("INVALID_UPLOAD_URL");
  }
}

export async function uploadServiceCoverImage(file: Express.Multer.File | undefined) {
  const url = await uploadMediaFile(file, "moqawalat/services");
  assertCloudinaryUrl(url);
  return url;
}

export async function uploadServiceVideo(file: Express.Multer.File | undefined) {
  return uploadMediaFile(file, "moqawalat/services");
}

export async function uploadServiceGallery(files: Express.Multer.File[] | undefined) {
  const urls = await uploadMediaFiles(files, "moqawalat/services");
  urls.forEach((url) => assertCloudinaryUrl(url));
  return urls;
}
