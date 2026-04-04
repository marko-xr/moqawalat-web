import type { Request, Response } from "express";
import { body } from "express-validator";
import { prisma } from "../services/prisma.js";

export const createLeadValidation = [
  body("fullName").isLength({ min: 3 }),
  body("phone").isLength({ min: 8 }),
  body("city").isLength({ min: 2 }),
  body("serviceType").isLength({ min: 2 }),
  body("locationUrl").optional({ values: "falsy" }).isString().isLength({ max: 1000 }),
  body("website").optional().isEmpty(),
  body("formStartedAt").optional().isISO8601()
];

export async function createLead(req: Request, res: Response) {
  if (req.body.website) {
    return res.status(400).json({ message: "Spam detected" });
  }

  if (req.body.formStartedAt) {
    const started = new Date(req.body.formStartedAt).getTime();
    const elapsed = Date.now() - started;

    if (elapsed < 2500) {
      return res.status(400).json({ message: "Form submitted too quickly" });
    }
  }

  const lead = await prisma.lead.create({
    data: {
      fullName: req.body.fullName,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp,
      city: req.body.city,
      serviceType: req.body.serviceType,
      message: req.body.message,
      locationUrl: typeof req.body.locationUrl === "string" ? req.body.locationUrl.trim() || undefined : undefined,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      source: req.body.source || "website",
      pageUrl: req.body.pageUrl,
      userAgent: req.headers["user-agent"]
    }
  });

  return res.status(201).json({ success: true, leadId: lead.id });
}

export async function getLeads(req: Request, res: Response) {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.lead.count()
  ]);

  return res.json({ items, total, page, pageSize });
}

export async function updateLead(req: Request, res: Response) {
  const hasStatus = typeof req.body.status === "string";
  const hasNotes = typeof req.body.crmNotes === "string";

  if (!hasStatus && !hasNotes) {
    return res.status(400).json({ message: "At least one field is required" });
  }

  const data: { status?: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED"; crmNotes?: string } = {};

  if (hasStatus) {
    data.status = req.body.status;
  }

  if (hasNotes) {
    data.crmNotes = req.body.crmNotes.trim();
  }

  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data
  });

  return res.json(lead);
}
