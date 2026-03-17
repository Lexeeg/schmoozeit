import { NextResponse } from "next/server";

const ADMIN_CODE = "HeyYenta2021!";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = (body?.code ?? body?.password ?? "").trim();

    if (code !== ADMIN_CODE) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
