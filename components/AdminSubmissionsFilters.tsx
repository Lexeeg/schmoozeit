"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPhotoCarousel } from "@/components/AdminPhotoCarousel";
import { AdminDeleteButton } from "@/components/AdminDeleteButton";
import { AdminNotesEditor } from "@/components/AdminNotesEditor";

type SetupStatus = "success" | "failure" | null;

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
  admin_notes: string | null;
  // legacy/global field (not used by the pair-specific lightbox)
  admin_setup_status?: SetupStatus;
  admin_in_progress: boolean | null;
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

function setupStatusBorderClass(status: SetupStatus): string {
  if (status === "success") return "border-2 border-green-400/80";
  if (status === "failure") return "border-2 border-red-900/90";
  return "border-0";
}

function setupStatusBackgroundClass(status: SetupStatus): string {
  if (status === "success") return "bg-green-400/10";
  if (status === "failure") return "bg-red-400/10";
  return "bg-white/5";
}

function setupStatusLabel(status: SetupStatus): string {
  if (status === "success") return "Marked ✓";
  if (status === "failure") return "Marked ✕";
  return "Unmarked";
}

export function AdminSubmissionsFilters({
  submissions,
}: {
  submissions: CardSubmission[];
}) {
  const [datingPref, setDatingPref] = useState<"all" | "Men" | "Women" | "Both">("all");
  const [location, setLocation] = useState<
    "all" | "Los Angeles" | "Sydney" | "New York City" | "Melbourne" | "London" | "Miami"
  >("all");
  const [ageGroup, setAgeGroup] = useState<
    "all" | "18-25" | "25-30" | "30-35" | "35-40"
  >("all");
  const [jewishLevel, setJewishLevel] = useState<string>("all");
  const [longDistance, setLongDistance] = useState<"all" | "Yes" | "No">("all");
  const [notesForId, setNotesForId] = useState<string | null>(null);
  const router = useRouter();
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [setupStatusByToId, setSetupStatusByToId] = useState<
    Record<string, Exclude<SetupStatus, null>>
  >({});
  const [inProgressUpdatingId, setInProgressUpdatingId] = useState<
    string | null
  >(null);
  const [inProgressById, setInProgressById] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const s of submissions) {
      map[s.id] = s.admin_in_progress === true;
    }
    setInProgressById(map);
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (datingPref !== "all") {
        if (s.dating_preferences !== datingPref) return false;
      }

      if (location !== "all") {
        if (s.living_location !== location) return false;
      }

      if (!inAgeGroup(s.age, ageGroup)) return false;

      if (jewishLevel !== "all") {
        if (s.level_of_jewish !== jewishLevel) return false;
      }

      if (longDistance !== "all") {
        if (s.open_to_long_distance !== longDistance) return false;
      }

      return true;
    });
  }, [ageGroup, datingPref, jewishLevel, location, longDistance, submissions]);

  async function loadPairStatuses(fromId: string) {
    const res = await fetch(
      `/api/submissions/${encodeURIComponent(fromId)}/setup-statuses`,
      { credentials: "include" },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.error ||
          `Failed to load setup statuses (HTTP ${res.status}).`,
      );
    }

    // API returns `{ statuses: { [toId]: "success"|"failure" } }`
    return (data?.statuses ?? {}) as Record<string, "success" | "failure">;
  }

  useEffect(() => {
    if (!notesForId) return;
    setStatusError(null);
    setSetupStatusByToId({});
    void (async () => {
      try {
        const map = await loadPairStatuses(notesForId);
        setSetupStatusByToId(map);
      } catch (err) {
        setStatusError(err instanceof Error ? err.message : "Failed to load status.");
      }
    })();
  }, [notesForId]);

  async function handleSetPairStatus(toId: string, status: SetupStatus) {
    if (!notesForId) return;
    setStatusError(null);
    setStatusUpdatingId(toId);
    try {
      const res = await fetch(
        `/api/submissions/${encodeURIComponent(notesForId)}/setup-statuses/${encodeURIComponent(toId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusError(
          data?.details
            ? `${data?.error || "Failed to save status"}: ${data?.details}`
            : data?.error || `Failed to save status (HTTP ${res.status}).`,
        );
        return;
      }

      // Optimistically update then refresh from source of truth.
      setSetupStatusByToId((prev) => {
        const next = { ...prev };
        if (status === null) delete next[toId];
        else next[toId] = status;
        return next;
      });

      // Make sure notes/status are consistent with latest DB.
      router.refresh();
      const map = await loadPairStatuses(notesForId);
      setSetupStatusByToId(map);
    } catch {
      setStatusError("Network error. Please try again.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleSetInProgress(id: string, next: boolean) {
    setStatusError(null);
    setInProgressUpdatingId(id);
    try {
      const res = await fetch(
        `/api/submissions/${encodeURIComponent(id)}/in-progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inProgress: next }),
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Reuse statusError spot in the lightbox for now.
        setStatusError(
          data?.details ||
            data?.error ||
            `Failed to save in progress (HTTP ${res.status}).`,
        );
        return;
      }

      setInProgressById((prev) => ({ ...prev, [id]: next }));
      router.refresh();
    } catch {
      setStatusError("Network error. Please try again.");
    } finally {
      setInProgressUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Interested in
          </label>
          <div className="relative">
            <select
              value={datingPref}
              onChange={(e) =>
                setDatingPref(
                  e.target.value as "all" | "Men" | "Women" | "Both",
                )
              }
              className="w-full appearance-none rounded-2xl border border-white/20 bg-black/20 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="all">No filter</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Both">Both</option>
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Location
          </label>
          <div className="relative">
            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value as
                    | "all"
                    | "Los Angeles"
                    | "Sydney"
                    | "New York City"
                    | "Melbourne"
                    | "London"
                    | "Miami",
                )
              }
              className="w-full appearance-none rounded-2xl border border-white/20 bg-black/20 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="all">No filter</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Sydney">Sydney</option>
              <option value="New York City">New York City</option>
              <option value="Melbourne">Melbourne</option>
              <option value="London">London</option>
              <option value="Miami">Miami</option>
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Age group
          </label>
          <div className="relative">
            <select
              value={ageGroup}
              onChange={(e) =>
                setAgeGroup(
                  e.target.value as
                    | "all"
                    | "18-25"
                    | "25-30"
                    | "30-35"
                    | "35-40",
                )
              }
              className="w-full appearance-none rounded-2xl border border-white/20 bg-black/20 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="all">No filter</option>
              <option value="18-25">18-25</option>
              <option value="25-30">25-30</option>
              <option value="30-35">30-35</option>
              <option value="35-40">35-40</option>
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Level of Jewish
          </label>
          <div className="relative">
            <select
              value={jewishLevel}
              onChange={(e) => setJewishLevel(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/20 bg-black/20 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="all">No filter</option>
              <option value="Fully Observant">Fully Observant</option>
              <option value="Trad + Modern">Trad + Modern</option>
              <option value="Holiday Jew">Holiday Jew</option>
              <option value="Spiritual / Reform">Spiritual / Reform</option>
              <option value="Cultural Jew">Cultural Jew</option>
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
            Long distance
          </label>
          <div className="relative">
            <select
              value={longDistance}
              onChange={(e) =>
                setLongDistance(e.target.value as "all" | "Yes" | "No")
              }
              className="w-full appearance-none rounded-2xl border border-white/20 bg-black/20 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-white/40"
            >
              <option value="all">No filter</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
            >
              <path d="M6 8l4 4 4-4" />
            </svg>
          </div>
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
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-3">
          {filtered.map((submission) => (
            <section
              key={submission.id}
              className={`flex h-full flex-col rounded-2xl bg-black/20 p-3 sm:p-4 border ${
                inProgressById[submission.id]
                  ? "border-white/70"
                  : "border-transparent"
              }`}
            >
              <div
                  className="mb-3 rounded-2xl p-2"
              >
                <AdminPhotoCarousel
                  urls={submission.photoUrls}
                  alt={submission.displayName || "Submission photo"}
                />

                <div className="mb-1">
                  <h2 className="text-base font-semibold sm:text-xl">
                    {submission.displayName || "Unnamed"}
                    {submission.age !== null && (
                      <span>, {submission.age}</span>
                    )}
                  </h2>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-end">
                <AdminDeleteButton
                  id={submission.id}
                  name={submission.displayName || "this submission"}
                />
              </div>

              <div className="flex-1 space-y-1.5 text-xs text-white sm:text-sm">
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

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setNotesForId(submission.id)}
                  className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Notes
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {notesForId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setNotesForId(null);
          }}
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-4 border-[#5a0519] bg-[#f3eadb]">
            {(() => {
              const active = submissions.find((s) => s.id === notesForId);
              if (!active) return null;

              const activeName = active.displayName || "Unnamed";
              const activeAgeLabel =
                active.age !== null ? `, ${active.age}` : "";
              const activeInProgress =
                inProgressById[active.id] ?? active.admin_in_progress === true;

              const matchedPeople = submissions.filter((p) => {
                if (p.id === notesForId) return false;
                const st = setupStatusByToId[p.id] ?? null;
                return st === "success" || st === "failure";
              });

              const renderMatchedTile = (person: CardSubmission) => {
                const st = setupStatusByToId[person.id] ?? null;
                if (st !== "success" && st !== "failure") return null;
                const avatar = person.photoUrls?.[0];
                return (
                  <div
                    key={person.id}
                    className={`flex-none w-[150px] box-border overflow-hidden rounded-xl border border-white/10 bg-[#f3eadb] p-2 ${setupStatusBorderClass(
                      st,
                    )}`}
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-white/5">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={person.displayName || "Person photo"}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full bg-white/5" />
                      )}
                    </div>

                    <p className="mt-2 truncate text-sm font-semibold text-[#530515]">
                      {person.displayName || "Unnamed"}
                    </p>
                    <p className="text-center text-sm font-extrabold">
                      {st === "success" ? (
                        <span className="text-green-700">✓</span>
                      ) : (
                        <span className="text-red-900">✕</span>
                      )}
                    </p>

                    <button
                      type="button"
                      disabled={statusUpdatingId === person.id}
                      onClick={() => void handleSetPairStatus(person.id, null)}
                      className="mt-2 w-full rounded-full border border-red-900/30 bg-white/10 px-2 py-1 text-[11px] font-bold text-[#530515] transition hover:bg-white/20 disabled:opacity-50"
                    >
                      Undo
                    </button>
                  </div>
                );
              };

              const renderDatabaseTile = (person: CardSubmission) => {
                const st = setupStatusByToId[person.id] ?? null;
                const avatar = person.photoUrls?.[0];
                const isSelf = person.id === notesForId;

                const isSuccess = st === "success";
                const isFailure = st === "failure";

                return (
                    <div
                    key={person.id}
                    className={`flex-none w-[200px] snap-start rounded-xl bg-[#530515] p-2 text-left transition ${
                      isSelf ? "opacity-70" : ""
                    } ${setupStatusBorderClass(st)}`}
                  >
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => setNotesForId(person.id)}
                      className="w-full"
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-white/5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={person.displayName || "Person photo"}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/5" />
                        )}
                      </div>

                      <p className="mt-2 truncate text-sm font-semibold text-[#f3eadb]">
                        {person.displayName || "Unnamed"}
                        {person.age !== null ? `, ${person.age}` : ""}
                      </p>
                    </button>

                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        aria-label={`Set success for ${person.displayName || "person"}`}
                        disabled={isSelf || statusUpdatingId === person.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = isSuccess ? null : "success";
                          void handleSetPairStatus(person.id, next);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
                          isSuccess
                            ? "border-green-400 bg-green-400/20 text-green-200"
                            : "border-white/20 bg-transparent text-white/80 hover:bg-white/10"
                        }`}
                      >
                        ✓
                      </button>

                      <button
                        type="button"
                        aria-label={`Set failure for ${person.displayName || "person"}`}
                        disabled={isSelf || statusUpdatingId === person.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = isFailure ? null : "failure";
                          void handleSetPairStatus(person.id, next);
                        }}
                        className={`rounded-full border px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${
                          isFailure
                            ? "border-red-900 bg-red-900/20 text-red-200"
                            : "border-white/20 bg-transparent text-white/80 hover:bg-white/10"
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  <div className="flex items-start justify-between gap-4 bg-[#530515] px-4 py-2">
                    <div>
                      <h3 className="text-3xl font-extrabold leading-none tracking-wide text-[#f3eadb]">
                        {activeName}
                        {activeAgeLabel}
                      </h3>
                    </div>
                    <button
                      type="button"
                      disabled={inProgressUpdatingId === active.id}
                      onClick={() =>
                        void handleSetInProgress(active.id, !activeInProgress)
                      }
                      className={`rounded-full border px-4 py-1 text-sm font-semibold transition ${
                        activeInProgress
                          ? "border-white/80 bg-white/10 text-[#f3eadb]"
                          : "border-white/20 bg-white/5 text-[#f3eadb]/70 hover:bg-white/10"
                      } disabled:opacity-50`}
                    >
                      In progress
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotesForId(null)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-[#f3eadb] hover:bg-white/15"
                    >
                      Close
                    </button>
                  </div>

                  <div className="grid gap-4 p-3 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-2xl border border-red-900/20 bg-[#f3eadb] p-4">
                      <p className="text-xl font-extrabold italic text-[#530515]">
                        Notes:
                      </p>
                      <AdminNotesEditor
                        key={active.id}
                        id={active.id}
                        initialNote={active.admin_notes}
                        textareaRows={4}
                        showLabel={false}
                      />
                    </div>

                    <div className="rounded-2xl border border-red-900/20 bg-[#530515] p-4 text-[#f3eadb] overflow-hidden">
                      <p className="text-xl font-extrabold italic">Set Up Status:</p>

                      {statusError && (
                        <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-100">
                          {statusError}
                        </p>
                      )}

                      <div className="mt-3 rounded-2xl border border-white/10 bg-[#5a0519] p-3">
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                            Matched
                          </p>
                          <p className="text-[11px] text-white/50">
                            {matchedPeople.length}
                          </p>
                        </div>

                        {matchedPeople.length === 0 ? (
                          <p className="mt-2 text-xs text-white/60">
                            No matches yet. Use ✓ / ✕ below.
                          </p>
                        ) : (
                        <div className="mt-3 flex flex-wrap items-start gap-3">
                            {matchedPeople
                              .map(renderMatchedTile)
                              .filter(Boolean)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="rounded-2xl border border-red-900/20 bg-[#f3eadb] p-4">
                      <div className="mb-2 flex items-baseline justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#530515]/70">
                          Suggested matches
                        </p>
                        <p className="text-[11px] text-[#530515]/50">
                          {submissions.filter(
                            (p) =>
                              p.id !== notesForId &&
                              p.living_location === active.living_location &&
                              p.level_of_jewish === active.level_of_jewish,
                          ).length}{" "}
                          of {submissions.length}
                        </p>
                      </div>

                      <div className="overflow-x-auto snap-x snap-mandatory">
                        <div className="flex gap-3 min-w-max">
                          {submissions
                            .filter(
                              (p) =>
                                p.id !== notesForId &&
                                p.living_location === active.living_location &&
                                p.level_of_jewish === active.level_of_jewish,
                            )
                            .map((person) => (
                              <div key={person.id}>{renderDatabaseTile(person)}</div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

