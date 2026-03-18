import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
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

export async function DELETE(
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
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch submission to get photo paths before deleting
  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("photo_names")
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Delete photos from storage
  const photoNames: string[] = submission.photo_names ?? [];
  if (photoNames.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("submission-photos")
      .remove(photoNames);

    if (storageError) {
      console.error("Failed to delete photos from storage:", storageError);
      // Continue with row deletion even if photo cleanup fails
    }
  }

  // Delete the submission row
  const { error: deleteError } = await supabase
    .from("submissions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Failed to delete submission:", deleteError);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
