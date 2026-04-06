import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

type BlogListItem = {
  id: string;
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  seoTitleAr?: string | null;
  seoDescriptionAr?: string | null;
  coverImage?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
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

function filterItems(items: BlogListItem[], q: string, published: string) {
  const trimmed = q.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery = trimmed
      ? [item.titleAr, item.slug, item.excerptAr].some((field) => field?.toLowerCase().includes(trimmed))
      : true;

    const matchesPublished =
      published === "true" ? item.published === true : published === "false" ? item.published === false : true;

    return matchesQuery && matchesPublished;
  });
}

export async function GET(request: Request) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const published = url.searchParams.get("published") || "all";
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const pageSize = Math.max(Number(url.searchParams.get("pageSize") || 10), 1);

  const response = await fetch(`${API_URL}/blog?all=true`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Failed to load blog posts" }, { status: response.status });
  }

  const items = ((await response.json()) as BlogListItem[]).map((item) => ({
    ...item,
    coverImage: normalizeMediaUrl(item.coverImage)
  }));

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

  const response = await fetch(`${API_URL}/blog`, {
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
