import { Router } from "express";
import { login, loginValidation, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validation.js";

const router = Router();

router.post("/login", loginValidation, validateRequest, login);
router.get("/me", requireAuth, me);

export default router;
