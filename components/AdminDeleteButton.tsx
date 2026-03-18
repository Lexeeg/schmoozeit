"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDeleteButton({ id, name }: { id: string; name: string }) {
  const [state, setState] = useState<"idle" | "confirm" | "deleting">("idle");
  const [confirmText, setConfirmText] = useState("");
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
    const ok = confirmText.trim().toLowerCase() === "delete";
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-red-300">
            Delete {name}. Type{" "}
            <span className="font-semibold text-white">delete</span> to confirm.
          </span>
          <button
            type="button"
            onClick={() => {
              setState("idle");
              setConfirmText("");
            }}
            className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>

        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete"
          className="w-full rounded-full border border-white/20 bg-black/10 px-3 py-1.5 text-xs text-white placeholder-white/50 outline-none focus:border-red-400"
        />

        <button
          type="button"
          onClick={handleDelete}
          disabled={!ok}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          Confirm delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setConfirmText("");
        setState("confirm");
      }}
      disabled={state === "deleting"}
      className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-red-400 hover:text-red-300 disabled:opacity-50"
    >
      {state === "deleting" ? "Deleting..." : "Delete"}
    </button>
  );
}
