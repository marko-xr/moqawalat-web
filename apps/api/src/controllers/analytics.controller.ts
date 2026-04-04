import type { Request, Response } from "express";
import { prisma } from "../services/prisma.js";

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
