import type { ServiceSeoPage } from "@/lib/types";
import { isValidImageUrl, pickFirstImage, sanitizeImageList, toCloudinaryDeliveryUrl } from "@/lib/media";
import { resolveServiceMedia } from "@/lib/service-media-fallback";

function resolveApiBaseUrl() {
  const raw = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_URL = resolveApiBaseUrl();

function resolveApiOrigin() {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
}

const API_ORIGIN = resolveApiOrigin();
const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").trim();
const REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_REVALIDATE_SECONDS = 300;

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

  const trimmed = value.trim();
  const cloudinaryCanonical = toCloudinaryDeliveryUrl(trimmed, { cloudName: CLOUDINARY_CLOUD_NAME });

  if (cloudinaryCanonical) {
    return cloudinaryCanonical;
  }

  if (trimmed.startsWith("/uploads/") && API_ORIGIN) {
    return `${API_ORIGIN}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/") && API_ORIGIN) {
    return `${API_ORIGIN}/${trimmed}`;
  }

  return trimmed;
}

function normalizeMediaList(value: unknown): string[] {
  const normalized = sanitizeImageList(value, { allowPlaceholders: false })
    .map((item) => normalizeMediaUrl(item) || item)
    .filter((item): item is string => isValidImageUrl(item, { allowPlaceholders: false }));

  return Array.from(new Set(normalized));
}

function normalizeService(service: any) {
  const normalized = {
    ...service,
    imageUrl: normalizeMediaUrl(service?.imageUrl),
    coverImage: normalizeMediaUrl(service?.coverImage),
    gallery: normalizeMediaList(service?.gallery)
  };

  return resolveServiceMedia(normalized);
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
      return [];
    }

    return services.map((service) => normalizeService(service));
  } catch {
    return [];
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
    return null;
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
    const normalized = projects.map((project) => normalizeProject(project));

    if (process.env.NODE_ENV !== "production") {
      normalized.forEach((project) => {
        console.log("FRONTEND RECEIVED IMAGES", `project:${project.slug}`, {
          coverImage: project.coverImage || project.afterImage || project.beforeImage || null,
          galleryCount: Array.isArray(project.gallery) ? project.gallery.length : 0
        });
      });
    }

    return normalized;
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const project = await request<any>(`/projects/${slug}`);
    const normalized = normalizeProject(project);

    if (process.env.NODE_ENV !== "production") {
      console.log("FRONTEND RECEIVED IMAGES", `project-by-slug:${slug}`, {
        coverImage: normalized.coverImage || normalized.afterImage || normalized.beforeImage || null,
        galleryCount: Array.isArray(normalized.gallery) ? normalized.gallery.length : 0
      });
    }

    return normalized;
  } catch {
    return null;
  }
}

export async function getBlogPosts() {
  try {
    const posts = await request<any[]>("/blog");
    const normalized = posts.map((post) => normalizeBlogPost(post));

    if (process.env.NODE_ENV !== "production") {
      normalized.forEach((post) => {
        console.log("FRONTEND RECEIVED IMAGES", `blog:${post.slug}`, {
          coverImage: post.coverImage || null
        });
      });
    }

    return normalized;
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const post = await request<any>(`/blog/${slug}`);
    const normalized = normalizeBlogPost(post);

    if (process.env.NODE_ENV !== "production") {
      console.log("FRONTEND RECEIVED IMAGES", `blog-by-slug:${slug}`, {
        coverImage: normalized.coverImage || null
      });
    }

    return normalized;
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
