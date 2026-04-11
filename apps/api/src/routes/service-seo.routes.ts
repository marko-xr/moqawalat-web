import { Router } from "express";
import {
  getServiceSeoByServiceIdAdmin,
  getServiceSeoByServiceSlug,
  getServiceSeoBySlug,
  upsertServiceSeoByServiceIdAdmin
} from "../controllers/service-seo.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { cmsUpload } from "../middlewares/upload.js";

const router = Router();

router.get("/by-slug/:slug", getServiceSeoBySlug);
router.get("/by-service-slug/:slug", getServiceSeoByServiceSlug);
router.get("/admin/service/:serviceId", requireAuth, requireRole("OWNER", "ADMIN"), getServiceSeoByServiceIdAdmin);
router.put(
  "/admin/service/:serviceId",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  cmsUpload.fields([
    { name: "heroImage", maxCount: 1 },
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
    { name: "images", maxCount: 20 }
  ]),
  upsertServiceSeoByServiceIdAdmin
);

export default router;
