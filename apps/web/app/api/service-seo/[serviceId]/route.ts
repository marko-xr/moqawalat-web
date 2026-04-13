import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidImageUrl, pickFirstImage, sanitizeImageList } from "@/lib/media";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

type ProxyErrorPayload = {
  message?: string;
  code?: string;
  errors?: Array<{ msg?: string; path?: string; param?: string }>;
};

const SEO_PUBLIC_PATHS = [
  "/roof-insulation-dammam",
  "/gypsum-decorations-dammam",
  "/metal-works-hangars-pergolas-dammam",
  "/painting-services-dammam",
  "/epoxy-flooring-dammam",
  "/iron-works-shades-screens-dammam"
];

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

function normalizeSeoPayload(payload: any) {
  const contentSections = payload?.seoPage?.contentSections && typeof payload.seoPage.contentSections === "object"
    ? payload.seoPage.contentSections
    : {};

  return {
    ...payload,
    service: {
      ...payload?.service,
      imageUrl: normalizeMediaUrl(payload?.service?.imageUrl),
      coverImage: normalizeMediaUrl(payload?.service?.coverImage),
      gallery: normalizeMediaList(payload?.service?.gallery)
    },
    seoPage: {
      ...payload?.seoPage,
      images: normalizeMediaList(payload?.seoPage?.images),
      contentSections: {
        ...contentSections,
        heroImage: pickFirstImage(normalizeMediaUrl(contentSections?.heroImage), { allowPlaceholders: false }),
        beforeImage: pickFirstImage(normalizeMediaUrl(contentSections?.beforeImage), { allowPlaceholders: false }),
        afterImage: pickFirstImage(normalizeMediaUrl(contentSections?.afterImage), { allowPlaceholders: false })
      }
    }
  };
}

export async function GET(_request: Request, context: { params: Promise<{ serviceId: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const { serviceId } = await context.params;

  const response = await fetch(`${API_URL}/service-seo/admin/service/${serviceId}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = await readProxyErrorPayload(response);

  if (!response.ok) {
    return NextResponse.json(
      {
        ...payload,
        message: payload.message || (response.status === 404 ? "الخدمة غير موجودة." : "تعذر تحميل صفحة SEO.")
      },
      { status: response.status }
    );
  }

  return NextResponse.json(normalizeSeoPayload(payload), { status: response.status });
}

export async function PUT(request: Request, context: { params: Promise<{ serviceId: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const { serviceId } = await context.params;
  const formData = await request.formData();

  const response = await fetch(`${API_URL}/service-seo/admin/service/${serviceId}`, {
    method: "PUT",
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
        message: payload.message || "تعذر حفظ صفحة SEO."
      },
      { status: response.status }
    );
  }

  // Clear ISR caches so admin updates appear immediately on public SEO pages.
  SEO_PUBLIC_PATHS.forEach((path) => revalidatePath(path));

  const returnedSlug = String((payload as any)?.seoPage?.slug || "").trim();
  if (returnedSlug) {
    revalidatePath(`/${returnedSlug}`);
  }

  const returnedServiceSlug = String((payload as any)?.service?.slug || "").trim();
  if (returnedServiceSlug) {
    revalidatePath(`/services/${returnedServiceSlug}`);
  }

  return NextResponse.json(payload, { status: response.status });
}
