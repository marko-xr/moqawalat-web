import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${API_URL}/analytics/click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
