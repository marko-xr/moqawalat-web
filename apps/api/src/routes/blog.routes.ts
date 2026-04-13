import { Router } from "express";
import {
  blogValidation,
  createBlogPost,
  deleteBlogPost,
  getBlogBySlug,
  getBlogPosts,
  updateBlogPost
} from "../controllers/blog.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { cmsUpload, ensureNonEmptyUploads } from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.get("/", getBlogPosts);
router.get("/:slug", getBlogBySlug);
router.post(
  "/",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([{ name: "coverImage", maxCount: 1 }]),
  ensureNonEmptyUploads,
  blogValidation,
  validateRequest,
  createBlogPost
);
router.put(
  "/:id",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([{ name: "coverImage", maxCount: 1 }]),
  ensureNonEmptyUploads,
  blogValidation,
  validateRequest,
  updateBlogPost
);
router.delete("/:id", requireAuth, requireRole("OWNER", "ADMIN"), deleteBlogPost);

export default router;
