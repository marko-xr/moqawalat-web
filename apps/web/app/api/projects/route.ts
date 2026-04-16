import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

function normalizeMediaUrl(value?: string | null) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("/uploads/") && API_ORIGIN) {
    return `${API_ORIGIN}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/") && API_ORIGIN) {
    return `${API_ORIGIN}/${trimmed}`;
  }

  return trimmed;
}

function filterItems(items: Array<{ titleAr?: string; slug?: string; locationAr?: string; categoryAr?: string; isPublished?: boolean }>, q: string, published: string) {
  const trimmed = q.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesQuery = trimmed
      ? [item.titleAr, item.slug, item.locationAr, item.categoryAr].some((field) => field?.toLowerCase().includes(trimmed))
      : true;

    const matchesPublished =
      published === "true" ? item.isPublished === true : published === "false" ? item.isPublished === false : true;

    return matchesQuery && matchesPublished;
  });

  return filtered;
}

export async function GET(request: Request) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    const response = await fetch(`${API_URL}/projects`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Failed to load projects" }, { status: response.status });
    }

    const items = (await response.json()) as Array<{
      id: string;
      titleAr: string;
      slug: string;
      locationAr: string;
      categoryAr: string;
      isPublished: boolean;
      coverImage?: string | null;
      beforeImage?: string | null;
      afterImage?: string | null;
      gallery?: string[];
      videoUrl?: string | null;
    }>;

    const normalized = items.map((item) => ({
      ...item,
      coverImage: normalizeMediaUrl(item.coverImage),
      beforeImage: normalizeMediaUrl(item.beforeImage),
      afterImage: normalizeMediaUrl(item.afterImage),
      gallery: Array.isArray(item.gallery) ? item.gallery.map((image) => normalizeMediaUrl(image) || image) : item.gallery,
      videoUrl: normalizeMediaUrl(item.videoUrl)
    }));

    return NextResponse.json(normalized);
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const published = url.searchParams.get("published") || "all";
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const pageSize = Math.max(Number(url.searchParams.get("pageSize") || 10), 1);

  const response = await fetch(`${API_URL}/projects/admin`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Failed to load projects" }, { status: response.status });
  }

  const items = (await response.json()) as Array<{
    id: string;
    titleAr: string;
    slug: string;
    locationAr: string;
    categoryAr: string;
    isPublished: boolean;
  }>;

  const filtered = filterItems(items, q, published);
  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages
  });
}

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  return NextResponse.json(payload, { status: response.status });
}
