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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin_verified")?.value;
  if (!verifyAdminCookie(verified)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing from submission ID" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_setup_statuses")
    .select("to_submission_id,status")
    .eq("from_submission_id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load setup statuses", details: error.message },
      { status: 500 },
    );
  }

  const statuses: Record<string, "success" | "failure"> = {};
  for (const row of data ?? []) {
    if (row?.status === "success" || row?.status === "failure") {
      statuses[row.to_submission_id] = row.status;
    }
  }

  return NextResponse.json({ ok: true, statuses });
}

