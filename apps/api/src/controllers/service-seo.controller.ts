import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../services/prisma.js";
import { parseBoolean, parseGallery, uploadMediaFile, uploadMediaFiles } from "../services/media.js";

type ContentSections = Prisma.JsonObject;

type FaqItem = {
  question: string;
  answer: string;
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

function normalizeFaq(items: unknown): FaqItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const question = String((item as { question?: unknown }).question || "").trim();
      const answer = String((item as { answer?: unknown }).answer || "").trim();

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

function defaultContentSections(service: {
  titleAr: string;
  shortDescAr: string;
  contentAr: string;
  coverImage: string | null;
  gallery: string[];
}) {
  return {
    heroTitle: service.titleAr,
    heroLead: service.shortDescAr,
    heroPoints: [
      "معاينة مجانية وتقييم فني قبل التنفيذ.",
      "مواد عزل مناسبة لأجواء المنطقة الشرقية.",
      "تنفيذ سريع ونظيف مع ضمان واضح."
    ],
    trustItems: [
      { title: "خبرة ميدانية", description: "تنفيذ احترافي لحلول العزل في الدمام والخبر والظهران." },
      { title: "جودة وضمان", description: "استخدام مواد معتمدة مع متابعة كل خطوة أثناء التنفيذ." },
      { title: "أسعار واضحة", description: "عرض سعر تفصيلي بدون تكاليف مخفية." }
    ],
    serviceItems: [
      {
        title: "حلول عزل متكاملة",
        description: service.contentAr,
        imageAlt: `${service.titleAr} في الدمام`
      }
    ],
    areas: ["الدمام", "الخبر", "الظهران", "القطيف"],
    relatedLinks: [
      { title: "خدمات الدهانات الداخلية والخارجية", href: "/services/painting-services" },
      { title: "الأعمال الحديدية والمظلات", href: "/services/metal-works" },
      { title: "الجبس والديكورات", href: "/services/gypsum-decorations" }
    ],
    ctaTopTitle: "احصل على معاينة سريعة",
    ctaTopDescription: "اتصل الآن لتحديد أفضل حل عزل لسطح المبنى.",
    ctaBottomTitle: "جاهز لبدء التنفيذ؟",
    ctaBottomDescription: "تواصل معنا الآن عبر الاتصال أو الواتساب.",
    heroImage: service.coverImage || service.gallery[0] || null,
    beforeImage: null,
    afterImage: null
  };
}

function defaultFaq(serviceTitle: string): FaqItem[] {
  return [
    {
      question: `ما أفضل نوع ${serviceTitle} في الدمام؟`,
      answer: "يعتمد على حالة السطح وطبيعة المبنى، ويتم تحديد النوع المناسب بعد المعاينة الفنية."
    },
    {
      question: "كم مدة تنفيذ الخدمة؟",
      answer: "في معظم الحالات السكنية من يوم إلى 3 أيام بحسب المساحة وتجهيزات الموقع."
    },
    {
      question: "هل يوجد ضمان بعد التنفيذ؟",
      answer: "نعم، يتم تقديم ضمان مكتوب حسب نوع المواد ونطاق العمل المتفق عليه."
    },
    {
      question: "هل الخدمة متاحة في الخبر والظهران والقطيف؟",
      answer: "نعم، نقدم الخدمة في الدمام وكامل المنطقة الشرقية."
    },
    {
      question: "كيف أحصل على عرض سعر؟",
      answer: "يمكنك الاتصال المباشر أو إرسال التفاصيل عبر الواتساب لتحديد موعد المعاينة."
    }
  ];
}

function mapServiceSeo(service: {
  id: string;
  titleAr: string;
  slug: string;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  shortDescAr: string;
  contentAr: string;
  coverImage: string | null;
  gallery: string[];
  updatedAt: Date;
}) {
  return {
    id: null,
    serviceId: service.id,
    title: service.titleAr,
    slug: service.slug,
    metaTitle: service.seoTitleAr,
    metaDescription: service.seoDescriptionAr,
    contentSections: defaultContentSections(service),
    images: service.gallery || [],
    faq: defaultFaq(service.titleAr),
    updatedAt: service.updatedAt
  };
}

function mapMutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: 409,
        message: "يوجد تعارض في الرابط (slug). استخدم رابط مختلف.",
        code: "SEO_SLUG_EXISTS"
      };
    }

    if (error.code === "P2025") {
      return {
        status: 404,
        message: "الخدمة المطلوبة غير موجودة.",
        code: "SERVICE_NOT_FOUND"
      };
    }
  }

  return null;
}

export async function getServiceSeoBySlug(req: Request, res: Response) {
  const slug = String(req.params.slug || "").trim().toLowerCase();

  if (!slug) {
    return res.status(400).json({ message: "slug مطلوب" });
  }

  const page = await prisma.serviceSeoPage.findUnique({
    where: { slug },
    include: {
      service: {
        select: {
          id: true,
          titleAr: true,
          slug: true,
          shortDescAr: true,
          contentAr: true,
          seoTitleAr: true,
          seoDescriptionAr: true,
          coverImage: true,
          gallery: true,
          isPublished: true,
          updatedAt: true
        }
      }
    }
  });

  if (page && page.service.isPublished) {
    return res.json(page);
  }

  const service = await prisma.service.findUnique({
    where: { slug },
    select: {
      id: true,
      titleAr: true,
      slug: true,
      shortDescAr: true,
      contentAr: true,
      seoTitleAr: true,
      seoDescriptionAr: true,
      coverImage: true,
      gallery: true,
      isPublished: true,
      updatedAt: true
    }
  });

  if (!service || !service.isPublished) {
    return res.status(404).json({ message: "الصفحة غير موجودة" });
  }

  return res.json(mapServiceSeo(service));
}

export async function getServiceSeoByServiceIdAdmin(req: Request, res: Response) {
  const serviceId = req.params.serviceId;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      titleAr: true,
      slug: true,
      shortDescAr: true,
      contentAr: true,
      seoTitleAr: true,
      seoDescriptionAr: true,
      coverImage: true,
      gallery: true,
      isPublished: true,
      updatedAt: true
    }
  });

  if (!service) {
    return res.status(404).json({ message: "الخدمة غير موجودة" });
  }

  const page = await prisma.serviceSeoPage.findUnique({ where: { serviceId } });

  return res.json({
    service,
    seoPage: page || mapServiceSeo(service)
  });
}

export async function upsertServiceSeoByServiceIdAdmin(req: Request, res: Response) {
  try {
    const serviceId = req.params.serviceId;

    const currentService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        titleAr: true,
        slug: true,
        seoTitleAr: true,
        seoDescriptionAr: true,
        shortDescAr: true,
        contentAr: true,
        coverImage: true,
        gallery: true,
        updatedAt: true
      }
    });

    if (!currentService) {
      return res.status(404).json({ message: "الخدمة غير موجودة" });
    }

    const existingPage = await prisma.serviceSeoPage.findUnique({ where: { serviceId } });

    const title = String(req.body.title || existingPage?.title || currentService.titleAr).trim();
    const slugRaw = String(req.body.slug || existingPage?.slug || currentService.slug).trim();
    const slug = toSlug(slugRaw) || currentService.slug;
    const metaTitle = String(req.body.metaTitle || "").trim() || null;
    const metaDescription = String(req.body.metaDescription || "").trim() || null;

    const parsedSections = safeJsonParse<ContentSections>(req.body.contentSections, {} as ContentSections);
    const parsedFaq = normalizeFaq(safeJsonParse<unknown[]>(req.body.faq, []));
    const existingImages = parseGallery(req.body.images);

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const heroImageFile = files?.heroImage?.[0];
    const beforeImageFile = files?.beforeImage?.[0];
    const afterImageFile = files?.afterImage?.[0];
    const galleryFiles = files?.images || [];

    const uploadedHeroImage = await uploadMediaFile(heroImageFile, "moqawalat/seo-services");
    const uploadedBeforeImage = await uploadMediaFile(beforeImageFile, "moqawalat/seo-services");
    const uploadedAfterImage = await uploadMediaFile(afterImageFile, "moqawalat/seo-services");
    const uploadedGalleryImages = await uploadMediaFiles(galleryFiles, "moqawalat/seo-services");

    const currentSections =
      (existingPage?.contentSections && typeof existingPage.contentSections === "object"
        ? (existingPage.contentSections as ContentSections)
        : defaultContentSections(currentService)) || {};

    const nextSections: ContentSections = {
      ...currentSections,
      ...parsedSections
    };

    const removeHeroImage = parseBoolean(req.body.removeHeroImage) === true;
    const removeBeforeImage = parseBoolean(req.body.removeBeforeImage) === true;
    const removeAfterImage = parseBoolean(req.body.removeAfterImage) === true;

    if (removeHeroImage) {
      nextSections.heroImage = null;
    } else if (uploadedHeroImage) {
      nextSections.heroImage = uploadedHeroImage;
    }

    if (removeBeforeImage) {
      nextSections.beforeImage = null;
    } else if (uploadedBeforeImage) {
      nextSections.beforeImage = uploadedBeforeImage;
    }

    if (removeAfterImage) {
      nextSections.afterImage = null;
    } else if (uploadedAfterImage) {
      nextSections.afterImage = uploadedAfterImage;
    }

    const nextImages = [...existingImages, ...uploadedGalleryImages];

    const [updatedService, seoPage] = await prisma.$transaction([
      prisma.service.update({
        where: { id: serviceId },
        data: {
          titleAr: title,
          slug,
          seoTitleAr: metaTitle,
          seoDescriptionAr: metaDescription
        },
        select: {
          id: true,
          titleAr: true,
          slug: true,
          shortDescAr: true,
          contentAr: true,
          seoTitleAr: true,
          seoDescriptionAr: true,
          coverImage: true,
          gallery: true,
          isPublished: true,
          updatedAt: true
        }
      }),
      prisma.serviceSeoPage.upsert({
        where: { serviceId },
        update: {
          title,
          slug,
          metaTitle,
          metaDescription,
          contentSections: nextSections,
          images: nextImages,
          faq: parsedFaq
        },
        create: {
          serviceId,
          title,
          slug,
          metaTitle,
          metaDescription,
          contentSections: nextSections,
          images: nextImages,
          faq: parsedFaq
        }
      })
    ]);

    return res.json({
      service: updatedService,
      seoPage
    });
  } catch (error) {
    const mapped = mapMutationError(error);

    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message, code: mapped.code });
    }

    throw error;
  }
}
