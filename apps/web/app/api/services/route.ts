import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isValidImageUrl, sanitizeImageList } from "@/lib/media";
import { resolveServiceMedia as resolveServiceMediaFallback } from "@/lib/service-media-fallback";

function resolveApiBaseUrl() {
  const raw = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_URL = resolveApiBaseUrl();
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

type ProxyErrorPayload = {
  message?: string;
  code?: string;
  errors?: Array<{ msg?: string; path?: string; param?: string }>;
};

async function readProxyErrorPayload(response: Response): Promise<ProxyErrorPayload> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as ProxyErrorPayload;
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function fallbackMessageByStatus(status: number) {
  if (status === 401 || status === 403) {
    return "غير مصرح. يرجى تسجيل الدخول مرة أخرى.";
  }

  if (status === 409) {
    return "تم اكتشاف قيمة مكررة. قد يكون رابط الخدمة (slug) مستخدما بالفعل.";
  }

  if (status === 413) {
    return "حجم الملف المرفوع كبير جدا.";
  }

  if (status === 415) {
    return "نوع الملف غير مدعوم.";
  }

  if (status === 422) {
    return "فشل التحقق من البيانات. يرجى مراجعة الحقول المطلوبة.";
  }

  if (status >= 500) {
    return "حدث خطأ في الخادم أثناء حفظ الخدمة.";
  }

  return "تعذر حفظ الخدمة.";
}

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

function filterItems(items: Array<{ titleAr?: string; slug?: string; shortDescAr?: string; isPublished?: boolean }>, q: string, published: string) {
  const trimmed = q.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesQuery = trimmed
      ? [item.titleAr, item.slug, item.shortDescAr].some((field) => field?.toLowerCase().includes(trimmed))
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
    const response = await fetch(`${API_URL}/services`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ message: "تعذر تحميل الخدمات" }, { status: response.status });
    }

    const items = (await response.json()) as Array<{
      id: string;
      titleAr: string;
      slug: string;
      shortDescAr: string;
      isPublished: boolean;
      imageUrl?: string | null;
      coverImage?: string | null;
      gallery?: string[];
      videoUrl?: string | null;
    }>;

    const normalized = items.map((item) =>
      resolveServiceMediaFallback({
        ...item,
        imageUrl: normalizeMediaUrl(item.imageUrl),
        coverImage: normalizeMediaUrl(item.coverImage),
        gallery: normalizeMediaList(item.gallery),
        videoUrl: normalizeMediaUrl(item.videoUrl)
      })
    );

    return NextResponse.json(normalized);
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const published = url.searchParams.get("published") || "all";
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const pageSize = Math.max(Number(url.searchParams.get("pageSize") || 10), 1);

  const response = await fetch(`${API_URL}/services/admin`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return NextResponse.json({ message: "تعذر تحميل الخدمات" }, { status: response.status });
  }

  const items = (await response.json()) as Array<{
    id: string;
    titleAr: string;
    slug: string;
    shortDescAr: string;
    isPublished: boolean;
    imageUrl?: string | null;
    coverImage?: string | null;
    gallery?: string[];
    videoUrl?: string | null;
  }>;

  const normalized = items.map((item) =>
    resolveServiceMediaFallback({
      ...item,
      imageUrl: normalizeMediaUrl(item.imageUrl),
      coverImage: normalizeMediaUrl(item.coverImage),
      gallery: normalizeMediaList(item.gallery),
      videoUrl: normalizeMediaUrl(item.videoUrl)
    })
  );

  const filtered = filterItems(normalized, q, published);
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
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const formData = await request.formData();

  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const payload = await readProxyErrorPayload(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        ...payload,
        message: payload.message || fallbackMessageByStatus(response.status)
      },
      { status: response.status }
    );
  }

  return NextResponse.json(payload, { status: response.status });
}
