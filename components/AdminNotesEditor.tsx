"use client";

import { useEffect, useState } from "react";

export function AdminNotesEditor({
  id,
  initialNote,
}: {
  id: string;
  initialNote: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNote(initialNote ?? "");
  }, [id, initialNote]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/submissions/${encodeURIComponent(id)}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.details || "Failed to save notes.");
        return;
      }
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-white/70">
        Notes
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Try: first impression, vibe, what worked, next steps…"
        className="w-full resize-none rounded-xl border border-black/10 bg-[#f3eadb] px-3 py-2 text-xs text-black outline-none focus:border-black/30 focus:ring-0"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full border border-black/20 bg-white px-4 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt && (
          <span className="text-[11px] text-black/60">Saved {savedAt}</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

