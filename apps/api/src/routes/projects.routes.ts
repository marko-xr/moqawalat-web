import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectsAdmin,
  getProjectBySlug,
  getProjects,
  projectCreateValidation,
  projectUpdateValidation,
  updateProject
} from "../controllers/projects.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { cmsUpload } from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.get("/", getProjects);
router.get("/admin", requireAuth, requireRole("OWNER", "ADMIN"), getProjectsAdmin);
router.get("/:slug", getProjectBySlug);
router.post(
  "/",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 16 },
    { name: "video", maxCount: 1 },
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 }
  ]),
  projectCreateValidation,
  validateRequest,
  createProject
);
router.put(
  "/:id",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 16 },
    { name: "video", maxCount: 1 },
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 }
  ]),
  projectUpdateValidation,
  validateRequest,
  updateProject
);
router.delete("/:id", requireAuth, requireRole("OWNER", "ADMIN"), deleteProject);

export default router;
