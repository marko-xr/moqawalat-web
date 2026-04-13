import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
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

function parseSortOrder(value: unknown): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  if (parsed < 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

function isValidImageUrl(value: string) {
  if (!value) {
    return false;
  }

  if (value.startsWith("data:image/")) {
    return true;
  }

  if (value.startsWith("/uploads/") || value.startsWith("uploads/")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeGalleryInput(value: unknown) {
  return parseGallery(value)
    .map((item) => String(item || "").trim())
    .filter((item) => isValidImageUrl(item));
}

const SERVICE_SELECT_LEGACY = {
  id: true,
  titleAr: true,
  slug: true,
  shortDescAr: true,
  contentAr: true,
  seoTitleAr: true,
  seoDescriptionAr: true,
  imageUrl: true,
  coverImage: true,
  gallery: true,
  videoUrl: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true
} as const;

const SERVICE_SELECT_BASE = {
  ...SERVICE_SELECT_LEGACY,
  sortOrder: true
} as const;

const SERVICE_SELECT_WITH_DESCRIPTIONS_NO_SORT = {
  ...SERVICE_SELECT_LEGACY,
  galleryDescriptions: true
} as const;

const SERVICE_SELECT_WITH_DESCRIPTIONS = {
  ...SERVICE_SELECT_BASE,
  galleryDescriptions: true
} as const;

function isMissingGalleryDescriptionsColumnError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
    const column = String((error.meta as { column?: string } | undefined)?.column || "");
    if (column.includes("galleryDescriptions")) {
      return true;
    }
  }

  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("Service.galleryDescriptions") || message.includes("galleryDescriptions");
}

function isMissingSortOrderColumnError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
    const column = String((error.meta as { column?: string } | undefined)?.column || "");
    if (column.includes("sortOrder")) {
      return true;
    }
  }

  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("Service.sortOrder") || message.includes("sortOrder");
}

function appendEmptyGalleryDescriptions<T extends { gallery: string[] }>(service: T) {
  return {
    ...service,
    galleryDescriptions: Array(service.gallery?.length || 0).fill("")
  };
}

function appendSortOrder<T>(service: T, sortOrder: number) {
  return {
    ...service,
    sortOrder
  };
}

function getSafeServiceSelect(missingGalleryDescriptions: boolean, missingSortOrder: boolean) {
  if (missingGalleryDescriptions && missingSortOrder) {
    return SERVICE_SELECT_LEGACY;
  }

  if (missingSortOrder) {
    return SERVICE_SELECT_WITH_DESCRIPTIONS_NO_SORT;
  }

  if (missingGalleryDescriptions) {
    return SERVICE_SELECT_BASE;
  }

  return SERVICE_SELECT_WITH_DESCRIPTIONS;
}

function mapServiceMutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = Array.isArray((error.meta as { target?: string[] } | undefined)?.target)
        ? (error.meta as { target: string[] }).target.join(",")
        : String((error.meta as { target?: string } | undefined)?.target || "");

      if (target.includes("slug")) {
        return { status: 409, message: "الرابط (slug) مستخدم بالفعل. يرجى اختيار رابط مختلف.", code: "SERVICE_SLUG_EXISTS" };
      }

      return { status: 409, message: "توجد خدمة أخرى بنفس القيمة الفريدة.", code: "SERVICE_DUPLICATE" };
    }

    if (error.code === "P2000") {
      return { status: 400, message: "أحد الحقول أطول من الحد المسموح.", code: "SERVICE_FIELD_TOO_LONG" };
    }

    if (error.code === "P2025") {
      return { status: 404, message: "الخدمة غير موجودة.", code: "SERVICE_NOT_FOUND" };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { status: 400, message: "بيانات الخدمة غير صحيحة.", code: "SERVICE_INVALID_PAYLOAD" };
  }

  return null;
}

export const serviceCreateValidation = [
  body("titleAr").isLength({ min: 3 }),
  body("sortOrder").optional({ values: "falsy" }).isInt({ min: 0 }).toInt(),
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
    .withMessage("صيغة الرابط (slug) غير صحيحة"),
  body("shortDescAr").isLength({ min: 10 }),
  body("contentAr").isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("رابط الفيديو غير صحيح"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export const serviceUpdateValidation = [
  body("titleAr").optional().isLength({ min: 3 }),
  body("sortOrder").optional({ values: "falsy" }).isInt({ min: 0 }).toInt(),
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
    .withMessage("صيغة الرابط (slug) غير صحيحة"),
  body("shortDescAr").optional().isLength({ min: 10 }),
  body("contentAr").optional().isLength({ min: 20 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("videoUrl").custom((value) => isOptionalValidUrl(value)).withMessage("رابط الفيديو غير صحيح"),
  body("isPublished").optional().isBoolean().toBoolean()
];

export async function getServices(_req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: SERVICE_SELECT_WITH_DESCRIPTIONS
    });

    return res.json(services);
  } catch (error) {
    if (!isMissingGalleryDescriptionsColumnError(error) && !isMissingSortOrderColumnError(error)) {
      throw error;
    }

    try {
      const services = await prisma.service.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: SERVICE_SELECT_BASE
      });

      return res.json(services.map((service) => appendEmptyGalleryDescriptions(service)));
    } catch (fallbackError) {
      if (!isMissingSortOrderColumnError(fallbackError)) {
        throw fallbackError;
      }

      const legacyServices = await prisma.service.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        select: SERVICE_SELECT_LEGACY
      });

      return res.json(
        legacyServices.map((service, index) => appendSortOrder(appendEmptyGalleryDescriptions(service), index))
      );
    }
  }
}

export async function getServicesAdmin(_req: Request, res: Response) {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: SERVICE_SELECT_WITH_DESCRIPTIONS
    });

    return res.json(services);
  } catch (error) {
    if (!isMissingGalleryDescriptionsColumnError(error) && !isMissingSortOrderColumnError(error)) {
      throw error;
    }

    try {
      const services = await prisma.service.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        select: SERVICE_SELECT_BASE
      });

      return res.json(services.map((service) => appendEmptyGalleryDescriptions(service)));
    } catch (fallbackError) {
      if (!isMissingSortOrderColumnError(fallbackError)) {
        throw fallbackError;
      }

      const legacyServices = await prisma.service.findMany({
        orderBy: { createdAt: "desc" },
        select: SERVICE_SELECT_LEGACY
      });

      return res.json(
        legacyServices.map((service, index) => appendSortOrder(appendEmptyGalleryDescriptions(service), index))
      );
    }
  }
}

export async function getServiceBySlug(req: Request, res: Response) {
  let serviceData: any;

  try {
    serviceData = await prisma.service.findUnique({
      where: { slug: req.params.slug },
      select: SERVICE_SELECT_WITH_DESCRIPTIONS
    });
  } catch (error) {
    if (!isMissingGalleryDescriptionsColumnError(error) && !isMissingSortOrderColumnError(error)) {
      throw error;
    }

    try {
      const fallbackService = await prisma.service.findUnique({
        where: { slug: req.params.slug },
        select: SERVICE_SELECT_BASE
      });

      serviceData = fallbackService ? appendEmptyGalleryDescriptions(fallbackService) : null;
    } catch (fallbackError) {
      if (!isMissingSortOrderColumnError(fallbackError)) {
        throw fallbackError;
      }

      const legacyService = await prisma.service.findUnique({
        where: { slug: req.params.slug },
        select: SERVICE_SELECT_LEGACY
      });

      serviceData = legacyService ? appendSortOrder(appendEmptyGalleryDescriptions(legacyService), 0) : null;
    }
  }

  if (!serviceData) {
    return res.status(404).json({ message: "الخدمة غير موجودة" });
  }

  if (serviceData.isPublished === false) {
    return res.status(404).json({ message: "الخدمة غير موجودة" });
  }

  return res.json(serviceData);
}

export async function createService(req: Request, res: Response) {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const coverFile = files?.coverImage?.[0];
    const galleryFiles = files?.gallery || [];
    const videoFile = files?.video?.[0];

    const coverImage = await uploadMediaFile(coverFile, "moqawalat/services");
    const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/services");
    const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/services");

    const gallery = sanitizeGalleryInput([...parseGallery(req.body.gallery), ...uploadedGallery]);
    const existingDescriptions = normalizeDescriptions(parseGallery(req.body.galleryDescriptions), parseGallery(req.body.gallery).length);
    const newDescriptions = normalizeDescriptions(parseGallery(req.body.newGalleryDescriptions), uploadedGallery.length);
    const galleryDescriptions = [...existingDescriptions, ...newDescriptions];
    const normalizedInputSlug = toSlug(String(req.body.slug || ""));
    const rawSlug = normalizedInputSlug || toSlug(String(req.body.titleAr || ""));
    const slug = rawSlug || `service-${Date.now()}`;
    const isPublished = parseBoolean(req.body.isPublished);
    const requestedSortOrder = parseSortOrder(req.body.sortOrder);

    let sortOrder = requestedSortOrder;
    if (typeof sortOrder !== "number") {
      try {
        const aggregate = await prisma.service.aggregate({ _max: { sortOrder: true } });
        sortOrder = (aggregate._max.sortOrder ?? -1) + 1;
      } catch (aggregateError) {
        if (!isMissingSortOrderColumnError(aggregateError)) {
          throw aggregateError;
        }
      }
    }

    const createData: any = {
      titleAr: req.body.titleAr,
      slug,
      sortOrder,
      shortDescAr: req.body.shortDescAr,
      contentAr: req.body.contentAr,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      imageUrl: req.body.imageUrl || null,
      coverImage:
        coverImage ||
        (typeof req.body.coverImage === "string" && isValidImageUrl(req.body.coverImage.trim())
          ? req.body.coverImage.trim()
          : null),
      gallery,
      galleryDescriptions,
      videoUrl: uploadedVideo || req.body.videoUrl || null,
      isPublished: typeof isPublished === "boolean" ? isPublished : true
    };

    let service: any;

    try {
      service = await prisma.service.create({ data: createData });
    } catch (error) {
      const missingGalleryDescriptions = isMissingGalleryDescriptionsColumnError(error);
      const missingSortOrder = isMissingSortOrderColumnError(error);

      if (!missingGalleryDescriptions && !missingSortOrder) {
        throw error;
      }

      const fallbackCreateData = { ...createData };
      if (missingGalleryDescriptions) {
        delete fallbackCreateData.galleryDescriptions;
      }
      if (missingSortOrder) {
        delete fallbackCreateData.sortOrder;
      }

      const fallbackSelect = getSafeServiceSelect(missingGalleryDescriptions, missingSortOrder);

      const createdService = await prisma.service.create({ data: fallbackCreateData, select: fallbackSelect });
      service = missingGalleryDescriptions ? appendEmptyGalleryDescriptions(createdService) : createdService;
      service = missingSortOrder ? appendSortOrder(service, 0) : service;
    }

    return res.status(201).json(service);
  } catch (error) {
    const mapped = mapServiceMutationError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message, code: mapped.code });
    }

    throw error;
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const coverFile = files?.coverImage?.[0];
    const galleryFiles = files?.gallery || [];
    const videoFile = files?.video?.[0];

    const coverImage = await uploadMediaFile(coverFile, "moqawalat/services");
    const uploadedGallery = await uploadMediaFiles(galleryFiles, "moqawalat/services");
    const uploadedVideo = await uploadMediaFile(videoFile, "moqawalat/services");

    const existingGallery = parseGallery(req.body.gallery);
    const gallery = sanitizeGalleryInput([...existingGallery, ...uploadedGallery]);
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
      : coverImage ||
        (typeof req.body.coverImage === "string" && isValidImageUrl(req.body.coverImage.trim())
          ? req.body.coverImage.trim() || null
          : undefined);
    const videoValue = removeVideo
      ? null
      : uploadedVideo || (typeof req.body.videoUrl === "string" ? req.body.videoUrl.trim() || null : undefined);

    const normalizedUpdateSlug = toSlug(String(req.body.slug || ""));
    const hasSortOrderField =
      typeof req.body.sortOrder !== "undefined" && String(req.body.sortOrder).trim() !== "";
    const parsedSortOrder = parseSortOrder(req.body.sortOrder);

    const updateData: any = {
      titleAr: req.body.titleAr,
      slug: normalizedUpdateSlug || undefined,
      sortOrder: hasSortOrderField ? parsedSortOrder : undefined,
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

    let service: any;

    try {
      service = await prisma.service.update({
        where: { id: req.params.id },
        data: updateData
      });
    } catch (error) {
      const missingGalleryDescriptions = isMissingGalleryDescriptionsColumnError(error);
      const missingSortOrder = isMissingSortOrderColumnError(error);

      if (!missingGalleryDescriptions && !missingSortOrder) {
        throw error;
      }

      const fallbackUpdateData = { ...updateData };
      if (missingGalleryDescriptions) {
        delete fallbackUpdateData.galleryDescriptions;
      }
      if (missingSortOrder) {
        delete fallbackUpdateData.sortOrder;
      }

      const fallbackSelect = getSafeServiceSelect(missingGalleryDescriptions, missingSortOrder);

      const updatedService = await prisma.service.update({
        where: { id: req.params.id },
        data: fallbackUpdateData,
        select: fallbackSelect
      });

      service = missingGalleryDescriptions ? appendEmptyGalleryDescriptions(updatedService) : updatedService;
      service = missingSortOrder ? appendSortOrder(service, 0) : service;
    }

    return res.json(service);
  } catch (error) {
    const mapped = mapServiceMutationError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message, code: mapped.code });
    }

    throw error;
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    const mapped = mapServiceMutationError(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message, code: mapped.code });
    }

    throw error;
  }
}
