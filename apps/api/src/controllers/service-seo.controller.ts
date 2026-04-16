import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../services/prisma.js";
import { isValidImageUrl, parseBoolean, parseGallery, uploadMediaFile, uploadMediaFiles } from "../services/media.js";
import { resolveServiceMedia } from "../services/service-media-fallback.js";

type ContentSections = Prisma.JsonObject;

type FaqItem = {
  question: string;
  answer: string;
};

type ServiceSeoSourceService = {
  id: string;
  titleAr: string;
  slug: string;
  shortDescAr: string;
  contentAr: string;
  seoTitleAr: string | null;
  seoDescriptionAr: string | null;
  coverImage: string | null;
  gallery: string[];
  isPublished?: boolean;
  updatedAt?: Date;
};

function normalizeUploadUrl(value: string): string {
  return value.trim();
}

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

function normalizeMediaList(items: unknown): string[] {
  const values = parseGallery(items)
    .map((item) => normalizeUploadUrl(String(item || "")))
    .filter(Boolean);

  return Array.from(new Set(values.filter((item) => isValidImageUrl(item))));
}

function isPlaceholderImage(value: string) {
  return value.includes("/images/placeholder-before.svg") || value.includes("/images/placeholder-after.svg");
}

function isUsableSectionImage(value: unknown) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return false;
  }

  if (!isValidImageUrl(normalized)) {
    return false;
  }

  if (isPlaceholderImage(normalized)) {
    return false;
  }

  return true;
}

function mergeMediaLists(primary: unknown, secondary: unknown) {
  const merged = new Set<string>();

  normalizeMediaList(primary).forEach((item) => merged.add(item));
  normalizeMediaList(secondary).forEach((item) => merged.add(item));

  return Array.from(merged);
}

function enrichSeoPageWithService(
  page: {
    id?: string | null;
    serviceId: string;
    title: string;
    slug: string;
    metaTitle: string | null;
    metaDescription: string | null;
    contentSections: Prisma.JsonValue;
    images: Prisma.JsonValue;
    faq: Prisma.JsonValue;
    updatedAt: Date;
  },
  service: ServiceSeoSourceService
) {
  const resolvedService = resolveServiceMedia(service);

  const currentSections =
    page.contentSections && typeof page.contentSections === "object"
      ? ({ ...(page.contentSections as ContentSections) } as ContentSections)
      : ({} as ContentSections);

  const mergedImages = mergeMediaLists(page.images, resolvedService.gallery);
  const heroImage = normalizeUploadUrl(String((currentSections.heroImage as unknown) || "").trim());
  const beforeImage = normalizeUploadUrl(String((currentSections.beforeImage as unknown) || "").trim());
  const afterImage = normalizeUploadUrl(String((currentSections.afterImage as unknown) || "").trim());
  const serviceLead = resolvedService.shortDescAr?.trim() || resolvedService.contentAr?.trim() || null;

  currentSections.heroTitle =
    String((currentSections.heroTitle as unknown) || "").trim() || page.title || resolvedService.titleAr;

  if (!String((currentSections.heroLead as unknown) || "").trim() && serviceLead) {
    currentSections.heroLead = serviceLead;
  }

  if (!isUsableSectionImage(heroImage)) {
    currentSections.heroImage = resolvedService.coverImage || null;
  } else {
    currentSections.heroImage = heroImage;
  }

  if (!isUsableSectionImage(beforeImage)) {
    currentSections.beforeImage = null;
  } else {
    currentSections.beforeImage = beforeImage;
  }

  if (!isUsableSectionImage(afterImage)) {
    currentSections.afterImage = null;
  } else {
    currentSections.afterImage = afterImage;
  }

  return {
    ...page,
    title: page.title || resolvedService.titleAr,
    metaTitle: page.metaTitle || resolvedService.seoTitleAr || page.title || resolvedService.titleAr,
    metaDescription: page.metaDescription || resolvedService.seoDescriptionAr || serviceLead,
    contentSections: currentSections,
    images: mergedImages
  };
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
    heroImage: normalizeMediaList(service.coverImage)[0] || null,
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
  const resolvedService = resolveServiceMedia(service);

  return {
    id: null,
    serviceId: resolvedService.id,
    title: resolvedService.titleAr,
    slug: resolvedService.slug,
    metaTitle: resolvedService.seoTitleAr || resolvedService.titleAr,
    metaDescription: resolvedService.seoDescriptionAr || resolvedService.shortDescAr,
    contentSections: defaultContentSections(resolvedService),
    images: normalizeMediaList(resolvedService.gallery),
    faq: defaultFaq(resolvedService.titleAr),
    updatedAt: resolvedService.updatedAt
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
    return res.json(
      enrichSeoPageWithService(
        {
          id: page.id,
          serviceId: page.serviceId,
          title: page.title,
          slug: page.slug,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          contentSections: page.contentSections,
          images: page.images,
          faq: page.faq,
          updatedAt: page.updatedAt
        },
        page.service
      )
    );
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

export async function getServiceSeoByServiceSlug(req: Request, res: Response) {
  const serviceSlug = String(req.params.slug || "").trim().toLowerCase();

  if (!serviceSlug) {
    return res.status(400).json({ message: "slug مطلوب" });
  }

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
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

  const page = await prisma.serviceSeoPage.findUnique({ where: { serviceId: service.id } });

  if (!page) {
    return res.json(mapServiceSeo(service));
  }

  return res.json(
    enrichSeoPageWithService(
      {
        id: page.id,
        serviceId: page.serviceId,
        title: page.title,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        contentSections: page.contentSections,
        images: page.images,
        faq: page.faq,
        updatedAt: page.updatedAt
      },
      service
    )
  );
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

  if (page) {
    return res.json({
      service,
      seoPage: enrichSeoPageWithService(
        {
          id: page.id,
          serviceId: page.serviceId,
          title: page.title,
          slug: page.slug,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          contentSections: page.contentSections,
          images: page.images,
          faq: page.faq,
          updatedAt: page.updatedAt
        },
        service
      )
    });
  }

  return res.json({
    service,
    seoPage: mapServiceSeo(service)
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
    const existingImages = normalizeMediaList(req.body.images);

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

    const nextImages = normalizeMediaList([...existingImages, ...uploadedGalleryImages]);

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
