import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#530515]">
      <h1 className="text-[8rem] text-white font-[family-name:var(--font-rocket-raccoon)]">
        schmooze
      </h1>
      <Link
        href="/form"
        className="mt-8 rounded-full border-2 border-white bg-[#530515] px-8 py-3 text-lg font-semibold text-white transition-opacity hover:opacity-80"
      >
        HEY YENTA
      </Link>
    </main>
  );
}
