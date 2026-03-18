import crypto from "crypto";
import { cookies } from "next/headers";
import { AdminPhotoCarousel } from "@/components/AdminPhotoCarousel";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";
import { AdminLogin } from "@/components/AdminLogin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Submission = {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  phone_number: string | null;
  instagram_url: string | null;
  living_location: string | null;
  originally_from: string | null;
  hobbies: string | null;
  job: string | null;
  level_of_jewish: string | null;
  open_to_long_distance: string | null;
  min_age: number | null;
  max_age: number | null;
  photo_names: string[] | null;
};

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

function calculateAge(birthday: string | null): number | null {
  if (!birthday) return null;

  let day: number, month: number, year: number;
  const parts = birthday.split(/[\/\-]/);
  if (parts.length === 3) {
    [day, month, year] = parts.map((p) => Number(p));
    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
      return null;
    }
  } else {
    const parsed = new Date(birthday);
    if (Number.isNaN(parsed.getTime())) return null;
    day = parsed.getDate();
    month = parsed.getMonth() + 1;
    year = parsed.getFullYear();
  }

  const now = new Date();
  let age = now.getFullYear() - year;
  const hasHadBirthdayThisYear =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day);
  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}

function getPhotoUrl(name: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return "";
  return `${baseUrl}/storage/v1/object/public/submission-photos/${encodeURIComponent(name)}`;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin_verified")?.value;
  if (!verifyAdminCookie(verified)) {
    return <AdminLogin />;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as Submission[];

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#530515] px-3 py-6 text-white sm:px-4 sm:py-8">
      <div className="w-full max-w-6xl">
        <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3 sm:mb-8 sm:gap-4">
          <h1 className="text-2xl font-[family-name:var(--font-rocket-raccoon)] sm:text-3xl">
            Schmooze Admin
          </h1>
          <p className="text-xs text-white/70 sm:text-sm">
            Total submissions: {submissions.length}
          </p>
        </header>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-100">
            Error loading submissions: {error.message}
          </p>
        )}

        {submissions.length === 0 ? (
          <p className="text-sm text-white/70">
            No submissions yet. Once someone fills out the form, they&apos;ll
            appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {submissions.map((submission) => {
              const age = calculateAge(submission.birthday);
              const displayName = [
                submission.first_name,
                submission.last_name,
              ]
                .filter(Boolean)
                .join(" ");

              const photos = submission.photo_names ?? [];
              const photoUrls = photos.map((name) => getPhotoUrl(name));

              return (
                <section
                  key={submission.id}
                  className="rounded-2xl border border-white/20 bg-black/20 p-3 sm:p-4"
                >
                  <AdminPhotoCarousel
                    urls={photoUrls}
                    alt={displayName || "Submission photo"}
                  />

                  <div className="mb-2">
                    <h2 className="text-base font-semibold sm:text-xl">
                      {displayName || "Unnamed"}
                      {age !== null && <span>, {age}</span>}
                    </h2>
                  </div>

                  <div className="mb-3 flex items-center justify-end">
                    <AdminDeleteButton
                      id={submission.id}
                      name={displayName || "this submission"}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-white sm:text-sm">
                    {submission.living_location && (
                      <p>
                        <span className="font-normal">Currently lives in: </span>
                        <span className="font-semibold">{submission.living_location}</span>
                      </p>
                    )}
                    {submission.originally_from && (
                      <p>
                        <span className="font-normal">From: </span>
                        <span className="font-semibold">{submission.originally_from}</span>
                      </p>
                    )}
                    {submission.job && (
                      <p>
                        <span className="font-normal">Job / work: </span>
                        <span className="font-semibold">{submission.job}</span>
                      </p>
                    )}
                    {submission.hobbies && (
                      <p>
                        <span className="font-normal">Hobbies / interests: </span>
                        <span className="font-semibold">{submission.hobbies}</span>
                      </p>
                    )}
                    {submission.level_of_jewish && (
                      <p>
                        <span className="font-normal">Level of Jewish: </span>
                        <span className="font-semibold">{submission.level_of_jewish}</span>
                      </p>
                    )}
                    {submission.open_to_long_distance && (
                      <p>
                        <span className="font-normal">Open to long distance: </span>
                        <span className="font-semibold">{submission.open_to_long_distance}</span>
                      </p>
                    )}
                    {submission.instagram_url && (
                      <p>
                        <span className="font-normal">Instagram: </span>
                        <span className="font-semibold">{submission.instagram_url}</span>
                      </p>
                    )}
                    {submission.min_age !== null &&
                      submission.max_age !== null && (
                        <p>
                          <span className="font-normal">Preferred age range: </span>
                          <span className="font-semibold">{submission.min_age}–{submission.max_age}</span>
                        </p>
                      )}
                    {submission.phone_number && (
                      <p>
                        <span className="font-normal">Phone: </span>
                        <span className="font-semibold">{submission.phone_number}</span>
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

