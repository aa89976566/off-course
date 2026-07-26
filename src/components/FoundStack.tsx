"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundStackProps = {
  projects: Project[];
};

const CATEGORY_LABEL: Record<string, string> = {
  "freds-cafe": "Coffee shop",
  "jieshin-tseng": "Artist portfolio",
  "boxing-training": "Boxing coach",
};

/** Card surface themes — kinetic deck palette. */
const CARD_THEME: Record<
  string,
  { bg: string; fg: string; muted: string; accent: string }
> = {
  "freds-cafe": {
    bg: "#FF3829",
    fg: "#ffffff",
    muted: "rgba(255,255,255,0.72)",
    accent: "#ffffff",
  },
  "jieshin-tseng": {
    bg: "#111111",
    fg: "#ffffff",
    muted: "rgba(255,255,255,0.55)",
    accent: "#FF3829",
  },
  "boxing-training": {
    bg: "#ffffff",
    fg: "#111111",
    muted: "rgba(17,17,17,0.5)",
    accent: "#E10600",
  },
};

/**
 * Spring tuned like Awwwards stacked-card sliders
 * (Eliot Besson / Ruixen-style physics — soft settle, no snap).
 */
const STACK_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.85,
};

const META_EASE: Transition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
};

function stackOffset(i: number, index: number, total: number) {
  let d = i - index;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

/**
 * GET FOUND — split stage modeled on Eliot Besson’s Stacked Cards Slider:
 * left rail = sticky project meta; right viewport = 3D overlapping deck.
 * Mobile keeps the same two-column shell (no column stack).
 */
export function FoundStack({ projects }: FoundStackProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const lock = useRef(false);
  const touchY = useRef<number | null>(null);
  const total = projects.length;
  const active = projects[index];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (!total || lock.current) return;
      lock.current = true;
      setIndex((i) => (i + delta + total) % total);
      window.setTimeout(() => {
        lock.current = false;
      }, reduce ? 100 : 420);
    },
    [total, reduce]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [go]);

  if (!active) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#ececec] text-black/50">
        No projects yet.
      </div>
    );
  }

  const category = CATEGORY_LABEL[active.slug] || active.type || "Project";
  const yStep = narrow ? 48 : 88;
  const xStep = narrow ? 6 : 18;
  const zStep = narrow ? 80 : 120;

  return (
    <section
      className="found-stack found-landing relative min-h-svh overflow-x-hidden overflow-y-hidden bg-[#e9e9e9] text-black"
      onTouchStart={(e) => {
        touchY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const y = e.changedTouches[0]?.clientY ?? touchY.current;
        const dy = touchY.current - y;
        touchY.current = null;
        if (Math.abs(dy) < 36) return;
        go(dy > 0 ? 1 : -1);
      }}
    >
      <div
        aria-hidden
        className="found-stack__atmosphere pointer-events-none absolute inset-0"
      />

      <header className="found-stack__header relative z-30 flex items-center justify-between px-3 py-3 sm:px-4 md:px-8 md:py-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-display text-xs uppercase tracking-[0.08em] sm:text-sm md:text-base"
          aria-label="OFF_COURSE home"
        >
          <span>OFF</span>
          <span className="logo-underscore mx-[0.06em]" aria-hidden />
          <span>COURSE</span>
        </Link>
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-black/45 sm:text-[11px]">
          GET FOUND
        </p>
        <p className="font-mono text-[11px] tabular-nums text-black/40 sm:text-xs">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      {/*
        Shell mirrors Eliot Besson stacked-cards composition:
        rail (meta) | viewport (deck) — never collapses to a single column.
      */}
      <div className="found-stack__shell relative z-10 mx-auto grid min-h-[calc(100svh-56px)] max-w-[1240px] items-center px-3 pb-4 sm:px-4 sm:pb-6 md:min-h-[calc(100svh-64px)] md:px-8 md:pb-10">
        <aside className="found-stack__rail relative z-20 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              className="found-stack__meta"
              initial={reduce ? false : { y: 12, opacity: 0.35 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, opacity: 0 }}
              transition={reduce ? { duration: 0 } : META_EASE}
            >
              <p className="found-stack__eyebrow font-mono text-[9px] uppercase tracking-[0.18em] text-black/40 sm:text-[11px] sm:tracking-[0.22em]">
                {category}
              </p>
              <h1 className="found-stack__title mt-1.5 max-w-[12ch] font-display text-[clamp(1.1rem,3.8vw,3.6rem)] uppercase leading-[0.92] tracking-wide sm:mt-3">
                {active.title}
              </h1>
              {active.location && (
                <p className="found-stack__address mt-2 max-w-[16ch] text-[11px] leading-snug text-black/55 sm:mt-4 sm:max-w-xs sm:text-sm sm:leading-relaxed md:text-[15px]">
                  {active.location}
                </p>
              )}

              <div className="found-stack__cta mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href={`/get-found/${active.slug}`}
                  className="found-stack__btn found-stack__btn--primary inline-flex min-h-11 items-center justify-center rounded-md bg-black px-3 text-[10px] font-bold uppercase tracking-wide text-white transition-colors duration-300 hover:bg-[var(--walala-red)] sm:px-4 sm:text-xs"
                >
                  View case
                </Link>
                {active.liveUrl && (
                  <a
                    href={active.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="found-stack__btn found-stack__btn--ghost inline-flex min-h-11 items-center justify-center rounded-md border border-black/20 px-3 text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 hover:border-black sm:px-4 sm:text-xs"
                  >
                    Visit site
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <ul className="found-stack__index mt-5 space-y-0.5 sm:mt-10 sm:space-y-1" aria-label="Project types">
            {projects.map((p, i) => {
              const cat = CATEGORY_LABEL[p.slug] || p.type;
              const on = i === index;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`found-stack__index-item flex min-h-11 w-full items-center gap-2 border-l-2 py-1 pl-2 text-left transition-[color,border-color] duration-300 sm:gap-3 sm:pl-3 ${
                      on
                        ? "border-[var(--walala-red)] text-black"
                        : "border-transparent text-black/30 hover:text-black/60"
                    }`}
                  >
                    <span className="font-mono text-[9px] tabular-nums sm:text-[10px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[9px] uppercase tracking-[0.1em] sm:text-[11px] sm:tracking-[0.14em]">
                      {cat}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="found-stack__hint mt-4 text-[9px] uppercase tracking-[0.12em] text-black/30 sm:mt-8 sm:text-[11px] sm:tracking-[0.14em]">
            Scroll · swipe · ↑↓
          </p>
        </aside>

        <div className="found-stack__viewport relative z-10 flex min-w-0 items-center justify-center">
          <div className="found-stack__perspective relative h-full w-full max-w-[560px]">
            {projects.map((project, i) => {
              const d = stackOffset(i, index, total);
              const abs = Math.abs(d);
              const visible = abs <= 2;
              const theme =
                CARD_THEME[project.slug] || CARD_THEME["jieshin-tseng"];
              const cat = CATEGORY_LABEL[project.slug] || project.type;

              return (
                <motion.button
                  key={project.slug}
                  type="button"
                  tabIndex={d === 0 ? 0 : -1}
                  aria-label={`${project.title}${project.location ? `, ${project.location}` : ""}`}
                  aria-current={d === 0 ? "true" : undefined}
                  onClick={() => {
                    if (d === 0) {
                      if (project.liveUrl) {
                        window.open(
                          project.liveUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } else {
                        router.push(`/get-found/${project.slug}`);
                      }
                      return;
                    }
                    setIndex(i);
                  }}
                  className="found-stack__card absolute left-1/2 top-1/2 origin-center overflow-hidden rounded-[18px] text-left outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-black sm:rounded-[26px]"
                  style={{
                    zIndex: 30 - abs,
                    pointerEvents: visible ? "auto" : "none",
                    backgroundColor: theme.bg,
                    color: theme.fg,
                    boxShadow: "0 28px 70px rgba(0,0,0,0.28)",
                  }}
                  transformTemplate={({
                    x,
                    y,
                    z,
                    rotateX,
                    rotateY,
                    rotateZ,
                    scale,
                  }) =>
                    `translate3d(calc(-50% + ${x ?? 0}), calc(-50% + ${y ?? 0}), ${z ?? 0}) rotateX(${rotateX ?? 0}) rotateY(${rotateY ?? 0}) rotateZ(${rotateZ ?? 0}) scale(${scale ?? 1})`
                  }
                  initial={false}
                  animate={{
                    x: d * xStep,
                    y: d * yStep,
                    z: -abs * zStep,
                    rotateX: 18 + abs * 6,
                    rotateY: d * -8,
                    rotateZ: d * -2,
                    scale: 1 - abs * 0.08,
                    opacity: visible ? 1 - abs * 0.12 : 0,
                    filter:
                      abs > 0
                        ? `blur(${Math.min(abs, 2) * 0.35}px)`
                        : "blur(0px)",
                  }}
                  transition={reduce ? { duration: 0 } : STACK_SPRING}
                >
                  <div className="found-stack__card-inner grid h-[min(34svh,240px)] grid-cols-[1.05fr_0.95fr] sm:h-[min(42svh,320px)] md:h-[360px]">
                    <div className="flex min-w-0 flex-col justify-between p-2.5 sm:p-4 md:p-6">
                      <div className="min-w-0">
                        <p
                          className="font-mono text-[8px] uppercase tracking-[0.16em] sm:text-[10px] sm:tracking-[0.2em]"
                          style={{ color: theme.muted }}
                        >
                          {cat}
                        </p>
                        <p className="mt-1.5 font-display text-[clamp(0.8rem,2.6vw,1.85rem)] uppercase leading-[0.95] tracking-wide sm:mt-3">
                          {project.title}
                        </p>
                      </div>
                      <div className="min-w-0">
                        {project.location && (
                          <p
                            className="text-[9px] leading-snug sm:text-[11px] md:text-xs"
                            style={{ color: theme.muted }}
                          >
                            {project.location}
                          </p>
                        )}
                        <p
                          className="mt-1.5 font-display text-2xl leading-none sm:mt-3 sm:text-4xl md:text-5xl"
                          style={{ color: theme.accent }}
                        >
                          {String(i + 1)}
                        </p>
                      </div>
                    </div>

                    <div className="relative m-2 overflow-hidden rounded-[12px] sm:m-3 sm:rounded-[18px] md:m-4">
                      <Image
                        src={assetPath(project.cover)}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 40vw, 240px"
                        priority={abs === 0}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
