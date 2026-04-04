import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type PatchBody = {
  status?: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  crmNotes?: string;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as PatchBody;

  if (!body.status && typeof body.crmNotes !== "string") {
    return NextResponse.json({ message: "لا توجد بيانات للتحديث" }, { status: 400 });
  }

  const response = await fetch(`${API_URL}/leads/${id}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      { message: payload?.message || "تعذر تحديث بيانات العميل" },
      { status: response.status }
    );
  }

  return NextResponse.json(payload, { status: response.status });
}
