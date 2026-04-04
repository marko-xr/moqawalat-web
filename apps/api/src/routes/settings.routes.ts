import { Router } from "express";
import { getSettings, settingsValidation, upsertSettings } from "../controllers/settings.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.get("/", getSettings);
router.put("/", requireAuth, requireRole("OWNER", "ADMIN"), settingsValidation, validateRequest, upsertSettings);

export default router;
