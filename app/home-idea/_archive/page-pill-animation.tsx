"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-shmz",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is SHMZ?",
    answer:
      "SHMZ is not just a dating app — it’s an exclusive community club for Jewish people worldwide: events, real community, and intentional matchmaking. You’re among members who’ve been reviewed; intros are handled by humans who know both sides.",
  },
  {
    question: "What does vetting mean — and if I’m in, am I really in?",
    answer:
      "Every application is reviewed; we’re exclusive on purpose, and not everyone is accepted. If you get in, you’re in — full membership, same private room as everyone else: events, community, and matchmaking on the same standard.",
  },
  {
    question: "How does matchmaking work alongside community?",
    answer:
      "Community is where relationships and vibe show up naturally; matchmaking is when we help make a direct intro because there’s a strong fit. Both sit on top of the same vetted member base — same people, different ways to connect.",
  },
  {
    question: "Who is it for?",
    answer:
      "Jewish people (or those deeply tied to the community) who want substance over volume — observant, cultural, secular, or still figuring it out. What unites members is showing up honestly and respecting the room.",
  },
  {
    question: "Is my information private?",
    answer:
      "We treat your story with care. Details are shared on a need-to-know basis for vetting and matchmaking, and we don’t sell your data. You control how much you share.",
  },
  {
    question: "Which cities do you serve?",
    answer:
      "We’re rolling out in select cities and growing. When you apply, tell us where you live — we’ll let you know when we’re active near you.",
  },
  {
    question: "Is there a cost?",
    answer:
      "We’ll share clear pricing before anything is charged. Early members may get special terms — apply to get on the list.",
  },
];

const whyBlocks: {
  numeral: string;
  title: string;
  body: ReactNode;
}[] = [
  {
    numeral: "I",
    title: "More than a dating app",
    body: (
      <>
        <p>You can go on apps. Everyone does.</p>
        <p>
          <span className="font-medium text-white">SHMZ is different.</span>{" "}
          It&apos;s community first — dinners, events, real people in the same
          room.
        </p>
        <p className="text-white/90">
          The introductions just happen to be better.
        </p>
      </>
    ),
  },
  {
    numeral: "II",
    title: "Yenta is a person (shh)",
    body: (
      <>
        <p>No swiping. No algorithm. No &ldquo;you might also like.&rdquo;</p>
        <p>
          Yenta&apos;s real. She&apos;s paying attention. She remembers what you
          said, what you meant, and what you didn&apos;t say.
        </p>
        <p>
          It&apos;s like being set up by that one friend who somehow always gets
          it right — but with better timing and a stronger pitch.
        </p>
      </>
    ),
  },
  {
    numeral: "III",
    title: "An exclusive circle",
    body: (
      <>
        <p>Everyone here is vetted.</p>
        <p>No randoms. No filler. No &ldquo;how did they get in?&rdquo;</p>
        <p>
          If you&apos;re in, you&apos;re surrounded by people you&apos;d
          actually want to meet — at a bar, at a dinner, or across the table
          from you.
        </p>
      </>
    ),
  },
];

type ModalKey = "about" | "faq" | null;

const rotatingWords = ["intros", "events", "matchmaking"] as const;

const pillClasses =
  "inline-flex items-center rounded-full border border-white/25 bg-white/[0.04] px-5 py-1.5 text-white backdrop-blur-sm sm:px-7 sm:py-2";

function RotatingPill() {
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const phantomRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % rotatingWords.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const measure = () => {
      setWidths(
        phantomRefs.current.map((el) =>
          el ? el.getBoundingClientRect().width : 0,
        ),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <>
      <span
        className={`${pillClasses} transition-[width] duration-500 ease-out`}
        style={{
          width: widths[index] ? `${widths[index]}px` : undefined,
        }}
      >
        <span className="relative flex h-[1.1em] w-full items-center justify-center overflow-hidden">
          {rotatingWords.map((word, i) => {
            const prev =
              (index - 1 + rotatingWords.length) % rotatingWords.length;
            const translate =
              i === index ? "0%" : i === prev ? "-110%" : "110%";
            return (
              <span
                key={word}
                aria-hidden={i !== index}
                className="absolute whitespace-nowrap transition-[opacity,transform] duration-500 ease-out"
                style={{
                  opacity: i === index ? 1 : 0,
                  transform: `translateY(${translate})`,
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      </span>
      <span
        aria-hidden
        className="pointer-events-none invisible absolute -left-[9999px] top-0"
      >
        {rotatingWords.map((word, i) => (
          <span
            key={word}
            ref={(el) => {
              phantomRefs.current[i] = el;
            }}
            className={pillClasses}
          >
            {word}
          </span>
        ))}
      </span>
    </>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#530515] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-5 sm:px-9">
          <h2
            className="text-3xl leading-none tracking-[-0.05em] text-white"
          >
            <em className="italic">{title}</em>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>
        <div className="overflow-y-auto px-7 py-7 sm:px-9 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function HomeIdeaPage() {
  const fontVars = `${inter.variable}`;
  const [modal, setModal] = useState<ModalKey>(null);

  return (
    <div
      className={`${fontVars} relative min-h-screen overflow-x-hidden bg-[#530515] text-[#f5f5f4] antialiased tracking-[-0.05em] [font-family:var(--font-shmz),system-ui,sans-serif]`}
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />

      {/* Hero — full viewport, minimal (222.place layout) */}
      <section
        id="top"
        className="relative z-10 flex min-h-screen flex-col"
      >
        {/* Top nav */}
        <header className="relative z-20">
          <nav className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-6 sm:px-10">
            <Link href="#top" aria-label="SHMZ home" className="shrink-0">
              <Image
                src="/as.svg"
                alt="SHMZ"
                width={48}
                height={48}
                className="h-10 w-10 sm:h-12 sm:w-12"
                priority
              />
            </Link>
            <ul className="flex items-center gap-2 sm:gap-3">
              <li>
                <button
                  type="button"
                  onClick={() => setModal("about")}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.03] px-5 py-2.5 text-sm text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06] sm:px-6"
                >
                  about
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setModal("faq")}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.03] px-5 py-2.5 text-sm text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06] sm:px-6"
                >
                  faq
                </button>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* Centered hero */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-12 sm:px-10">
          <h1
            className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center text-[clamp(1.8rem,5.6vw,4.4rem)] leading-[1.1] tracking-[-0.05em] text-white/45"
          >
            <span className="italic">a private club for</span>
            <RotatingPill />
            <span className="italic">with</span>
            <span className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/[0.04] py-1.5 pl-2 pr-5 text-white backdrop-blur-sm sm:pl-2.5 sm:pr-7 sm:py-2">
              <span
                aria-hidden
                className="relative inline-flex h-8 items-center sm:h-10"
              >
                <span className="relative inline-block h-8 w-8 rounded-full border-2 border-[#530515] bg-linear-to-br from-[#d9a89a] to-[#7a3a2d] sm:h-10 sm:w-10" />
                <span className="relative -ml-3 inline-block h-8 w-8 rounded-full border-2 border-[#530515] bg-linear-to-br from-[#e8d8b8] to-[#a0875a] sm:h-10 sm:w-10" />
                <span className="relative -ml-3 inline-block h-8 w-8 rounded-full border-2 border-[#530515] bg-linear-to-br from-[#a0a0cc] to-[#4a4a7a] sm:h-10 sm:w-10" />
              </span>
              the tribe
            </span>
          </h1>

          <div className="mt-16 flex flex-col items-center sm:mt-24">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full bg-[#f5f0dc] px-10 py-4 text-sm font-bold italic uppercase tracking-[-0.05em] text-[#530515] transition-transform active:scale-[0.98] sm:text-base"
            >
              apply now
            </Link>
          </div>
        </div>

        {/* Minimal footer inside hero */}
        <div className="relative z-10 px-6 pb-6 text-center sm:px-10">
          <p className="text-[11px] tracking-[-0.05em] text-white/30">
            <a href="#" className="transition-colors hover:text-white/70">
              privacy policy
            </a>
            <span className="mx-2 text-white/20">|</span>
            <a href="#" className="transition-colors hover:text-white/70">
              terms of service
            </a>
          </p>
        </div>
      </section>

      {/* About modal */}
      <Modal
        open={modal === "about"}
        onClose={() => setModal(null)}
        title="about"
      >
        <p className="mb-8 text-[15px] leading-[1.75] text-white/70">
          An exclusive, private members club for the tribe. Community first —
          events, real people in the same room — with human-led matchmaking on
          top. Three things that make the room feel like the room:
        </p>
        <ul className="space-y-6">
          {whyBlocks.map((block) => (
            <li
              key={block.numeral}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="text-3xl leading-none text-white/30"
                  aria-hidden
                >
                  {block.numeral}
                </span>
                <h3 className="text-xl leading-tight tracking-[-0.05em] text-white">
                  {block.title}
                </h3>
              </div>
              <div className="mt-4 flex flex-col gap-3 text-[0.95rem] leading-[1.7] text-white/70">
                {block.body}
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      {/* FAQ modal */}
      <Modal open={modal === "faq"} onClose={() => setModal(null)} title="faq">
        <div>
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group border-b border-white/15 py-1 last:border-b-0 open:border-white/30"
            >
              <summary className="cursor-pointer list-none py-4 outline-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-6">
                  <span className="text-lg leading-snug tracking-[-0.05em] text-white">
                    {item.question}
                  </span>
                  <span className="mt-1 shrink-0 text-2xl leading-none text-white/40 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="max-w-2xl pb-5 pt-1 text-[0.95rem] leading-[1.75] text-white/70">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Modal>
    </div>
  );
}
