import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <h1 className="mb-4 text-center text-3xl font-[family-name:var(--font-rocket-raccoon)] sm:mb-6 sm:text-5xl">
        Yenta will get to work
      </h1>
      <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-muted-foreground sm:mb-10 sm:max-w-md sm:text-base">
        If we find you a match, you&apos;ll receive a text from us. Your
        information is confidential and only used for this purpose.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:text-base"
      >
        Back to schmooze
      </Link>
    </main>
  );
}
