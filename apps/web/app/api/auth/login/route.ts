import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function POST(request: Request) {
  const body = await request.json();
  const requestUrl = new URL(request.url);
  const isLocalHost = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
  const shouldUseSecureCookie = requestUrl.protocol === "https:" && !isLocalHost;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  (await cookies()).set("admin_token", payload.token, {
    httpOnly: false,
    secure: shouldUseSecureCookie,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });

  return NextResponse.json(payload);
}
