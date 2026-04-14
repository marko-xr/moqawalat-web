import { Router } from "express";
import { body } from "express-validator";
import { getDashboardAnalytics, getImagesHealthCheck, trackClick } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.post("/click", body("type").isIn(["call", "whatsapp", "quote"]), validateRequest, trackClick);
router.get("/dashboard", requireAuth, requireRole("OWNER", "ADMIN"), getDashboardAnalytics);
router.get("/health/images", requireAuth, requireRole("OWNER", "ADMIN"), getImagesHealthCheck);

export default router;
