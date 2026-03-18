"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NON_DIGIT = /\D/g;

function sanitize(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")                         // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .trim();
}

function sanitizeInstagram(value: string): string {
  return sanitize(value).replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 30);
}

const SELECT_CLASS =
  "w-full appearance-none rounded-2xl border-2 border-input bg-background bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22white%22 viewBox=%220 0 16 16%22><path d=%22M4.5 6l3.5 4 3.5-4z%22/></svg>')] bg-[length:20px] bg-[position:right_12px_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:px-6 sm:py-3 sm:pr-12 sm:text-base [&>option]:bg-[#3d0410] [&>option]:text-white";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_LONG_SIDE = 1600;

async function compressImage(file: File): Promise<File> {
  // Skip non-image or already small files
  if (!file.type.startsWith("image/") || file.size <= MAX_FILE_SIZE) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const longSide = Math.max(width, height);
  const scale = longSide > MAX_LONG_SIDE ? MAX_LONG_SIDE / longSide : 1;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Try decreasing quality until under 5 MB
  for (const q of [0.85, 0.7, 0.5]) {
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: q });
    if (blob.size <= MAX_FILE_SIZE) {
      return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
    }
  }

  // Last resort: lowest quality
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.3 });
  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}
const MAX_PHOTOS = 1;
const VALID_LOCATIONS = new Set(["Los Angeles", "Sydney"]);

function isValidDate(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function getAge(day: number, month: number, year: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age--;
  return age;
}

function isValidName(value: string): boolean {
  return /^[\p{L}\s'\-.]+$/u.test(value);
}

export default function SubmitPage() {
  const [ageRange, setAgeRange] = useState([19, 40]);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (!isSubmitting) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSubmitting]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (name: string) => sanitize((fd.get(name) as string) ?? "");

    // Assemble birthday as DD/MM/YYYY
    const dayNum = parseInt(birthDay, 10);
    const monthNum = parseInt(birthMonth, 10);
    const yearNum = parseInt(birthYear, 10);
    const birthdayStr =
      birthMonth && birthDay && birthYear
        ? `${String(dayNum).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}/${yearNum}`
        : "";

    // Assemble phone with country code
    const phoneLocal = get("phoneLocal").replace(NON_DIGIT, "");
    const codeDigits = countryCode === "+61" ? "61" : "1";
    const phoneNumber = phoneLocal ? `${codeDigits}${phoneLocal}` : "";

    const fields = {
      firstName: get("firstName"),
      lastName: get("lastName"),
      instagram: sanitizeInstagram((fd.get("instagram") as string) ?? ""),
      livingLocation: get("livingLocation"),
      originallyFrom: get("originallyFrom"),
      hobbies: get("hobbies"),
      job: get("job"),
      levelOfJewish: get("levelOfJewish"),
      openToLongDistance: get("openToLongDistance"),
    };
    const photos = fd.getAll("photos") as File[];

    const errs: Record<string, string> = {};

    // Name validation
    if (!fields.firstName) errs.firstName = "First name is required.";
    else if (!isValidName(fields.firstName)) errs.firstName = "First name contains invalid characters.";
    if (!fields.lastName) errs.lastName = "Last name is required.";
    else if (!isValidName(fields.lastName)) errs.lastName = "Last name contains invalid characters.";

    // Birthday validation
    if (!birthMonth || !birthDay || !birthYear) errs.birthday = "Complete birthday is required.";
    else if (!isValidDate(dayNum, monthNum, yearNum)) errs.birthday = "Enter a valid date.";
    else if (getAge(dayNum, monthNum, yearNum) < 18) errs.birthday = "You must be at least 18 years old.";

    // Phone validation
    if (!phoneLocal) errs.phoneNumber = "Phone number is required.";
    else if (countryCode === "+1" && phoneLocal.length !== 10) errs.phoneNumber = "US number should be 10 digits.";
    else if (countryCode === "+61" && (phoneLocal.length < 9 || phoneLocal.length > 10)) errs.phoneNumber = "AU number should be 9-10 digits.";

    // Photo validation (client-side type/count checks — size handled by compression)
    const validPhotos = photos.filter((f) => f?.size > 0);
    if (!validPhotos.length) errs.photos = "Please upload at least one photo.";
    else if (validPhotos.length > MAX_PHOTOS) errs.photos = `Maximum ${MAX_PHOTOS} photo allowed.`;
    else {
      for (const file of validPhotos) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          errs.photos = `"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, or HEIC.`;
          break;
        }
      }
    }

    // Other fields
    if (!fields.instagram) errs.instagram = "Instagram handle is required.";
    if (!fields.livingLocation) errs.livingLocation = "Living location is required.";
    else if (!VALID_LOCATIONS.has(fields.livingLocation)) errs.livingLocation = "Please select a valid location.";
    if (!fields.originallyFrom) errs.originallyFrom = "Originally from is required.";
    if (!fields.hobbies) errs.hobbies = "Hobbies / interests are required.";
    if (!fields.job) errs.job = "Job / work is required.";
    if (!fields.levelOfJewish) errs.levelOfJewish = "Level of Jewish is required.";
    if (!fields.openToLongDistance) errs.openToLongDistance = "Please select Yes or No.";

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Scroll to the first field with an error
      const firstKey = Object.keys(errs)[0];
      const el = form.querySelector(`[name="${firstKey}"]`) ?? document.getElementById(`field-${firstKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      // Compress photos before sending
      fd.delete("photos");
      for (const photo of validPhotos) {
        const compressed = await compressImage(photo);
        fd.append("photos", compressed);
      }

      // Write sanitized values into FormData before sending
      fd.set("firstName", fields.firstName);
      fd.set("lastName", fields.lastName);
      fd.set("instagram", fields.instagram);
      fd.set("livingLocation", fields.livingLocation);
      fd.set("originallyFrom", fields.originallyFrom);
      fd.set("hobbies", fields.hobbies);
      fd.set("job", fields.job);
      fd.set("birthday", birthdayStr);
      fd.set("phoneNumber", phoneNumber);
      fd.delete("phoneLocal");
      fd.set("minAge", String(ageRange[0]));
      fd.set("maxAge", String(ageRange[1]));

      const res = await fetch("/api/submissions", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: string };

      if (!res.ok) {
        setErrors({ submit: data?.details || data?.error || "Something went wrong. Please try again." });
        return;
      }

      form.reset();
      setBirthMonth("");
      setBirthDay("");
      setBirthYear("");
      router.push("/thanks");
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-6 sm:py-10">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="status" aria-busy="true">
          <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-border bg-background px-8 py-8 shadow-xl">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-center font-[family-name:var(--font-rocket-raccoon)] text-lg">Please wait</p>
            <p className="text-center text-sm text-muted-foreground">Uploading your photos and saving your info...</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="my-auto flex w-full max-w-3xl flex-col gap-4 rounded-2xl border-2 border-border p-5 sm:gap-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-[family-name:var(--font-rocket-raccoon)] sm:text-4xl">Hey Yenta</h2>
          <Link
            href="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back
          </Link>
        </div>

        {errors.submit && (
          <p className="rounded-lg bg-destructive/20 px-4 py-2 text-sm text-destructive">{errors.submit}</p>
        )}

        {/* Name */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Input type="text" placeholder="First name *" name="firstName" maxLength={100} required />
            <FieldError message={errors.firstName} />
          </div>
          <div>
            <Input type="text" placeholder="Last name *" name="lastName" maxLength={100} required />
            <FieldError message={errors.lastName} />
          </div>
        </div>

        {/* Birthday */}
        <div>
          <Label className="mb-2 text-xs uppercase tracking-wide text-muted-foreground sm:text-sm" id="field-birthday">Birthday *</Label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              required
              className={SELECT_CLASS}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Day"
              value={birthDay}
              onChange={(e) => {
                const v = e.target.value.replace(NON_DIGIT, "").slice(0, 2);
                setBirthDay(v);
              }}
              maxLength={2}
              required
              className="text-center"
            />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Year"
              value={birthYear}
              onChange={(e) => {
                const v = e.target.value.replace(NON_DIGIT, "").slice(0, 4);
                setBirthYear(v);
              }}
              maxLength={4}
              required
              className="text-center"
            />
          </div>
          <FieldError message={errors.birthday} />
        </div>

        {/* Phone */}
        <div>
          <Label className="mb-2 text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">Phone number *</Label>
          <div className="flex items-center gap-0 rounded-full border-2 border-input">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="appearance-none rounded-l-full border-r border-input/40 bg-transparent py-2.5 pl-4 pr-7 text-sm font-medium outline-none sm:py-3 sm:pl-6 sm:pr-9 sm:text-base [&>option]:bg-[#3d0410] [&>option]:text-white"
            >
              <option value="+1">+1</option>
              <option value="+61">+61</option>
            </select>
            <input
              type="tel"
              placeholder={countryCode === "+1" ? "(555) 123-4567" : "0412 345 678"}
              name="phoneLocal"
              required
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground outline-none sm:px-4 sm:py-3 sm:text-base"
            />
          </div>
          <FieldError message={errors.phoneNumber} />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground sm:text-sm" id="field-photos">
            Upload a photo of yourself that you love *
          </Label>
          <input
            type="file"
            accept="image/*"
            name="photos"
            required
            className="w-full rounded-2xl border-2 border-dashed border-input/70 bg-transparent px-4 py-3 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:border-input sm:px-6 sm:py-4 sm:text-sm sm:file:px-4 sm:file:py-2 sm:file:text-sm"
          />
          <FieldError message={errors.photos} />
          <p className="text-xs text-muted-foreground">One clear photo. Max 5 MB.</p>
        </div>

        {/* Instagram */}
        <div>
          <Input type="text" placeholder="Instagram handle (e.g. @username) *" name="instagram" maxLength={30} required />
          <FieldError message={errors.instagram} />
        </div>

        {/* Age Range */}
        <div className="space-y-3">
          <Label className="text-sm uppercase tracking-wide text-muted-foreground">Preferred age range</Label>
          <Slider min={18} max={40} value={ageRange} onValueChange={(val) => setAgeRange(val as number[])} />
          <p className="text-sm">
            Current range: {ageRange[0]}–{ageRange[1]}
          </p>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label className="mb-2 text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">Living in *</Label>
            <select name="livingLocation" required className={SELECT_CLASS}>
              <option value="">Select city</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Sydney">Sydney</option>
            </select>
            <FieldError message={errors.livingLocation} />
          </div>
          <div>
            <Label className="mb-2 text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">Originally from *</Label>
            <Input type="text" placeholder="e.g. Melbourne, New York" name="originallyFrom" maxLength={200} required />
            <FieldError message={errors.originallyFrom} />
          </div>
        </div>

        {/* Hobbies & Job */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <Textarea placeholder="Hobbies / interests *" rows={3} name="hobbies" maxLength={2000} required />
            <FieldError message={errors.hobbies} />
          </div>
          <div>
            <Textarea placeholder="Job / work *" rows={3} name="job" maxLength={1000} required />
            <FieldError message={errors.job} />
          </div>
        </div>

        {/* Jewish & Long Distance */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">Level of Jewish *</Label>
            <select
              name="levelOfJewish"
              required
              className={SELECT_CLASS}
            >
              <option value="">Select one</option>
              <option value="Fully Observant">Fully Observant</option>
              <option value="Trad + Modern">Trad + Modern</option>
              <option value="Holiday Jew">Holiday Jew</option>
              <option value="Spiritual / Reform">Spiritual / Reform</option>
              <option value="Cultural Jew">Cultural Jew</option>
            </select>
            <FieldError message={errors.levelOfJewish} />
          </div>
          <div>
            <Label className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">Open to long distance? *</Label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-input bg-background px-3 py-2.5 text-sm transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-foreground/10 sm:py-3 sm:text-base">
                <input type="radio" name="openToLongDistance" value="Yes" required className="sr-only" />
                Yes
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-input bg-background px-3 py-2.5 text-sm transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground hover:bg-foreground/10 sm:py-3 sm:text-base">
                <input type="radio" name="openToLongDistance" value="No" className="sr-only" />
                No
              </label>
            </div>
            <FieldError message={errors.openToLongDistance} />
          </div>
        </div>

        <Button type="submit" className="mt-2 h-auto w-full rounded-full border-2 border-primary px-10 py-3 text-base font-semibold sm:w-auto sm:text-lg">
          SUBMIT
        </Button>

        <p className="text-sm text-muted-foreground">
          If we find you a match, you&apos;ll receive a text from us. Your information is confidential and only used for
          this purpose.
        </p>
      </form>
    </main>
  );
}
