import type { ServiceSeoPage } from "@/lib/types";

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

function normalizeService(service: any) {
  return {
    ...service,
    imageUrl: normalizeMediaUrl(service?.imageUrl),
    coverImage: normalizeMediaUrl(service?.coverImage),
    gallery: Array.isArray(service?.gallery) ? service.gallery.map((item: string) => normalizeMediaUrl(item)) : service?.gallery
  };
}

function normalizeProject(project: any) {
  return {
    ...project,
    beforeImage: normalizeMediaUrl(project?.beforeImage),
    afterImage: normalizeMediaUrl(project?.afterImage),
    coverImage: normalizeMediaUrl(project?.coverImage),
    gallery: Array.isArray(project?.gallery) ? project.gallery.map((item: string) => normalizeMediaUrl(item)) : project?.gallery
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
    images: Array.isArray(page?.images) ? page.images.map((item: string) => normalizeMediaUrl(item) || item) : [],
    contentSections: {
      ...contentSections,
      heroImage: normalizeMediaUrl(contentSections?.heroImage),
      beforeImage: normalizeMediaUrl(contentSections?.beforeImage),
      afterImage: normalizeMediaUrl(contentSections?.afterImage)
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
    return normalizeService(service);
  } catch {
    const fallback = DEFAULT_SERVICES_FALLBACK.find((service) => service.slug === slug);
    return fallback ? normalizeService(fallback) : null;
  }
}

export async function getServiceSeoPageBySlug(slug: string) {
  try {
    const page = await request<any>(`/service-seo/by-slug/${slug}`, {
      next: { revalidate: 60 }
    });
    return normalizeServiceSeoPage(page);
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
