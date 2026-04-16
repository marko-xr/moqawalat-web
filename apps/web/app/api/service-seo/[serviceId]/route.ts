import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidImageUrl, pickFirstImage, sanitizeImageList, toCloudinaryDeliveryUrl } from "@/lib/media";

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
