import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <h1 className="mb-6 text-center text-4xl font-[family-name:var(--font-rocket-raccoon)]">
        Yenta will get to work
      </h1>
      <p className="mb-10 max-w-md text-center text-sm text-muted-foreground">
        If we find you a match, you&apos;ll receive a text from us. Your
        information is confidential and only used for this purpose.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Back to schmooze
      </Link>
    </main>
  );
}
