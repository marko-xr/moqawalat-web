import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.slice(0, 500) : "unknown";
    const context = typeof body.context === "string" ? body.context.slice(0, 100) : "unknown";
    const page = typeof body.page === "string" ? body.page.slice(0, 200) : "";

    console.error(`[image-error] context="${context}" page="${page}" url="${url}"`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
