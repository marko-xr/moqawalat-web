import { Router } from "express";
import {
  createService,
  deleteService,
  getServicesAdmin,
  getServiceBySlug,
  getServices,
  serviceCreateValidation,
  serviceUpdateValidation,
  updateService
} from "../controllers/services.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { cmsUpload, ensureNonEmptyUploads } from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.get("/", getServices);
router.get("/admin", requireAuth, requireRole("OWNER", "ADMIN"), getServicesAdmin);
router.get("/:slug", getServiceBySlug);
router.post(
  "/",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 12 },
    { name: "video", maxCount: 1 }
  ]),
  ensureNonEmptyUploads,
  serviceCreateValidation,
  validateRequest,
  createService
);
router.put(
  "/:id",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "gallery", maxCount: 12 },
    { name: "video", maxCount: 1 }
  ]),
  ensureNonEmptyUploads,
  serviceUpdateValidation,
  validateRequest,
  updateService
);
router.delete("/:id", requireAuth, requireRole("OWNER", "ADMIN"), deleteService);

export default router;
