import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "moqawalat-web",
    timestamp: new Date().toISOString()
  });
}
