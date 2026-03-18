import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function verifyAdminCookie(cookieValue: string | undefined): boolean {
  const adminSecret = process.env.ADMIN_SESSION_SECRET;
  if (!adminSecret || !cookieValue) return false;
  const expected = crypto
    .createHmac("sha256", adminSecret)
    .update("admin_verified")
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieValue),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; toId: string }> },
) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin_verified")?.value;
  if (!verifyAdminCookie(verified)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, toId } = await params;
  if (!id || !toId) {
    return NextResponse.json(
      { error: "Missing from/to submission IDs" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const statusRaw = body?.status;

  let status: "success" | "failure" | null;
  if (statusRaw === null || statusRaw === undefined || statusRaw === "") {
    status = null;
  } else if (statusRaw === "success" || statusRaw === "failure") {
    status = statusRaw;
  } else {
    return NextResponse.json(
      { error: "Invalid status. Expected 'success', 'failure', or null." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();

  if (status === null) {
    const { error } = await supabase
      .from("admin_setup_statuses")
      .delete()
      .eq("from_submission_id", id)
      .eq("to_submission_id", toId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to clear status", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("admin_setup_statuses")
    .upsert(
      {
        from_submission_id: id,
        to_submission_id: toId,
        status,
      },
      {
        onConflict: "from_submission_id,to_submission_id",
      },
    );

  if (error) {
    return NextResponse.json(
      { error: "Failed to save status", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

