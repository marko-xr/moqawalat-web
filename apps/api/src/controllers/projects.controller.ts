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

export const projectCreateValidation = [
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
  body("locationAr").isLength({ min: 2 }),
  body("categoryAr").isLength({ min: 2 }),
  body("descriptionAr").isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("Invalid video URL"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export const projectUpdateValidation = [
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
  body("locationAr").optional().isLength({ min: 2 }),
  body("categoryAr").optional().isLength({ min: 2 }),
  body("descriptionAr").optional().isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("Invalid video URL"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export async function getProjects(_req: Request, res: Response) {
  const projects = await (prisma.project as any).findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json(projects);
}

export async function getProjectsAdmin(_req: Request, res: Response) {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return res.json(projects);
}

export async function getProjectBySlug(req: Request, res: Response) {
  const project = await prisma.project.findUnique({ where: { slug: req.params.slug } });
  const projectData = project as any;

  if (!projectData) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (projectData.isPublished === false) {
    return res.status(404).json({ message: "Project not found" });
  }

  return res.json(projectData);
}

export async function createProject(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const galleryFiles = files?.gallery || [];
  const videoFile = files?.video?.[0];
  const beforeFile = files?.beforeImage?.[0];
  const afterFile = files?.afterImage?.[0];

  const coverImage = await uploadMediaFile(coverFile, "moqawalat/projects");
  const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/projects");
  const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/projects");
  const beforeImage = await uploadMediaFile(beforeFile, "moqawalat/projects");
  const afterImage = await uploadMediaFile(afterFile, "moqawalat/projects");

  const gallery = [...parseGallery(req.body.gallery), ...uploadedGallery];
  const normalizedInputSlug = toSlug(String(req.body.slug || ""));
  const rawSlug = normalizedInputSlug || toSlug(String(req.body.titleAr || ""));
  const slug = rawSlug || `project-${Date.now()}`;
  const isPublished = parseBoolean(req.body.isPublished);

  const createData: any = {
      titleAr: req.body.titleAr,
      slug,
      locationAr: req.body.locationAr,
      categoryAr: req.body.categoryAr,
      descriptionAr: req.body.descriptionAr,
      beforeImage: beforeImage || req.body.beforeImage || null,
      afterImage: afterImage || req.body.afterImage || null,
      coverImage: coverImage || req.body.coverImage || null,
      gallery,
      videoUrl: uploadedVideo || req.body.videoUrl || null,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      isPublished: typeof isPublished === "boolean" ? isPublished : true
    };

  const project = await prisma.project.create({ data: createData });
  return res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const galleryFiles = files?.gallery || [];
  const videoFile = files?.video?.[0];
  const beforeFile = files?.beforeImage?.[0];
  const afterFile = files?.afterImage?.[0];

  const coverImage = await uploadMediaFile(coverFile, "moqawalat/projects");
  const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/projects");
  const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/projects");
  const beforeImage = await uploadMediaFile(beforeFile, "moqawalat/projects");
  const afterImage = await uploadMediaFile(afterFile, "moqawalat/projects");

  const gallery = [...parseGallery(req.body.gallery), ...uploadedGallery];
  const isPublished = parseBoolean(req.body.isPublished);
  const coverValue = coverImage || (typeof req.body.coverImage === "string" && req.body.coverImage.length > 0 ? req.body.coverImage : undefined);
  const beforeValue = beforeImage || (typeof req.body.beforeImage === "string" && req.body.beforeImage.length > 0 ? req.body.beforeImage : undefined);
  const afterValue = afterImage || (typeof req.body.afterImage === "string" && req.body.afterImage.length > 0 ? req.body.afterImage : undefined);
  const videoValue = uploadedVideo || (typeof req.body.videoUrl === "string" && req.body.videoUrl.length > 0 ? req.body.videoUrl : undefined);

    const normalizedUpdateSlug = toSlug(String(req.body.slug || ""));

    const updateData: any = {
      titleAr: req.body.titleAr,
      slug: normalizedUpdateSlug || undefined,
      locationAr: req.body.locationAr,
      categoryAr: req.body.categoryAr,
      descriptionAr: req.body.descriptionAr,
      beforeImage: beforeValue,
      afterImage: afterValue,
      coverImage: coverValue,
      gallery: gallery.length ? gallery : undefined,
      videoUrl: videoValue,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      isPublished: typeof isPublished === "boolean" ? isPublished : undefined
    };

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: updateData
  });

  return res.json(project);
}

export async function deleteProject(req: Request, res: Response) {
  await prisma.project.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
