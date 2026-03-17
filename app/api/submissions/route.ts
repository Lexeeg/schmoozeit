import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_LONG_SIDE = 1200; // cap size for admin loading
const SCALE = 0.8; // 20% lower resolution
const JPEG_QUALITY = 82;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string | null;
    const lastName = formData.get("lastName") as string | null;
    const birthday = formData.get("birthday") as string | null;
    const phoneNumber = formData.get("phoneNumber") as string | null;
    const instagram = formData.get("instagram") as string | null;
    const livingLocation = formData.get("livingLocation") as string | null;
    const originallyFrom = formData.get("originallyFrom") as string | null;
    const hobbies = formData.get("hobbies") as string | null;
    const job = formData.get("job") as string | null;
    const levelOfJewish = formData.get("levelOfJewish") as string | null;
    const minAgeRaw = formData.get("minAge") as string | null;
    const maxAgeRaw = formData.get("maxAge") as string | null;

    const minAge = minAgeRaw ? Number(minAgeRaw) : null;
    const maxAge = maxAgeRaw ? Number(maxAgeRaw) : null;

    const photoFiles = formData.getAll("photos") as File[];

    const uploadedPhotoPaths: string[] = [];

    for (const file of photoFiles) {
      if (!file || typeof file === "string" || file.size === 0) continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let outputBuffer: Buffer;
      let ext = "jpg";

      try {
        const image = sharp(buffer);
        const meta = await image.metadata();
        const w = meta.width ?? 0;
        const h = meta.height ?? 0;
        const longSide = Math.max(w, h);
        const targetLong = Math.min(
          Math.round(longSide * SCALE),
          MAX_LONG_SIDE,
        );
        const scale = targetLong / longSide;
        const newW = Math.round(w * scale);
        const newH = Math.round(h * scale);

        outputBuffer = await image
          .resize(newW, newH, { fit: "inside" })
          .jpeg({ quality: JPEG_QUALITY })
          .toBuffer();
      } catch (sharpErr) {
        console.error("Sharp resize error:", sharpErr);
        outputBuffer = buffer;
        ext = file.name.split(".").pop() ?? "jpg";
      }

      const baseName = file.name.replace(/\s+/g, "-").replace(/\.[^.]+$/, "");
      const path = `${Date.now()}-${baseName}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("Photos")
        .upload(path, outputBuffer, {
          contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        continue;
      }

      uploadedPhotoPaths.push(path);
    }

    const { data, error } = await supabaseAdmin
      .from("submissions")
      .insert({
        first_name: firstName ?? null,
        last_name: lastName ?? null,
        birthday: birthday ?? null,
        phone_number: phoneNumber ?? null,
        instagram_url: instagram ?? null,
        living_location: livingLocation ?? null,
        originally_from: originallyFrom ?? null,
        hobbies: hobbies ?? null,
        job: job ?? null,
        level_of_jewish: levelOfJewish ?? null,
        min_age: typeof minAge === "number" ? minAge : null,
        max_age: typeof maxAge === "number" ? maxAge : null,
        photo_names: uploadedPhotoPaths.length > 0 ? uploadedPhotoPaths : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save submission", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, submission: data });
  } catch (err) {
    console.error("Error in POST /api/submissions:", err);
    return NextResponse.json(
      { error: "Unexpected error while saving submission" },
      { status: 500 },
    );
  }
}

