const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_REVALIDATE_SECONDS = 120;
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

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
    return services.map((service) => normalizeService(service));
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const service = await request<any>(`/services/${slug}`);
    return normalizeService(service);
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
