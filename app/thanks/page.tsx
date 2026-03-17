import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#530515] px-4">
      <h1 className="mb-6 text-center text-4xl text-white font-[family-name:var(--font-rocket-raccoon)]">
        Yenta will get to work
      </h1>
      <p className="mb-10 max-w-md text-center text-sm text-white/80">
        If we find you a match, you&apos;ll receive a text from us. Your
        information is confidential and only used for this purpose.
      </p>
      <Link
        href="/"
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#530515] transition hover:opacity-90"
      >
        Back to shmooze
      </Link>
    </main>
  );
}

