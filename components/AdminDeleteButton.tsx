"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDeleteButton({ id, name }: { id: string; name: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "deleting">("idle");
  const router = useRouter();

  async function handleDelete() {
    setState("deleting");
    try {
      const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete. Please try again.");
        setState("idle");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
      setState("idle");
    }
  }

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-300">Delete {name}?</span>
        <button
          onClick={handleDelete}
          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-500"
        >
          Yes
        </button>
        <button
          onClick={() => setState("idle")}
          className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setState("confirm")}
      disabled={state === "deleting"}
      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {state === "deleting" ? "Deleting..." : "Delete"}
    </button>
  );
}
