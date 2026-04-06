import type { Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../services/prisma.js";
import { parseBoolean, parseGallery, uploadMediaFile, uploadMediaFiles } from "../services/media.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isOptionalValidUrl(value: unknown) {
  if (value === undefined || value === null) {
    return true;
  }

  const raw = String(value).trim();

  if (!raw) {
    return true;
  }

  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeDescriptions(values: string[], targetLength: number) {
  const normalized = values.map((value) => value.trim()).slice(0, targetLength);

  while (normalized.length < targetLength) {
    normalized.push("");
  }

  return normalized;
}

export const serviceCreateValidation = [
  body("titleAr").isLength({ min: 3 }),
  body("slug")
    .custom((value) => {
      if (value === undefined || value === null || String(value).trim() === "") {
        return true;
      }

      const normalized = toSlug(String(value));
      if (!normalized) {
        return true;
      }

      return slugPattern.test(normalized);
    })
    .withMessage("Invalid slug format"),
  body("shortDescAr").isLength({ min: 10 }),
  body("contentAr").isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("Invalid video URL"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export const serviceUpdateValidation = [
  body("titleAr").optional().isLength({ min: 3 }),
  body("slug")
    .custom((value) => {
      if (value === undefined || value === null || String(value).trim() === "") {
        return true;
      }

      const normalized = toSlug(String(value));
      if (!normalized) {
        return true;
      }

      return slugPattern.test(normalized);
    })
    .withMessage("Invalid slug format"),
  body("shortDescAr").optional().isLength({ min: 10 }),
  body("contentAr").optional().isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("Invalid video URL"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export async function getServices(_req: Request, res: Response) {
  const services = await (prisma.service as any).findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(services);
}

export async function getServicesAdmin(_req: Request, res: Response) {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(services);
}

export async function getServiceBySlug(req: Request, res: Response) {
  const service = await prisma.service.findUnique({ where: { slug: req.params.slug } });
  const serviceData = service as any;

  if (!serviceData) {
    return res.status(404).json({ message: "Service not found" });
  }

  if (serviceData.isPublished === false) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.json(serviceData);
}

export async function createService(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const galleryFiles = files?.gallery || [];
  const videoFile = files?.video?.[0];

  const coverImage = await uploadMediaFile(coverFile, "moqawalat/services");
  const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/services");
  const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/services");

  const gallery = [...parseGallery(req.body.gallery), ...uploadedGallery];
  const existingDescriptions = normalizeDescriptions(parseGallery(req.body.galleryDescriptions), parseGallery(req.body.gallery).length);
  const newDescriptions = normalizeDescriptions(parseGallery(req.body.newGalleryDescriptions), uploadedGallery.length);
  const galleryDescriptions = [...existingDescriptions, ...newDescriptions];
  const normalizedInputSlug = toSlug(String(req.body.slug || ""));
  const rawSlug = normalizedInputSlug || toSlug(String(req.body.titleAr || ""));
  const slug = rawSlug || `service-${Date.now()}`;
  const isPublished = parseBoolean(req.body.isPublished);

  const createData: any = {
      titleAr: req.body.titleAr,
      slug,
      shortDescAr: req.body.shortDescAr,
      contentAr: req.body.contentAr,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      imageUrl: req.body.imageUrl || null,
      coverImage: coverImage || req.body.coverImage || null,
      gallery,
      galleryDescriptions,
      videoUrl: uploadedVideo || req.body.videoUrl || null,
      isPublished: typeof isPublished === "boolean" ? isPublished : true
    };

  const service = await prisma.service.create({ data: createData });
  return res.status(201).json(service);
}

export async function updateService(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const galleryFiles = files?.gallery || [];
  const videoFile = files?.video?.[0];

  const coverImage = await uploadMediaFile(coverFile, "moqawalat/services");
  const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/services");
  const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/services");

  const existingGallery = parseGallery(req.body.gallery);
  const gallery = [...existingGallery, ...uploadedGallery];
  const existingDescriptions = normalizeDescriptions(parseGallery(req.body.galleryDescriptions), existingGallery.length);
  const newDescriptions = normalizeDescriptions(parseGallery(req.body.newGalleryDescriptions), uploadedGallery.length);
  const galleryDescriptions = [...existingDescriptions, ...newDescriptions];
  const isPublished = parseBoolean(req.body.isPublished);
  const removeCoverImage = parseBoolean(req.body.removeCoverImage) === true;
  const removeVideo = parseBoolean(req.body.removeVideoUrl) === true;
  const hasGalleryField = typeof req.body.gallery !== "undefined";
  const hasGalleryDescriptionsField = typeof req.body.galleryDescriptions !== "undefined";
  const imageUrl = typeof req.body.imageUrl === "string" && req.body.imageUrl.length > 0 ? req.body.imageUrl : undefined;
  const coverValue = removeCoverImage
    ? null
    : coverImage || (typeof req.body.coverImage === "string" ? req.body.coverImage.trim() || null : undefined);
  const videoValue = removeVideo
    ? null
    : uploadedVideo || (typeof req.body.videoUrl === "string" ? req.body.videoUrl.trim() || null : undefined);

    const normalizedUpdateSlug = toSlug(String(req.body.slug || ""));

    const updateData: any = {
      titleAr: req.body.titleAr,
      slug: normalizedUpdateSlug || undefined,
      shortDescAr: req.body.shortDescAr,
      contentAr: req.body.contentAr,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      imageUrl,
      coverImage: coverValue,
      gallery: hasGalleryField ? gallery : undefined,
      galleryDescriptions: hasGalleryDescriptionsField ? galleryDescriptions : undefined,
      videoUrl: videoValue,
      isPublished: typeof isPublished === "boolean" ? isPublished : undefined
    };

  const service = await prisma.service.update({
    where: { id: req.params.id },
    data: updateData
  });
  return res.json(service);
}

export async function deleteService(req: Request, res: Response) {
  await prisma.service.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
