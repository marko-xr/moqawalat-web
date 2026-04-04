import { Router } from "express";
import { body } from "express-validator";
import {
  createLead,
  createLeadValidation,
  getLeads,
  updateLead
} from "../controllers/leads.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/role.js";
import { upload } from "../middlewares/upload.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.post("/", upload.single("image"), createLeadValidation, validateRequest, createLead);
router.get("/", requireAuth, requireRole("OWNER", "ADMIN"), getLeads);
router.patch(
  "/:id",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  body("status").optional().isIn(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]),
  body("crmNotes").optional().isString().isLength({ max: 5000 }),
  validateRequest,
  updateLead
);

export default router;
