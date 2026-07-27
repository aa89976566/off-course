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

/** Papercuts poster art — category type + illustration + project title. */
const POSTER_ART: Record<
  string,
  { categoryType: string; figure: string; titleType: string }
> = {
  "freds-cafe": {
    categoryType: "/media/found/type-coffee.webp",
    figure: "/media/found/poster-coffee.webp",
    titleType: "/media/found/type-freds.webp",
  },
  "jieshin-tseng": {
    categoryType: "/media/found/type-artist.webp",
    figure: "/media/found/poster-artist.webp",
    titleType: "/media/found/type-jieshin.webp",
  },
  "boxing-training": {
    categoryType: "/media/found/type-boxing.webp",
    figure: "/media/found/poster-boxing.webp",
    titleType: "/media/found/type-training.webp",
  },
};

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

/** Soft spring — calm settle, not chaotic. */
const STACK_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.85,
};

const META_EASE: Transition = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1],
};

function stackOffset(i: number, index: number, total: number) {
  let d = i - index;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

/**
 * GET FOUND — calm two-zone composition:
 * left = papercuts poster intro; right = one hero card + quiet peeks.
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
      }, reduce ? 100 : 380);
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
  const poster = POSTER_ART[active.slug];
  // Disciplined peeks — neighbors barely show, hero stays calm
  const yStep = narrow ? 28 : 36;
  const xStep = narrow ? 10 : 14;

  return (
    <section
      className="found-stack found-landing relative h-svh min-h-svh overflow-hidden bg-[#ebebeb] text-black"
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

      <header className="found-stack__header relative z-40 flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
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

      <div className="found-stack__shell">
        {/* Left — papercuts poster intro only */}
        <aside className="found-stack__intro">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              className="found-stack__poster"
              initial={reduce ? false : { y: 10, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: -8, opacity: 0 }}
              transition={reduce ? { duration: 0 } : META_EASE}
            >
              {poster ? (
                <>
                  <div className="found-stack__poster-type">
                    <Image
                      src={assetPath(poster.categoryType)}
                      alt={category}
                      width={420}
                      height={420}
                      className="found-stack__poster-img"
                      priority
                    />
                  </div>
                  <div className="found-stack__poster-figure">
                    <Image
                      src={assetPath(poster.figure)}
                      alt=""
                      width={420}
                      height={560}
                      className="found-stack__poster-img"
                      priority
                    />
                  </div>
                  <h1 className="found-stack__poster-title">
                    <span className="sr-only">{active.title}</span>
                    <Image
                      src={assetPath(poster.titleType)}
                      alt={active.title}
                      width={480}
                      height={360}
                      className="found-stack__poster-img"
                      priority
                    />
                  </h1>
                </>
              ) : (
                <>
                  <p className="found-stack__eyebrow">{category}</p>
                  <h1 className="found-stack__title">{active.title}</h1>
                </>
              )}
              {active.location && (
                <p className="found-stack__address">{active.location}</p>
              )}
              <div className="found-stack__cta">
                <Link
                  href={`/get-found/${active.slug}`}
                  className="found-stack__btn found-stack__btn--primary"
                >
                  View case
                </Link>
                {active.liveUrl && (
                  <a
                    href={active.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="found-stack__btn found-stack__btn--ghost"
                  >
                    Visit site
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <ul className="found-stack__index" aria-label="Project types">
            {projects.map((p, i) => {
              const cat = CATEGORY_LABEL[p.slug] || p.type;
              const on = i === index;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`found-stack__index-item${on ? " is-active" : ""}`}
                  >
                    <span className="found-stack__index-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="found-stack__index-label">{cat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Right — one hero card, quiet neighbor peeks */}
        <div className="found-stack__stage" aria-label="Project cards">
          <div className="found-stack__deck">
            {projects.map((project, i) => {
              const d = stackOffset(i, index, total);
              const abs = Math.abs(d);
              const visible = abs <= 1; // only hero + one peek each side
              const theme =
                CARD_THEME[project.slug] || CARD_THEME["jieshin-tseng"];
              const cat = CATEGORY_LABEL[project.slug] || project.type;
              // Tiny tilt only — keeps the right column calm
              const rotateZ = d === 0 ? 0 : d * (narrow ? 1.6 : 2.2);

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
                  className="found-stack__card"
                  style={{
                    zIndex: 20 - abs,
                    pointerEvents: visible ? "auto" : "none",
                    backgroundColor: theme.bg,
                    color: theme.fg,
                  }}
                  transformTemplate={({ x: tx, y: ty, rotateZ: rz, scale }) =>
                    `translate3d(calc(-50% + ${tx ?? 0}), calc(-50% + ${ty ?? 0}), 0) rotate(${rz ?? 0}) scale(${scale ?? 1})`
                  }
                  initial={false}
                  animate={{
                    x: d * xStep,
                    y: d * yStep,
                    rotateZ,
                    scale: d === 0 ? 1 : 0.94 - abs * 0.02,
                    opacity: visible ? (d === 0 ? 1 : 0.88) : 0,
                  }}
                  transition={reduce ? { duration: 0 } : STACK_SPRING}
                >
                  <div className="found-stack__card-inner">
                    <div className="found-stack__card-copy">
                      <div>
                        <p
                          className="found-stack__card-eyebrow"
                          style={{ color: theme.muted }}
                        >
                          {cat}
                        </p>
                        <p className="found-stack__card-title">
                          {project.title}
                        </p>
                      </div>
                      <div>
                        {project.location && (
                          <p
                            className="found-stack__card-place"
                            style={{ color: theme.muted }}
                          >
                            {project.location}
                          </p>
                        )}
                        <p
                          className="found-stack__card-num"
                          style={{ color: theme.accent }}
                        >
                          {String(i + 1)}
                        </p>
                      </div>
                    </div>
                    <div className="found-stack__card-media">
                      <Image
                        src={assetPath(project.cover)}
                        alt={project.title}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 42vw, 280px"
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
