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

/**
 * GET FOUND — vertical 3D card stack.
 * Scroll / swipe / keys to pick a project; left rail shows name + location.
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
      }, reduce ? 120 : 420);
    },
    [total, reduce]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
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

  const category =
    CATEGORY_LABEL[active.slug] || active.type || "Project";

  return (
    <div
      className="found-landing relative min-h-svh overflow-hidden bg-[#e8e8e8] text-black"
      onTouchStart={(e) => {
        touchY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const y = e.changedTouches[0]?.clientY ?? touchY.current;
        const dy = touchY.current - y;
        touchY.current = null;
        if (Math.abs(dy) < 40) return;
        go(dy > 0 ? 1 : -1);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 60% 45%, rgba(255,255,255,0.85), transparent 70%), linear-gradient(180deg, #f2f2f2, #dedede)",
        }}
      />

      {/* Top bar */}
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

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-64px)] max-w-[1200px] grid-cols-1 items-center gap-6 px-4 pb-8 md:grid-cols-[minmax(240px,0.9fr)_1.4fr] md:gap-10 md:px-8 md:pb-12">
        {/* Left: name + location + category */}
        <div className="relative order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/40">
                {category}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)] uppercase leading-[0.95] tracking-wide text-black">
                {active.title}
              </h1>
              {active.location && (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/55 md:text-base">
                  {active.location}
                </p>
              )}
              {active.summary && (
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-black/45 line-clamp-3">
                  {active.summary.split("\n\n")[0]}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
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
                    className="inline-flex h-10 items-center rounded-md border border-black/20 px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:border-black"
                  >
                    Visit site
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Category rail */}
          <ul className="mt-10 hidden space-y-2 md:block" aria-label="Projects">
            {projects.map((p, i) => {
              const cat = CATEGORY_LABEL[p.slug] || p.type;
              const on = i === index;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`flex w-full items-baseline justify-between gap-3 border-l-2 py-1.5 pl-3 text-left transition ${
                      on
                        ? "border-[var(--walala-red)] text-black"
                        : "border-transparent text-black/35 hover:text-black/70"
                    }`}
                  >
                    <span className="font-display text-[11px] uppercase tracking-[0.12em]">
                      {cat}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 hidden text-[11px] uppercase tracking-[0.14em] text-black/30 md:block">
            Scroll · swipe · ↑↓
          </p>
        </div>

        {/* Right: 3D stack */}
        <div className="relative order-1 flex h-[min(58svh,520px)] items-center justify-center md:order-2 md:h-[min(72svh,640px)]">
          <div
            className="relative h-full w-full max-w-[420px]"
            style={{ perspective: "1400px" }}
          >
            {projects.map((project, i) => {
              const offset = i - index;
              // wrap offset into -floor..floor for circular stack feel
              let d = offset;
              if (d > total / 2) d -= total;
              if (d < -total / 2) d += total;

              const abs = Math.abs(d);
              const visible = abs <= 2;
              const y = d * 72;
              const z = -abs * 90;
              const scale = 1 - abs * 0.07;
              const rotateX = 12 + abs * 4;
              const opacity = visible ? 1 - abs * 0.18 : 0;

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
                        window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                      } else {
                        router.push(`/get-found/${project.slug}`);
                      }
                      return;
                    }
                    setIndex(i);
                  }}
                  className="absolute left-1/2 top-1/2 w-[min(100%,340px)] origin-center overflow-hidden rounded-[22px] border border-black/5 text-left shadow-[0_30px_80px_rgba(0,0,0,0.22)] outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-black md:w-[380px]"
                  style={
                    {
                      transform: `translate(-50%, calc(-50% + ${y}px)) translateZ(${z}px) rotateX(${rotateX}deg) scale(${scale})`,
                      opacity,
                      zIndex: 20 - abs,
                      pointerEvents: visible ? "auto" : "none",
                      backgroundColor: project.accent || "#111",
                      transition: reduce
                        ? "none"
                        : "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease",
                    } as CSSProperties
                  }
                >
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={assetPath(project.cover)}
                      alt={project.title}
                      fill
                      className="object-cover object-top"
                      sizes="380px"
                      priority={abs === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                        {CATEGORY_LABEL[project.slug] || project.type}
                      </p>
                      <p className="mt-1 font-display text-lg uppercase tracking-wide md:text-xl">
                        {project.title}
                      </p>
                      {project.location && (
                        <p className="mt-1 text-xs text-white/75 line-clamp-2">
                          {project.location}
                        </p>
                      )}
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
