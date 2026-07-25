"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundLandingProps = {
  projects: Project[];
};

type CardTilt = {
  tilt: string;
  zIndex?: number;
};

const TILTS: CardTilt[] = [
  { tilt: "rotateY(-18deg) rotateX(8deg) translateY(12px)" },
  { tilt: "scale(1.06) translateY(-4px)", zIndex: 10 },
  { tilt: "rotateY(18deg) rotateX(8deg) translateY(12px)" },
];

/**
 * GET FOUND destination — SaaS landing with real project website cards.
 */
export function FoundLanding({ projects }: FoundLandingProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const cards = projects.slice(0, 3);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    router.push(trimmed ? `/start?email=${encodeURIComponent(trimmed)}` : "/start");
  };

  return (
    <div className="found-landing relative min-h-svh overflow-hidden bg-[#2a2b2e] text-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,255,255,0.06), transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto flex h-svh max-w-[1280px] items-stretch px-3 py-3 md:px-5 md:py-4">
        <div className="found-landing-stage flex w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.45)] ring-1 ring-black/10 md:rounded-[28px]">
          <nav className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
            <Link
              href="/"
              className="inline-flex items-baseline font-display text-sm uppercase tracking-[0.08em] md:text-base"
              aria-label="OFF_COURSE home"
            >
              <span>OFF</span>
              <span className="logo-underscore mx-[0.06em]" aria-hidden />
              <span>COURSE</span>
            </Link>

            <ul className="hidden items-center gap-6 text-[13px] text-[#5c6370] md:flex">
              <li>
                <span className="font-medium text-black">Get Found</span>
              </li>
              <li>
                <Link href="/projects" className="hover:text-black">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-black">
                  Company
                </Link>
              </li>
              <li>
                <Link href="/start" className="hover:text-black">
                  Pricing
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href="/about"
                className="hidden rounded-md border border-[#d8dbe2] px-3.5 py-2 text-xs font-semibold text-[#1a1d26] transition hover:border-black sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/start"
                className="inline-flex rounded-md bg-[#12141a] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--walala-red)]"
              >
                Book a demo
              </Link>
            </div>
          </nav>

          <section className="relative flex min-h-0 flex-1 flex-col items-center px-5 pb-0 pt-5 text-center md:px-10 md:pt-8">
            <p className="font-display text-[clamp(1.35rem,3.2vw,1.9rem)] uppercase tracking-[0.08em] text-[#12141a]">
              GET FOUND
            </p>

            <h1 className="mt-2 max-w-[16ch] font-display text-[clamp(2.1rem,5.4vw,3.75rem)] leading-[0.95] tracking-tight text-[#12141a]">
              Collapse the stack
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5c6370] md:mt-4 md:text-base">
              Brands that get found need systems that stay found — websites,
              booking, and platforms that give time and control back to the
              people running the work.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-5 flex w-full max-w-md shrink-0 overflow-hidden rounded-md border border-[#d8dbe2] bg-white shadow-[0_8px_30px_rgba(18,20,26,0.06)] md:mt-6"
            >
              <label className="sr-only" htmlFor="found-email">
                Work email
              </label>
              <input
                id="found-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#12141a] outline-none placeholder:text-[#9aa1ad]"
              />
              <button
                type="submit"
                className="shrink-0 bg-[#12141a] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[var(--walala-red)] md:px-5"
              >
                Book a demo
              </button>
            </form>

            <div className="relative mt-auto w-full max-w-4xl shrink-0 px-2 pb-5 pt-4 md:pb-7 md:pt-6">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[8%] h-[95%] w-[92%] -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(72,72,237,0.22), rgba(255,56,41,0.12), transparent 68%)",
                }}
              />

              <div
                className="found-panels relative mx-auto grid h-[150px] max-w-3xl grid-cols-3 items-end gap-2 px-1 sm:h-[180px] sm:gap-3 md:h-[210px]"
                style={{ perspective: "1200px" }}
              >
                {cards.map((project, i) => (
                  <ProjectPanel
                    key={project.slug}
                    project={project}
                    tilt={TILTS[i]?.tilt ?? "none"}
                    zIndex={TILTS[i]?.zIndex}
                    showCursor={i === 0}
                    reduce={!!reduce}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProjectPanel({
  project,
  tilt,
  zIndex,
  showCursor,
  reduce,
}: {
  project: Project;
  tilt: string;
  zIndex?: number;
  showCursor?: boolean;
  reduce: boolean;
}) {
  const href = project.liveUrl || `/get-found/${project.slug}`;
  const external = Boolean(project.liveUrl);

  return (
    <div className="relative h-[92%]" style={{ zIndex, perspective: "800px" }}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={`Open ${project.title}`}
        className="group relative block h-full overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(18,20,26,0.28)] ring-1 ring-black/10 transition duration-300 hover:ring-black/25"
        style={
          {
            transform: tilt,
            transformOrigin: "bottom center",
            transformStyle: "preserve-3d",
          } as CSSProperties
        }
      >
        <div className="absolute inset-0">
          <Image
            src={assetPath(project.cover)}
            alt={project.title}
            fill
            className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 33vw, 280px"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-left text-white md:p-3">
          <p className="truncate font-display text-[10px] uppercase tracking-[0.08em] md:text-[11px]">
            {project.title}
          </p>
          <p className="mt-0.5 truncate text-[9px] text-white/75 md:text-[10px]">
            {project.type}
          </p>
        </div>
        {showCursor && <Cursor reduce={reduce} />}
      </a>
    </div>
  );
}

function Cursor({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-[34%] right-[16%] z-20"
      animate={
        reduce
          ? undefined
          : {
              x: [0, 10, -4, 0],
              y: [0, -8, 4, 0],
            }
      }
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 3l14 8.5-6.2 1.6L9.5 21 4 3z"
          fill="white"
          stroke="#12141a"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
