"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function formatBirthday(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
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
  // US: 10 digits or 11 starting with 1
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  // AU: 9 digits (61 + 8) or 10 starting with 0 (0 + 9)
  if (digits.length === 9) return true;
  if (digits.length === 10 && digits.startsWith("0")) return true;
  if (digits.length === 11 && digits.startsWith("61")) return true;
  return false;
}

export default function SubmitPage() {
  const [minAge, setMinAge] = useState(19);
  const [maxAge, setMaxAge] = useState(40);
  const [birthday, setBirthday] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    if (isSubmitting) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isSubmitting]);

  return (
    <main className="relative flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#530515] px-3 py-6 sm:px-4 sm:py-8">
      {isSubmitting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          style={{ minHeight: "100dvh" }}
          aria-live="polite"
          aria-busy="true"
          role="status"
        >
          <div className="flex max-w-sm flex-col items-center gap-5 rounded-2xl border-2 border-white bg-[#530515] px-6 py-8 text-white shadow-xl sm:gap-6 sm:px-10">
            <div className="h-10 w-10 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-center font-[family-name:var(--font-rocket-raccoon)] text-lg sm:text-xl">
              Please wait
            </p>
            <p className="text-center text-sm text-white/80">
              Uploading your photos and saving your info…
            </p>
          </div>
        </div>
      )}

      <form
        className="flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border-2 border-white p-4 text-white overscroll-contain sm:gap-6 sm:p-6 md:p-8"
        style={{ maxHeight: "calc(100dvh - 2rem)" }}
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);

          const firstName = (formData.get("firstName") as string)?.trim();
          const lastName = (formData.get("lastName") as string)?.trim();
          const birthdayVal = (formData.get("birthday") as string)?.trim();
          const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
          const photos = formData.getAll("photos") as File[];
          const instagram = (formData.get("instagram") as string)?.trim();
          const livingLocation = (formData.get("livingLocation") as string)?.trim();
          const originallyFrom = (formData.get("originallyFrom") as string)?.trim();
          const hobbies = (formData.get("hobbies") as string)?.trim();
          const job = (formData.get("job") as string)?.trim();
          const levelOfJewish = (formData.get("levelOfJewish") as string)?.trim();
          const openToLongDistance = (formData.get("openToLongDistance") as string)?.trim();

          const newErrors: Record<string, string> = {};
          if (!firstName) newErrors.firstName = "First name is required.";
          if (!lastName) newErrors.lastName = "Last name is required.";
          if (!birthdayVal) newErrors.birthday = "Birthday is required.";
          else if (!isValidBirthday(birthdayVal)) newErrors.birthday = "Enter a valid date (DD/MM/YYYY).";
          if (!phoneNumber) newErrors.phoneNumber = "Phone number is required.";
          else if (!isValidPhone(phoneNumber)) newErrors.phoneNumber = "Enter a valid AU or US phone number.";
          if (!photos.length || photos.every((f) => !f?.size)) newErrors.photos = "Please upload at least one photo.";
          if (!instagram) newErrors.instagram = "Instagram handle is required.";
          if (!livingLocation) newErrors.livingLocation = "Living location is required.";
          if (!originallyFrom) newErrors.originallyFrom = "Originally from is required.";
          if (!hobbies) newErrors.hobbies = "Hobbies / interests are required.";
          if (!job) newErrors.job = "Job / work is required.";
          if (!levelOfJewish) newErrors.levelOfJewish = "Level of Jewish is required.";
          if (!openToLongDistance) newErrors.openToLongDistance = "Please select Yes or No.";

          setErrors(newErrors);
          if (Object.keys(newErrors).length > 0) return;

          setIsSubmitting(true);
          setErrors((e) => ({ ...e, submit: "" }));
          try {
            formData.set("minAge", String(minAge));
            formData.set("maxAge", String(maxAge));

            const res = await fetch("/api/submissions", {
              method: "POST",
              body: formData,
            });

            const data = await res.json().catch(() => ({})) as { error?: string; details?: string };

            if (!res.ok) {
              const msg =
                data?.details ||
                data?.error ||
                (res.status === 500
                  ? "Server error. On the live site, add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then redeploy."
                  : "Something went wrong. Please try again.");
              setErrors({ submit: msg });
              return;
            }

            form.reset();
            setBirthday("");
            router.push("/thanks");
          } catch (err) {
            console.error(err);
            setErrors({
              submit:
                "Network or server error. If this is the live site, check Vercel env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and redeploy.",
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-[family-name:var(--font-rocket-raccoon)] sm:text-4xl">
            Hey Yenta
          </h2>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#530515] transition hover:opacity-90"
          >
            Back
          </Link>
        </div>

        {errors.submit && (
          <p className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-100">
            {errors.submit}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <input
              type="text"
              placeholder="First name *"
              name="firstName"
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-200">{errors.firstName}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last name *"
              name="lastName"
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-200">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <input
              type="text"
              placeholder="Birthday (DD/MM/YYYY) *"
              name="birthday"
              value={birthday}
              onChange={(e) => setBirthday(formatBirthday(e.target.value))}
              inputMode="numeric"
              maxLength={10}
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.birthday && (
              <p className="mt-1 text-xs text-red-200">{errors.birthday}</p>
            )}
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone (AU or US) *"
              name="phoneNumber"
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-200">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wide text-white/80 sm:text-sm">
            Upload two photos of yourself that you love *
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            name="photos"
            required
            className="w-full rounded-2xl border-2 border-dashed border-white/70 bg-transparent px-4 py-3 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#530515] hover:border-white sm:px-6 sm:py-4 sm:text-sm sm:file:px-4 sm:file:py-2 sm:file:text-sm"
          />
          {errors.photos && (
            <p className="text-xs text-red-200">{errors.photos}</p>
          )}
          <p className="text-xs text-white/60">
            Please choose up to two clear photos.
          </p>
        </div>

        <div>
          <input
            type="text"
            placeholder="Instagram handle (e.g. @username) *"
            name="instagram"
            required
            className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
          />
          {errors.instagram && (
            <p className="mt-1 text-xs text-red-200">{errors.instagram}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm uppercase tracking-wide text-white/80">
            Preferred age range
          </label>
          <div className="space-y-2">
            <div className="relative flex h-8 items-center">
              <div
                className="pointer-events-none absolute inset-x-0 mx-1 h-1 rounded-full"
                style={{
                  background: `linear-gradient(to right, rgba(148,163,184,0.7) 0%, rgba(148,163,184,0.7) ${
                    ((minAge - 18) / (40 - 18)) * 100
                  }%, #ffffff ${
                    ((minAge - 18) / (40 - 18)) * 100
                  }%, #ffffff ${
                    ((maxAge - 18) / (40 - 18)) * 100
                  }%, rgba(148,163,184,0.7) ${
                    ((maxAge - 18) / (40 - 18)) * 100
                  }%, rgba(148,163,184,0.7) 100%)`,
                }}
              />
              <input
                type="range"
                min={18}
                max={40}
                value={minAge}
                onChange={(e) =>
                  setMinAge(
                    Math.min(Number(e.target.value), maxAge - 1)
                  )
                }
                className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-runnable-track]:bg-transparent"
              />
              <input
                type="range"
                min={18}
                max={40}
                value={maxAge}
                onChange={(e) =>
                  setMaxAge(
                    Math.max(Number(e.target.value), minAge + 1)
                  )
                }
                className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-runnable-track]:bg-transparent"
              />
            </div>
            <p className="text-sm text-white">
              Current range: {minAge}–{maxAge}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <input
              type="text"
              placeholder="Living location / city *"
              name="livingLocation"
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.livingLocation && (
              <p className="mt-1 text-xs text-red-200">{errors.livingLocation}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Originally from *"
              name="originallyFrom"
              required
              className="w-full rounded-full border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.originallyFrom && (
              <p className="mt-1 text-xs text-red-200">{errors.originallyFrom}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <textarea
              placeholder="Hobbies / interests *"
              rows={3}
              name="hobbies"
              required
              className="w-full rounded-2xl border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.hobbies && (
              <p className="mt-1 text-xs text-red-200">{errors.hobbies}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder="Job / work *"
              rows={3}
              name="job"
              required
              className="w-full rounded-2xl border-2 border-white bg-transparent px-3 py-2.5 text-sm placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            />
            {errors.job && (
              <p className="mt-1 text-xs text-red-200">{errors.job}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm uppercase tracking-wide text-white/80">
              Level of Jewish *
            </label>
            <select
              name="levelOfJewish"
              required
              className="w-full rounded-2xl border-2 border-white bg-[#530515] px-3 py-2.5 text-sm text-white outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base [&>option]:bg-[#530515] [&>option]:text-white"
            >
              <option value="">Select one</option>
              <option value="Fully Observant">Fully Observant</option>
              <option value="Trad + Modern">Trad + Modern</option>
              <option value="Holiday Jew">Holiday Jew</option>
              <option value="Spiritual / Reform">Spiritual / Reform</option>
              <option value="Cultural Jew">Cultural Jew</option>
            </select>
            {errors.levelOfJewish && (
              <p className="mt-1 text-xs text-red-200">{errors.levelOfJewish}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm uppercase tracking-wide text-white/80">
              Open to long distance? *
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-white bg-[#530515] px-3 py-2.5 text-sm text-white has-[:checked]:bg-white has-[:checked]:text-[#530515] sm:py-3 sm:text-base">
                <input
                  type="radio"
                  name="openToLongDistance"
                  value="Yes"
                  required
                  className="sr-only"
                />
                Yes
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-white bg-[#530515] px-3 py-2.5 text-sm text-white has-[:checked]:bg-white has-[:checked]:text-[#530515] sm:py-3 sm:text-base">
                <input
                  type="radio"
                  name="openToLongDistance"
                  value="No"
                  className="sr-only"
                />
                No
              </label>
            </div>
            {errors.openToLongDistance && (
              <p className="mt-1 text-xs text-red-200">{errors.openToLongDistance}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-full border-2 border-white bg-white px-10 py-3 text-base font-semibold text-[#530515] transition-opacity hover:opacity-90 sm:w-auto sm:text-lg"
        >
          SUBMIT
        </button>

        <p className="mt-2 text-sm text-white/80">
          If we find you a match, you&apos;ll receive a text from us. Your
          information is confidential and only used for this purpose.
        </p>
      </form>
    </main>
  );
}

