import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const adminCode = process.env.ADMIN_CODE;
    const adminSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminCode || !adminSecret) {
      console.error("Missing ADMIN_CODE or ADMIN_SESSION_SECRET env vars");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const body = await request.json();
    const code = (body?.code ?? body?.password ?? "").trim();

    // Constant-time comparison to prevent timing attacks
    const codeBuffer = Buffer.from(code);
    const adminBuffer = Buffer.from(adminCode);
    if (
      codeBuffer.length !== adminBuffer.length ||
      !crypto.timingSafeEqual(codeBuffer, adminBuffer)
    ) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    // Sign the cookie value so it can't be forged
    const token = crypto
      .createHmac("sha256", adminSecret)
      .update("admin_verified")
      .digest("hex");

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_verified", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
