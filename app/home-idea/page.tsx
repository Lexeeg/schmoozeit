"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-shmz",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const rocket = localFont({
  src: "./fonts/rocket-raccoon.otf",
  variable: "--font-rocket",
  display: "swap",
});

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "What is SHMZ?",
    answer: (
      <>
        <p>SHMZ isn&apos;t just a dating app. Relax…</p>
        <p>
          It&apos;s an exclusive community club for the Jews — events, real
          people, and introductions that actually make sense.
        </p>
      </>
    ),
  },
  {
    question: "What does ‘vetting’ mean?",
    answer: (
      <>
        <p>We&apos;re selective. On purpose.</p>
        <p>
          If you fit in with the crowd, you&apos;re in.
          <br />
          If not yet — it might just be timing.
        </p>
        <p>We keep the room tight so it stays good.</p>
        <p>
          And once you&apos;re in?
          <br />
          You&apos;re fully in.
        </p>
      </>
    ),
  },
  {
    question: "How does matchmaking work alongside community?",
    answer: (
      <>
        <p>
          The community is where the vibe happens. Events, introductions and
          eventually… much more. You don&apos;t have to be single for this.
        </p>
        <p>
          Matchmaking is when Yenta steps in and goes looking for the right
          person to introduce you to. It&apos;s quiet, off to the side and
          super intentional.
        </p>
      </>
    ),
  },
  {
    question: "What makes matchmaking unique?",
    answer: (
      <>
        <p>You&apos;re tired. We know.</p>
        <p>
          Swiping, bad dates, splitting checks with people you&apos;d never see
          again — enough.
        </p>
        <p>Enter Yenta.</p>
        <p>
          She does the work, makes the calls, and occasionally overrides your
          questionable taste.
          <br />
          Because let&apos;s be honest… you don&apos;t always pick well.
        </p>
        <p>
          No public profiles. No cringe bios.
          <br />
          She pitches you properly — to the right people only.
        </p>
        <p>
          And if you say no?
          <br />
          You&apos;re explaining yourself.
          <br />
          This isn&apos;t random — it&apos;s intentional.
        </p>
      </>
    ),
  },
  {
    question: "How does matchmaking work?",
    answer: (
      <>
        <p>You set up your dating prefs… and then stop trying so hard.</p>
        <p>Yenta&apos;s got it.</p>
        <p>
          She finds someone, taps you on the shoulder,
          <br />
          and if you both say yes — you&apos;re in.
        </p>
        <p>
          But — no juggling five people.
          <br />
          One match at a time.
        </p>
        <p>You actually have to try. Crazy.</p>
        <p>
          You can message Yenta on the side —
          <br />
          tell her how it went, what you liked, what was a no.
        </p>
        <p>
          She takes notes.
          <br />
          And she will use them.
        </p>
      </>
    ),
  },
  {
    question: "Has it worked before?",
    answer: (
      <>
        <p>Yes. More than we should admit.</p>
        <p>
          Couples, engagements, relationships that actually lasted —
          <br />
          even across continents.
        </p>
        <p>
          Yenta knows what she&apos;s doing.
          <br />
          You just have to stop overthinking it.
        </p>
      </>
    ),
  },
  {
    question: "Does it cost?",
    answer: (
      <>
        <p>Getting accepted is free. Mazel.</p>
        <p>
          If you&apos;re happy to sit back and let things happen at an easy
          pace, stay free.
        </p>
        <p>
          If you want Yenta calling you, chasing you, and actively finding your
          person?
        </p>
        <p>That&apos;s Schmoozer territory.</p>
      </>
    ),
  },
];

const whyBlocks: {
  numeral: string;
  title: string;
  body: ReactNode;
}[] = [
  {
    numeral: "I",
    title: "Not a dating app",
    body: (
      <p>
        We get it — you taken folks also want community. You&apos;re having
        fomo, and we&apos;re all friends here…
      </p>
    ),
  },
  {
    numeral: "II",
    title: "You can’t sit with us.",
    body: (
      <p>
        We hate to say it out loud, but… Not everyone gets in, but if
        you&apos;re in, you&apos;re in.
      </p>
    ),
  },
  {
    numeral: "III",
    title: "Uh… did we just make dating cool again?",
    body: (
      <p>
        Dead chats. Bad dates. Endless swiping. Say goodbye to all that
        cr*p, and say hello to Yenta. Your new best friend who is actively
        looking out for you and finding you &lsquo;the one&rsquo;, your
        match, without the publicity of everyone seeing your profile. She
        keeps everything hush and trust us when we say, everyone is smoking
        hot. And yes… Yenta is an actual human person, no AI, no algorithm,
        you have a friend.
      </p>
    ),
  },
];

type ModalKey = "about" | "faq" | null;

const rotatingWords = ["intros", "events", "community", "matchmaking"] as const;

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => {
        setPrev(i);
        return (i + 1) % rotatingWords.length;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative flex h-[1em] w-full items-center justify-center overflow-hidden text-[clamp(2.24rem,9.8vw,7rem)] uppercase leading-none tracking-[-0.04em] text-white [font-family:var(--font-rocket),sans-serif]"
    >
      {prev !== null && prev !== index && (
        <span
          key={`out-${index}`}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
          style={{
            animation: "shmzWordOut 600ms cubic-bezier(0.22,1,0.36,1) both",
          }}
          aria-hidden
        >
          {rotatingWords[prev]}
        </span>
      )}
      <span
        key={`in-${index}`}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        style={{
          animation: "shmzWordIn 600ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {rotatingWords[index]}
      </span>
    </div>
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
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white bg-[#530515] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
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
  const fontVars = `${inter.variable} ${rocket.variable}`;
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
                  className="inline-flex items-center rounded-full border border-white bg-white/[0.03] px-5 py-2.5 text-sm font-bold uppercase text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06] sm:px-6"
                >
                  about
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setModal("faq")}
                  className="inline-flex items-center rounded-full border border-white bg-white/[0.03] px-5 py-2.5 text-sm font-bold uppercase text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06] sm:px-6"
                >
                  faq
                </button>
              </li>
              <li>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white/[0.03] text-white/85 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/[0.06]"
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
          <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
            <p
              className="text-xl font-semibold tracking-[-0.04em] text-white/50 sm:text-2xl lg:text-3xl"
              style={{ transform: "skewX(-8deg)" }}
            >
              An exclusive, private club for
            </p>
            <div className="my-4 w-full sm:my-6">
              <RotatingWord />
            </div>
            <p
              className="text-lg font-semibold tracking-[-0.04em] text-white/50 sm:text-xl lg:text-2xl"
              style={{ transform: "skewX(-8deg)" }}
            >
              for &lsquo;The Tribe&rsquo;
            </p>
          </div>

          <div className="mt-16 flex flex-col items-center sm:mt-24">
            <Link
              href="/submit"
              className="inline-flex items-center rounded-full bg-white px-10 py-4 text-sm font-bold italic uppercase tracking-[-0.05em] text-[#530515] transition-transform active:scale-[0.98] sm:text-base"
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
          An exclusive, private members club for the jews — for community,
          events and matchmaking.
        </p>
        <ul className="space-y-6">
          {whyBlocks.map((block) => (
            <li
              key={block.numeral}
              className="rounded-lg border border-white bg-white/[0.02] p-6"
            >
              <h3 className="text-xl leading-tight tracking-[-0.05em] text-white">
                {block.title}
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-[0.95rem] leading-[1.7] text-white/70">
                {block.body}
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      <style>{`
        @keyframes shmzWordIn {
          0% { opacity: 0; transform: translateY(100%); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shmzWordOut {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-100%); }
        }
      `}</style>

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
              <div className="max-w-2xl space-y-4 pb-5 pt-1 text-[0.95rem] leading-[1.75] text-white/70">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </Modal>
    </div>
  );
}
