import type { Request, Response } from "express";
import { prisma } from "../services/prisma.js";
import { isValidImageUrl } from "../services/media.js";

function isRealImageUrl(value: string | null | undefined): boolean {
  return typeof value === "string" && isValidImageUrl(value);
}

function serviceHasRealImages(service: { coverImage: string | null; gallery: string[] }): boolean {
  if (isRealImageUrl(service.coverImage)) {
    return true;
  }

  return Array.isArray(service.gallery) && service.gallery.some((url) => isRealImageUrl(url));
}

export async function trackClick(req: Request, res: Response) {
  const { type, pageUrl } = req.body;

  if (!type) {
    return res.status(400).json({ message: "type is required" });
  }

  await prisma.clickEvent.create({ data: { type, pageUrl } });
  return res.status(201).json({ success: true });
}

export async function getDashboardAnalytics(_req: Request, res: Response) {
  const [leadCount, todayLeads, callClicks, whatsappClicks] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.clickEvent.count({ where: { type: "call" } }),
    prisma.clickEvent.count({ where: { type: "whatsapp" } })
  ]);

  return res.json({
    leadCount,
    todayLeads,
    callClicks,
    whatsappClicks
  });
}

export async function getImagesHealthCheck(_req: Request, res: Response) {
  const services = await prisma.service.findMany({
    select: { id: true, slug: true, titleAr: true, coverImage: true, gallery: true, isPublished: true }
  });

  const published = services.filter((s) => s.isPublished);
  const withImages = published.filter((s) => serviceHasRealImages(s));
  const missing = published
    .filter((s) => !serviceHasRealImages(s))
    .map((s) => ({ id: s.id, slug: s.slug, titleAr: s.titleAr }));

  return res.json({
    ok: missing.length === 0,
    total: published.length,
    withImages: withImages.length,
    missingCount: missing.length,
    missing
  });
}
