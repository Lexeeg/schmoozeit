"use client";

import { useMemo, useState } from "react";
import { AdminPhotoCarousel } from "@/components/AdminPhotoCarousel";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";

type CardSubmission = {
  id: string;
  created_at: string;
  displayName: string;
  age: number | null;
  photoUrls: string[];
  living_location: string | null;
  originally_from: string | null;
  job: string | null;
  hobbies: string | null;
  level_of_jewish: string | null;
  open_to_long_distance: string | null;
  dating_preferences: string | null;
  instagram_url: string | null;
  min_age: number | null;
  max_age: number | null;
  phone_number: string | null;
};

function inAgeGroup(age: number | null, group: string): boolean {
  if (group === "all") return true;
  if (age === null) return false;

  // Non-overlapping buckets using exclusive lower bound for all except first.
  switch (group) {
    case "18-25":
      return age >= 18 && age <= 25;
    case "25-30":
      return age > 25 && age <= 30;
    case "30-35":
      return age > 30 && age <= 35;
    case "35-40":
      return age > 35 && age <= 40;
    default:
      return true;
  }
}

export function AdminSubmissionsFilters({
  submissions,
}: {
  submissions: CardSubmission[];
}) {
  const [datingPref, setDatingPref] = useState<"all" | "Men" | "Women" | "Both">("all");
  const [location, setLocation] = useState<"all" | "Los Angeles" | "Sydney">("all");
  const [ageGroup, setAgeGroup] = useState<
    "all" | "18-25" | "25-30" | "30-35" | "35-40"
  >("all");

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (datingPref !== "all") {
        if (s.dating_preferences !== datingPref) return false;
      }

      if (location !== "all") {
        if (s.living_location !== location) return false;
      }

      if (!inAgeGroup(s.age, ageGroup)) return false;

      return true;
    });
  }, [ageGroup, datingPref, location, submissions]);

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Dating preference
          </label>
          <select
            value={datingPref}
            onChange={(e) =>
              setDatingPref(e.target.value as "all" | "Men" | "Women" | "Both")
            }
            className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
          >
            <option value="all">No filter</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Both">Both</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Location
          </label>
          <select
            value={location}
            onChange={(e) =>
              setLocation(e.target.value as "all" | "Los Angeles" | "Sydney")
            }
            className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
          >
            <option value="all">No filter</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Sydney">Sydney</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Age group
          </label>
          <select
            value={ageGroup}
            onChange={(e) =>
              setAgeGroup(
                e.target.value as "all" | "18-25" | "25-30" | "30-35" | "35-40",
              )
            }
            className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
          >
            <option value="all">No filter</option>
            <option value="18-25">18-25</option>
            <option value="25-30">25-30</option>
            <option value="30-35">30-35</option>
            <option value="35-40">35-40</option>
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-white/70">
        Showing {filtered.length} of {submissions.length}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-white/70">
          No submissions match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {filtered.map((submission) => (
            <section
              key={submission.id}
              className="rounded-2xl border border-white/20 bg-black/20 p-3 sm:p-4"
            >
              <AdminPhotoCarousel
                urls={submission.photoUrls}
                alt={submission.displayName || "Submission photo"}
              />

              <div className="mb-2">
                <h2 className="text-base font-semibold sm:text-xl">
                  {submission.displayName || "Unnamed"}
                  {submission.age !== null && (
                    <span>, {submission.age}</span>
                  )}
                </h2>
              </div>

              <div className="mb-3 flex items-center justify-end">
                <AdminDeleteButton
                  id={submission.id}
                  name={submission.displayName || "this submission"}
                />
              </div>

              <div className="space-y-1.5 text-xs text-white sm:text-sm">
                {submission.living_location && (
                  <p>
                    <span className="font-normal">Currently lives in: </span>
                    <span className="font-semibold">
                      {submission.living_location}
                    </span>
                  </p>
                )}

                {submission.originally_from && (
                  <p>
                    <span className="font-normal">From: </span>
                    <span className="font-semibold">
                      {submission.originally_from}
                    </span>
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
                    <span className="font-normal">
                      Hobbies / interests:{" "}
                    </span>
                    <span className="font-semibold">
                      {submission.hobbies}
                    </span>
                  </p>
                )}

                {submission.level_of_jewish && (
                  <p>
                    <span className="font-normal">
                      Level of Jewish:{" "}
                    </span>
                    <span className="font-semibold">
                      {submission.level_of_jewish}
                    </span>
                  </p>
                )}

                {submission.open_to_long_distance && (
                  <p>
                    <span className="font-normal">
                      Open to long distance:{" "}
                    </span>
                    <span className="font-semibold">
                      {submission.open_to_long_distance}
                    </span>
                  </p>
                )}

                {submission.dating_preferences && (
                  <p>
                    <span className="font-normal">
                      Dating preferences:{" "}
                    </span>
                    <span className="font-semibold">
                      {submission.dating_preferences}
                    </span>
                  </p>
                )}

                {submission.instagram_url && (
                  <p>
                    <span className="font-normal">Instagram: </span>
                    <span className="font-semibold">
                      {submission.instagram_url}
                    </span>
                  </p>
                )}

                {submission.min_age !== null &&
                  submission.max_age !== null && (
                    <p>
                      <span className="font-normal">
                        Preferred age range:{" "}
                      </span>
                      <span className="font-semibold">
                        {submission.min_age}–{submission.max_age}
                      </span>
                    </p>
                  )}

                {submission.phone_number && (
                  <p>
                    <span className="font-normal">Phone: </span>
                    <span className="font-semibold">
                      {submission.phone_number}
                    </span>
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

