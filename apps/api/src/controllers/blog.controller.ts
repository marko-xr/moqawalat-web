import type { Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../services/prisma.js";
import { isValidImageUrl, parseBoolean, uploadMediaFile } from "../services/media.js";

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

function isOptionalImageUrl(value: unknown) {
  if (value === undefined || value === null) {
    return true;
  }

  const raw = String(value).trim();
  if (!raw) {
    return true;
  }

  return isValidImageUrl(raw);
}

function logBlogIncomingImages(action: "create" | "update", postId: string | null, coverImage: string) {
  console.log("BLOG INCOMING IMAGES", action, postId, { coverImage });
}

function logBlogSavedImages(post: { id: string; coverImage: string | null }) {
  console.log("BLOG SAVED IMAGES", post.id, { coverImage: post.coverImage });
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

export const blogValidation = [
  body("titleAr").isLength({ min: 3 }),
  body("slug")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value === undefined || value === null || String(value).trim() === "") {
        return true;
      }
      return /^[-a-z0-9]+$/.test(String(value).trim().toLowerCase());
    }),
  body("excerptAr").isLength({ min: 10 }),
  body("contentAr").isLength({ min: 50 }),
  body("seoTitleAr").optional().isString().isLength({ max: 160 }),
  body("seoDescriptionAr").optional().isString().isLength({ max: 300 }),
  body("coverImage").custom((value) => isOptionalImageUrl(value)).withMessage("Cover image must be a valid image URL"),
  body("published").optional().isBoolean().toBoolean()
];

export async function getBlogPosts(req: Request, res: Response) {
  const isAdmin = req.query.all === "true";

  const posts = await prisma.blogPost.findMany({
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" }
  });

  return res.json(posts);
}

export async function getBlogBySlug(req: Request, res: Response) {
  const post = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });

  if (!post) {
    return res.status(404).json({ message: "Blog post not found" });
  }

  return res.json(post);
}

export async function createBlogPost(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const uploadedCover = await uploadMediaFile(coverFile, "moqawalat/blog");
  const rawCoverImage = typeof req.body.coverImage === "string" ? req.body.coverImage.trim() : "";

  logBlogIncomingImages("create", null, rawCoverImage);

  if (rawCoverImage && !isValidImageUrl(rawCoverImage)) {
    return res.status(422).json({
      message: "Cover image must be a valid image URL.",
      code: "BLOG_INVALID_COVER_URL"
    });
  }

  const normalizedSlug = toSlug(String(req.body.slug || "")) || toSlug(String(req.body.titleAr || "")) || `blog-${Date.now()}`;
  const published = parseBoolean(req.body.published);

  const post = await prisma.blogPost.create({
    data: {
      titleAr: req.body.titleAr,
      slug: normalizedSlug,
      excerptAr: req.body.excerptAr,
      contentAr: req.body.contentAr,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      coverImage: uploadedCover || rawCoverImage || null,
      published: typeof published === "boolean" ? published : true
    }
  });

  logBlogSavedImages(post);

  return res.status(201).json(post);
}

export async function updateBlogPost(req: Request, res: Response) {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const coverFile = files?.coverImage?.[0];
  const uploadedCover = await uploadMediaFile(coverFile, "moqawalat/blog");
  const rawCoverImage = typeof req.body.coverImage === "string" ? req.body.coverImage.trim() : "";

  logBlogIncomingImages("update", req.params.id, rawCoverImage);

  if (rawCoverImage && !isValidImageUrl(rawCoverImage)) {
    return res.status(422).json({
      message: "Cover image must be a valid image URL.",
      code: "BLOG_INVALID_COVER_URL"
    });
  }

  const published = parseBoolean(req.body.published);
  const removeCoverImage = parseBoolean(req.body.removeCoverImage) === true;
  const slug = toSlug(String(req.body.slug || ""));

  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: {
      titleAr: req.body.titleAr,
      slug: slug || undefined,
      excerptAr: req.body.excerptAr,
      contentAr: req.body.contentAr,
      seoTitleAr: req.body.seoTitleAr || null,
      seoDescriptionAr: req.body.seoDescriptionAr || null,
      coverImage: removeCoverImage
        ? null
        : uploadedCover || (rawCoverImage ? rawCoverImage : undefined),
      published: typeof published === "boolean" ? published : undefined
    }
  });

  logBlogSavedImages(post);

  return res.json(post);
}

export async function deleteBlogPost(req: Request, res: Response) {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
