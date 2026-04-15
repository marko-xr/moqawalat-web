import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function normalizeMediaUrl(value?: string | null) {
  if (!value) {
    return value;
  }

  return value.trim();
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}/leads`, {
      method: "POST",
      body: formData,
      signal: abortController.signal,
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof payload?.message === "string" && payload.message.length > 0
          ? payload.message
          : "تعذر إرسال طلب عرض السعر";

      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected proxy error";
    console.error("POST /api/leads proxy error", message);
    return NextResponse.json({ message: "تعذر الاتصال بخدمة العملاء المحتملين" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const service = (url.searchParams.get("service") || "").trim();
  const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
  const pageSize = Math.max(Number(url.searchParams.get("pageSize") || 10), 1);

  const response = await fetch(`${API_URL}/leads?page=1&pageSize=500`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Failed to load leads" }, { status: response.status });
  }

  const payload = (await response.json()) as {
    items: Array<{
      id: string;
      fullName: string;
      phone: string;
      whatsapp?: string | null;
      city: string;
      serviceType: string;
      message?: string | null;
      locationUrl?: string | null;
      imageUrl?: string | null;
      status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
      crmNotes?: string | null;
      createdAt: string;
    }>;
    total: number;
  };

  const allItems = (payload.items || []).map((lead) => ({
    ...lead,
    imageUrl: normalizeMediaUrl(lead.imageUrl)
  }));
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const filtered = allItems.filter((lead) => {
    const matchesQuery = q
      ? lead.fullName.toLowerCase().includes(q.toLowerCase()) || lead.phone.includes(q)
      : true;

    const matchesService = service ? lead.serviceType === service : true;

    return matchesQuery && matchesService;
  });

  const total = filtered.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const serviceOptions = Array.from(new Set(allItems.map((lead) => lead.serviceType))).filter(Boolean);

  return NextResponse.json({
    items,
    total,
    totalLeads: allItems.length,
    todayLeads: allItems.filter((lead) => new Date(lead.createdAt) >= todayStart).length,
    page: safePage,
    pageSize,
    totalPages,
    serviceOptions
  });
}
