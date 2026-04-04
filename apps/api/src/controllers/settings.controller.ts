import type { Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../services/prisma.js";

export const settingsValidation = [
  body("siteNameAr").isLength({ min: 3 }),
  body("siteDescAr").isLength({ min: 10 }),
  body("primaryPhone").isLength({ min: 8 }),
  body("whatsappNumber").isLength({ min: 8 }),
  body("addressAr").isLength({ min: 4 })
];

export async function getSettings(_req: Request, res: Response) {
  const setting = await prisma.setting.findFirst({ orderBy: { createdAt: "asc" } });
  return res.json(setting);
}

export async function upsertSettings(req: Request, res: Response) {
  const existing = await prisma.setting.findFirst({ orderBy: { createdAt: "asc" } });

  if (!existing) {
    const created = await prisma.setting.create({ data: req.body });
    return res.status(201).json(created);
  }

  const updated = await prisma.setting.update({
    where: { id: existing.id },
    data: req.body
  });

  return res.json(updated);
}
