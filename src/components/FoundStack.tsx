"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

/** Card surface themes — matches the uploaded stack reference. */
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
 * GET FOUND — vertical 3D card stack (reference: kinetic deck).
 * Scroll / swipe / keys to pick; left rail shows name + location.
 */
export function FoundStack({ projects }: FoundStackProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const lock = useRef(false);
  const touchY = useRef<number | null>(null);
  const total = projects.length;
  const active = projects[index];

  const go = useCallback(
    (delta: number) => {
      if (!total || lock.current) return;
      lock.current = true;
      setIndex((i) => (i + delta + total) % total);
      window.setTimeout(() => {
        lock.current = false;
      }, reduce ? 120 : 480);
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

  return (
    <div
      className="found-landing relative min-h-svh overflow-hidden bg-[#e9e9e9] text-black"
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
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 58% 48%, #fff 0%, transparent 68%), linear-gradient(180deg, #f4f4f4 0%, #dcdcdc 100%)",
        }}
      />

      <header className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-baseline font-display text-sm uppercase tracking-[0.08em] md:text-base"
          aria-label="OFF_COURSE home"
        >
          <span>OFF</span>
          <span className="logo-underscore mx-[0.06em]" aria-hidden />
          <span>COURSE</span>
        </Link>
        <p className="font-display text-[11px] uppercase tracking-[0.18em] text-black/45">
          GET FOUND
        </p>
        <p className="font-mono text-xs tabular-nums text-black/40">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-64px)] max-w-[1240px] grid-cols-1 items-center gap-4 px-4 pb-8 md:grid-cols-[minmax(220px,0.85fr)_1.5fr] md:gap-8 md:px-8 md:pb-10">
        {/* Left rail — name + location */}
        <div className="relative order-2 md:order-1 md:pl-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              initial={reduce ? false : { y: 14 }}
              animate={{ y: 0 }}
              exit={reduce ? undefined : { y: -10, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-black/40">
                {category}
              </p>
              <h1 className="mt-3 max-w-[12ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] uppercase leading-[0.92] tracking-wide">
                {active.title}
              </h1>
              {active.location && (
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/55 md:text-[15px]">
                  {active.location}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/get-found/${active.slug}`}
                  className="inline-flex h-10 items-center rounded-md bg-black px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[var(--walala-red)]"
                >
                  View case
                </Link>
                {active.liveUrl && (
                  <a
                    href={active.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center rounded-md border border-black/20 px-4 text-xs font-bold uppercase tracking-wide transition hover:border-black"
                  >
                    Visit site
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <ul className="mt-10 space-y-1" aria-label="Project types">
            {projects.map((p, i) => {
              const cat = CATEGORY_LABEL[p.slug] || p.type;
              const on = i === index;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`flex w-full items-baseline gap-3 border-l-2 py-2 pl-3 text-left transition ${
                      on
                        ? "border-[var(--walala-red)] text-black"
                        : "border-transparent text-black/30 hover:text-black/60"
                    }`}
                  >
                    <span className="font-mono text-[10px] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[11px] uppercase tracking-[0.14em]">
                      {cat}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 text-[11px] uppercase tracking-[0.14em] text-black/30">
            Scroll · swipe · ↑↓
          </p>
        </div>

        {/* Kinetic 3D stack */}
        <div className="relative order-1 flex h-[min(56svh,500px)] items-center justify-center md:order-2 md:h-[min(78svh,680px)]">
          <div
            className="relative h-full w-full max-w-[560px]"
            style={{ perspective: "1600px", perspectiveOrigin: "50% 40%" }}
          >
            {projects.map((project, i) => {
              const offset = i - index;
              let d = offset;
              if (d > total / 2) d -= total;
              if (d < -total / 2) d += total;

              const abs = Math.abs(d);
              const visible = abs <= 2;
              const y = d * 88;
              const x = d * 18;
              const z = -abs * 120;
              const scale = 1 - abs * 0.08;
              const rotateX = 18 + abs * 6;
              const rotateY = d * -8;
              const rotateZ = d * -2;
              const opacity = visible ? 1 - abs * 0.12 : 0;
              const theme =
                CARD_THEME[project.slug] || CARD_THEME["jieshin-tseng"];
              const cat = CATEGORY_LABEL[project.slug] || project.type;

              return (
                <button
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
                  className="absolute left-1/2 top-[42%] w-[min(100%,480px)] origin-center overflow-hidden rounded-[26px] text-left shadow-[0_28px_70px_rgba(0,0,0,0.28)] outline-none focus-visible:ring-2 focus-visible:ring-black md:top-1/2"
                  style={
                    {
                      transform: `translate(-50%, calc(-50% + ${y}px)) translateX(${x}px) translateZ(${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                      opacity,
                      zIndex: 30 - abs,
                      pointerEvents: visible ? "auto" : "none",
                      backgroundColor: theme.bg,
                      color: theme.fg,
                      transition: reduce
                        ? "none"
                        : "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease",
                    } as CSSProperties
                  }
                >
                  <div className="grid h-[min(42svh,320px)] grid-cols-[1.05fr_0.95fr] md:h-[360px]">
                    {/* Left: name + location */}
                    <div className="flex flex-col justify-between p-4 md:p-6">
                      <div>
                        <p
                          className="font-mono text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: theme.muted }}
                        >
                          {cat}
                        </p>
                        <p className="mt-3 font-display text-[clamp(1.25rem,2.4vw,1.85rem)] uppercase leading-[0.95] tracking-wide">
                          {project.title}
                        </p>
                      </div>
                      <div>
                        {project.location && (
                          <p
                            className="text-[11px] leading-snug md:text-xs"
                            style={{ color: theme.muted }}
                          >
                            {project.location}
                          </p>
                        )}
                        <p
                          className="mt-3 font-display text-4xl leading-none md:text-5xl"
                          style={{ color: theme.accent }}
                        >
                          {String(i + 1)}
                        </p>
                      </div>
                    </div>

                    {/* Right: project visual */}
                    <div className="relative m-3 overflow-hidden rounded-[18px] md:m-4">
                      <Image
                        src={assetPath(project.cover)}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                        sizes="240px"
                        priority={abs === 0}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
