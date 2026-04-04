import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  return NextResponse.json(payload, { status: response.status });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
