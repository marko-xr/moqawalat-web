import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function resolveApiBaseUrl() {
  const raw = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://moqawalatapi-production.up.railway.app/api").trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_URL = resolveApiBaseUrl();

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

  if (status === 404) {
    return "الخدمة غير موجودة.";
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
    return "حدث خطأ في الخادم أثناء تحديث الخدمة.";
  }

  return "تعذر تحديث الخدمة.";
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();

  const response = await fetch(`${API_URL}/services/${id}`, {
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
        message: payload.message || fallbackMessageByStatus(response.status)
      },
      { status: response.status }
    );
  }

  return NextResponse.json(payload, { status: response.status });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const { id } = await context.params;

  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const payload = await readProxyErrorPayload(response);
    return NextResponse.json(
      {
        ...payload,
        message: payload.message || (response.status === 404 ? "الخدمة غير موجودة." : "تعذر حذف الخدمة.")
      },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true });
}
