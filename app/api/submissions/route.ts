import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_LONG_SIDE = 1200;
const SCALE = 0.8;
const JPEG_QUALITY = 82;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
const MAX_PHOTOS = 1;
const MAX_STRING_LENGTH = 1000;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const VALID_LOCATIONS = new Set([
  "Los Angeles",
  "Sydney",
  "New York City",
  "Melbourne",
]);
const VALID_JEWISH_LEVELS = new Set([
  "Fully Observant",
  "Trad + Modern",
  "Holiday Jew",
  "Spiritual / Reform",
  "Cultural Jew",
]);
const VALID_DATING_PREFERENCES = new Set(["Men", "Women", "Both"]);

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "");
}

function stripControlChars(s: string): string {
  // Remove all control chars except newline and tab
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function sanitizeString(value: string | null, maxLen = MAX_STRING_LENGTH): string | null {
  if (!value) return null;
  const cleaned = stripControlChars(stripHtml(value)).trim().slice(0, maxLen);
  return cleaned || null;
}

function sanitizeInstagram(value: string | null): string | null {
  if (!value) return null;
  // Strip HTML/control chars, remove leading @, lowercase
  let handle = stripControlChars(stripHtml(value)).trim().replace(/^@+/, "").toLowerCase();
  // Only allow valid Instagram characters (letters, numbers, underscores, periods)
  handle = handle.replace(/[^a-z0-9_.]/g, "").slice(0, 30);
  return handle || null;
}

function isValidBirthday(s: string): boolean {
  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match.map(Number);
  if (m < 1 || m > 12) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  if (digits.length === 9) return true;
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 11 && digits.startsWith("61")) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const firstName = sanitizeString(formData.get("firstName") as string | null);
    const lastName = sanitizeString(formData.get("lastName") as string | null);
    const birthday = sanitizeString(formData.get("birthday") as string | null, 10);
    const phoneNumber = sanitizeString(formData.get("phoneNumber") as string | null, 20);
    const instagram = sanitizeInstagram(formData.get("instagram") as string | null);
    const livingLocation = sanitizeString(formData.get("livingLocation") as string | null);
    const originallyFrom = sanitizeString(formData.get("originallyFrom") as string | null);
    const hobbies = sanitizeString(formData.get("hobbies") as string | null, 2000);
    const job = sanitizeString(formData.get("job") as string | null);
    const levelOfJewish = sanitizeString(formData.get("levelOfJewish") as string | null, 50);
    const openToLongDistance = sanitizeString(formData.get("openToLongDistance") as string | null, 10);
    const datingPreference = sanitizeString(formData.get("datingPreference") as string | null, 20);
    const minAgeRaw = formData.get("minAge") as string | null;
    const maxAgeRaw = formData.get("maxAge") as string | null;

    // --- Server-side validation ---
    const errors: string[] = [];
    if (!firstName) errors.push("First name is required");
    if (!lastName) errors.push("Last name is required");
    if (!birthday || !isValidBirthday(birthday)) errors.push("Valid birthday (DD/MM/YYYY) is required");
    if (!phoneNumber || !isValidPhone(phoneNumber)) errors.push("Valid phone number is required");
    if (!instagram) errors.push("Instagram handle is required");
    if (!livingLocation || !VALID_LOCATIONS.has(livingLocation)) errors.push("Valid living location is required");
    if (!originallyFrom) errors.push("Originally from is required");
    if (!hobbies) errors.push("Hobbies are required");
    if (!job) errors.push("Job is required");

    if (!levelOfJewish || !VALID_JEWISH_LEVELS.has(levelOfJewish)) {
      errors.push("Valid level of Jewish is required");
    }
    if (!openToLongDistance || !["Yes", "No"].includes(openToLongDistance)) {
      errors.push("Open to long distance must be Yes or No");
    }
    if (!datingPreference || !VALID_DATING_PREFERENCES.has(datingPreference)) {
      errors.push("Dating preference must be Men, Women, or Both");
    }

    const minAge = minAgeRaw ? Number(minAgeRaw) : null;
    const maxAge = maxAgeRaw ? Number(maxAgeRaw) : null;
    if (minAge !== null && (!Number.isFinite(minAge) || minAge < 18 || minAge > 100)) {
      errors.push("Min age must be between 18 and 100");
    }
    if (maxAge !== null && (!Number.isFinite(maxAge) || maxAge < 18 || maxAge > 100)) {
      errors.push("Max age must be between 18 and 100");
    }

    const photoFiles = formData.getAll("photos") as File[];
    const validPhotos = photoFiles.filter((f) => f && typeof f !== "string" && f.size > 0);
    if (validPhotos.length === 0) errors.push("At least one photo is required");
    if (validPhotos.length > MAX_PHOTOS) errors.push(`Maximum ${MAX_PHOTOS} photos allowed`);

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    // --- Photo upload with validation ---
    const uploadedPhotoPaths: string[] = [];

    for (const file of validPhotos) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File exceeds the 5 MB size limit` },
          { status: 400 },
        );
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `File is not an allowed image type. Use JPEG, PNG, WebP, or HEIC.` },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process with Sharp — reject if it fails (don't upload raw)
      let outputBuffer: Buffer;
      try {
        const image = sharp(buffer).rotate(); // auto-orient from EXIF before resize
        const meta = await image.metadata();
        const w = meta.width ?? 0;
        const h = meta.height ?? 0;
        const longSide = Math.max(w, h);
        const targetLong = Math.min(Math.round(longSide * SCALE), MAX_LONG_SIDE);
        const scale = longSide > 0 ? targetLong / longSide : 1;
        const newW = Math.round(w * scale);
        const newH = Math.round(h * scale);

        outputBuffer = await image
          .resize(newW, newH, { fit: "inside" })
          .jpeg({ quality: JPEG_QUALITY })
          .toBuffer();
      } catch (sharpErr) {
        console.error("Sharp resize error for file:", file.name, sharpErr);
        return NextResponse.json(
          { error: `Could not process an uploaded image. Please upload a valid image file.` },
          { status: 400 },
        );
      }

      // Use random UUID for filename to prevent enumeration
      const fileId = crypto.randomUUID();
      const path = `${fileId}.jpg`;

      const { error: uploadError } = await getSupabaseAdmin().storage
        .from("submission-photos")
        .upload(path, outputBuffer, {
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        continue;
      }

      uploadedPhotoPaths.push(path);
    }

    const { data, error } = await getSupabaseAdmin()
      .from("submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        birthday: birthday,
        phone_number: phoneNumber,
        instagram_url: instagram,
        living_location: livingLocation,
        originally_from: originallyFrom,
        hobbies: hobbies,
        job: job,
        level_of_jewish: levelOfJewish,
        open_to_long_distance: openToLongDistance,
        dating_preferences: datingPreference,
        min_age: typeof minAge === "number" ? minAge : null,
        max_age: typeof maxAge === "number" ? maxAge : null,
        photo_names: uploadedPhotoPaths.length > 0 ? uploadedPhotoPaths : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save submission. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, submission: data });
  } catch (err) {
    console.error("Error in POST /api/submissions:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
