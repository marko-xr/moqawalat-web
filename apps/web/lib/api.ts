import type { ServiceSeoPage } from "@/lib/types";
import { isValidImageUrl, pickFirstImage, sanitizeImageList } from "@/lib/media";
import { resolveServiceMedia as resolveServiceMediaFallback } from "@/lib/service-media-fallback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_REVALIDATE_SECONDS = 300;
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const DEFAULT_SERVICES_FALLBACK = [
  {
    id: "fallback-painting-services",
    titleAr: "خدمات الدهانات الداخلية والخارجية",
    slug: "painting-services",
    shortDescAr: "تنفيذ دهانات احترافية للمنازل والفلل والمباني التجارية.",
    contentAr:
      "نقدم حلول دهان متكاملة باستخدام أفضل المواد المقاومة للرطوبة والحرارة مع تشطيبات عالية الجودة تناسب المناخ في المنطقة الشرقية.",
    seoTitleAr: "خدمات دهان بالدمام | مقاول دهانات محترف",
    seoDescriptionAr: "أفضل خدمات الدهانات الداخلية والخارجية في الدمام والخبر والظهران بأسعار تنافسية.",
    isPublished: true
  },
  {
    id: "fallback-roof-insulation",
    titleAr: "عزل الأسطح",
    slug: "roof-insulation",
    shortDescAr: "عزل مائي وحراري احترافي لحماية المباني من التسربات.",
    contentAr:
      "نوفر عزل اسطح باستخدام مواد معتمدة تمنع تسرب المياه وتقلل استهلاك الطاقة. حلول مناسبة للمنازل والمستودعات والمنشآت التجارية.",
    seoTitleAr: "عزل أسطح في الدمام | عزل مائي وحراري",
    seoDescriptionAr: "شركة عزل أسطح بالدمام تقدم حلول عزل مائي وحراري بضمان وجودة عالية.",
    isPublished: true
  },
  {
    id: "fallback-metal-works",
    titleAr: "الأعمال الحديدية",
    slug: "metal-works",
    shortDescAr: "تصميم وتنفيذ مظلات وهناجر وسواتر وأسوار حديد.",
    contentAr:
      "فريقنا ينفذ جميع أعمال الحديد حسب الطلب، من المظلات والهناجر إلى البوابات والأسوار مع تشطيب مقاوم للعوامل الجوية.",
    seoTitleAr: "مظلات وهناجر وسواتر حديد بالدمام",
    seoDescriptionAr: "تنفيذ أعمال الحديد في المنطقة الشرقية: مظلات، هناجر، سواتر، أسوار بجودة عالية.",
    isPublished: true
  },
  {
    id: "fallback-gypsum-decorations",
    titleAr: "الجبس والديكورات",
    slug: "gypsum-decorations",
    shortDescAr: "ديكورات جبسية عصرية وأسقف مستعارة وتشطيبات داخلية.",
    contentAr: "نصمم حلول جبس وديكور تعكس ذوقك، مع تنفيذ دقيق وتشطيبات فاخرة للمنازل والمكاتب والمعارض.",
    seoTitleAr: "ديكورات جبس بالدمام | تصميم وتنفيذ",
    seoDescriptionAr: "أعمال جبس وديكور داخلية بالدمام والخبر والظهران بتصاميم حديثة وأسعار مناسبة.",
    isPublished: true
  }
];

type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

function normalizeMediaUrl(value?: string | null) {
  if (!value) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_ORIGIN}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${API_ORIGIN}/${value}`;
  }

  return value;
}

function normalizeMediaList(value: unknown): string[] {
  const normalized = sanitizeImageList(value, { allowPlaceholders: true })
    .map((item) => normalizeMediaUrl(item) || item)
    .filter((item): item is string => isValidImageUrl(item, { allowPlaceholders: true }));

  return Array.from(new Set(normalized));
}

function normalizeService(service: any) {
  const normalized = {
    ...service,
    imageUrl: normalizeMediaUrl(service?.imageUrl),
    coverImage: normalizeMediaUrl(service?.coverImage),
    gallery: normalizeMediaList(service?.gallery)
  };

  return resolveServiceMediaFallback(normalized);
}

function normalizeProject(project: any) {
  return {
    ...project,
    beforeImage: normalizeMediaUrl(project?.beforeImage),
    afterImage: normalizeMediaUrl(project?.afterImage),
    coverImage: normalizeMediaUrl(project?.coverImage),
    gallery: normalizeMediaList(project?.gallery)
  };
}

function normalizeBlogPost(post: any) {
  return {
    ...post,
    coverImage: normalizeMediaUrl(post?.coverImage)
  };
}

function normalizeServiceSeoPage(page: any): ServiceSeoPage {
  const contentSections = page?.contentSections && typeof page.contentSections === "object" ? page.contentSections : {};

  return {
    ...page,
    images: normalizeMediaList(page?.images),
    contentSections: {
      ...contentSections,
      heroImage: pickFirstImage(normalizeMediaUrl(contentSections?.heroImage), { allowPlaceholders: false }),
      beforeImage: pickFirstImage(normalizeMediaUrl(contentSections?.beforeImage), { allowPlaceholders: false }),
      afterImage: pickFirstImage(normalizeMediaUrl(contentSections?.afterImage), { allowPlaceholders: false })
    }
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const method = (init?.method || "GET").toUpperCase();
  const isGetRequest = method === "GET";
  const normalizedInit = init as NextFetchInit | undefined;

  const requestInit: NextFetchInit = {
    ...init,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  };

  if (isGetRequest) {
    requestInit.cache = init?.cache ?? "force-cache";
    requestInit.next = {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      ...(normalizedInit?.next || {})
    };
  } else {
    requestInit.cache = "no-store";
  }

  const res = await fetch(`${API_URL}${path}`, requestInit).finally(() => clearTimeout(timeoutId));

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function getServices() {
  try {
    const services = await request<any[]>("/services");
    if (!Array.isArray(services) || services.length === 0) {
      return DEFAULT_SERVICES_FALLBACK.map((service) => normalizeService(service));
    }

    return services.map((service) => normalizeService(service));
  } catch {
    return DEFAULT_SERVICES_FALLBACK.map((service) => normalizeService(service));
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const service = await request<any>(`/services/${slug}`);
    const normalized = normalizeService(service);

    if (process.env.NODE_ENV !== "production") {
      console.log("[service] by-slug", slug, {
        coverImage: normalized?.coverImage || normalized?.imageUrl || null,
        galleryCount: Array.isArray(normalized?.gallery) ? normalized.gallery.length : 0
      });
    }

    return normalized;
  } catch {
    const fallback = DEFAULT_SERVICES_FALLBACK.find((service) => service.slug === slug);
    const normalized = fallback ? normalizeService(fallback) : null;

    if (process.env.NODE_ENV !== "production") {
      console.log("[service] by-slug fallback", slug, {
        coverImage: normalized?.coverImage || normalized?.imageUrl || null,
        galleryCount: Array.isArray(normalized?.gallery) ? normalized.gallery.length : 0
      });
    }

    return normalized;
  }
}

export async function getServiceSeoPageBySlug(slug: string) {
  try {
    const page = await request<any>(`/service-seo/by-slug/${slug}`, {
      next: { revalidate: 60 }
    });
    const normalized = normalizeServiceSeoPage(page);

    if (process.env.NODE_ENV !== "production") {
      console.log("[service-seo] by-slug", slug, {
        imagesCount: normalized.images?.length || 0,
        heroImage: normalized.contentSections?.heroImage || null
      });
    }

    return normalized;
  } catch {
    return null;
  }
}

export async function getServiceSeoPageByServiceSlug(slug: string) {
  try {
    const page = await request<any>(`/service-seo/by-service-slug/${slug}`, {
      next: { revalidate: 60 }
    });
    const normalized = normalizeServiceSeoPage(page);

    if (process.env.NODE_ENV !== "production") {
      console.log("[service-seo] by-service-slug", slug, {
        imagesCount: normalized.images?.length || 0,
        heroImage: normalized.contentSections?.heroImage || null
      });
    }

    return normalized;
  } catch {
    return null;
  }
}

export async function getProjects() {
  try {
    const projects = await request<any[]>("/projects");
    return projects.map((project) => normalizeProject(project));
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const project = await request<any>(`/projects/${slug}`);
    return normalizeProject(project);
  } catch {
    return null;
  }
}

export async function getBlogPosts() {
  try {
    const posts = await request<any[]>("/blog");
    return posts.map((post) => normalizeBlogPost(post));
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const post = await request<any>(`/blog/${slug}`);
    return normalizeBlogPost(post);
  } catch {
    return null;
  }
}

export async function getSettings() {
  try {
    return await request<any>("/settings");
  } catch {
    return null;
  }
}

export async function trackClick(type: "call" | "whatsapp" | "quote", pageUrl: string) {
  await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, pageUrl })
  });
}
