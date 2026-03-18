import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <h1 className="text-6xl sm:text-[8rem] font-[family-name:var(--font-rocket-raccoon)]">
        schmooze
      </h1>
      <Link
        href="/submit"
        className="mt-6 rounded-full border-2 border-primary bg-background px-8 py-3 text-base font-semibold transition-opacity hover:opacity-80 sm:mt-8 sm:text-lg"
      >
        HEY YENTA
      </Link>
    </main>
  );
}
