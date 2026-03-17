"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#530515] px-4 py-6 text-white">
      <div className="w-full max-w-sm rounded-2xl border-2 border-white p-6 sm:p-8">
        <h1 className="mb-2 text-xl font-[family-name:var(--font-rocket-raccoon)] sm:text-2xl">
          Schmooze Admin
        </h1>
        <p className="mb-6 text-xs text-white/80 sm:text-sm">
          Enter the code to view submissions.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="w-full rounded-full border-2 border-white bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-white/80 sm:px-6 sm:py-3 sm:text-base"
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-red-200">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border-2 border-white bg-white px-6 py-3 font-semibold text-[#530515] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
