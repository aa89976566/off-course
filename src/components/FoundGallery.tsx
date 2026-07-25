"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundGalleryProps = {
  projects: Project[];
};

function showcaseSrc(project: Project): string {
  // Prefer a landscape frame when available (images[1] in our dataset).
  return project.images[1] ?? project.cover;
}

function urlLabel(project: Project): string {
  if (project.liveUrl) {
    try {
      return new URL(project.liveUrl).hostname.replace(/^www\./, "");
    } catch {
      return project.liveUrl;
    }
  }
  return `${project.slug}.offcourse.studio`;
}

/**
 * Godly-style design browser: one site at a time in a framed viewport,
 * flip with arrows, keys, or swipe.
 */
export function FoundGallery({ projects }: FoundGalleryProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = projects.length;
  const project = projects[index];

  const go = useCallback(
    (delta: number) => {
      if (!total) return;
      setDirection(delta);
      setIndex((i) => (i + delta + total) % total);
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const thresh = 60;
    if (info.offset.x < -thresh || info.velocity.x < -400) go(1);
    else if (info.offset.x > thresh || info.velocity.x > 400) go(-1);
  };

  if (!project) {
    return (
      <div className="flex min-h-[calc(100svh-50px)] items-center justify-center bg-[#1a1b1e] text-white/60">
        No designs yet.
      </div>
    );
  }

  const slide = reduce
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({
          x: d > 0 ? 56 : -56,
          opacity: 0,
          scale: 0.985,
        }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (d: number) => ({
          x: d > 0 ? -56 : 56,
          opacity: 0,
          scale: 0.985,
        }),
      };

  return (
    <div className="found-gallery relative flex h-[calc(100svh-50px)] flex-col overflow-hidden bg-[#1a1b1e] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 35%, rgba(255,255,255,0.06), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 90%, rgba(255,56,41,0.08), transparent 60%)",
        }}
      />

      <header className="relative z-10 flex shrink-0 items-end justify-between gap-4 px-4 pb-1 pt-3 md:px-8 md:pt-4">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.18em] text-white/45">
            GET FOUND
          </p>
          <h1 className="mt-0.5 font-display text-xl uppercase tracking-wide md:text-2xl">
            Design library
          </h1>
          <p className="mt-0.5 max-w-md text-xs text-white/55 md:text-sm">
            Flip through the systems we ship after discovery.
          </p>
        </div>
        <p className="shrink-0 font-mono text-xs tabular-nums text-white/45">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-3 pt-1 md:px-10 md:pb-5">
        <div className="relative w-full max-w-[980px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={project.slug}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.15 : 0.38, ease: [0.22, 1, 0.36, 1] }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={onDragEnd}
              className="found-frame mx-auto overflow-hidden rounded-[16px] bg-[#0e0f11] shadow-[0_40px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:rounded-[20px]"
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-3 border-b border-white/[0.08] bg-[#2a2b30] px-3 py-2 md:px-4">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center">
                  <div className="w-full max-w-md truncate rounded-md bg-black/35 px-3 py-1 text-center text-[11px] text-white/55 md:text-xs">
                    {urlLabel(project)}
                  </div>
                </div>
                <div className="w-10" aria-hidden />
              </div>

              <Link
                href={`/get-found/${project.slug}`}
                className="group relative block h-[min(48svh,520px)] w-full overflow-hidden bg-white sm:h-[min(52svh,560px)]"
                aria-label={`Open ${project.title}`}
              >
                <Image
                  src={assetPath(showcaseSrc(project))}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1100px) 100vw, 980px"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Side controls — desktop */}
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 md:flex"
            aria-label="Previous design"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 md:flex"
            aria-label="Next design"
          >
            →
          </button>
        </div>

        <div className="mt-3 flex w-full max-w-[980px] flex-col gap-3 md:mt-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={project.slug + "-meta"}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
              >
                <h2 className="font-display text-base uppercase tracking-wide md:text-lg">
                  {project.title}
                </h2>
                <p className="mt-0.5 text-sm text-white/55">
                  {project.type}
                  {project.year ? ` · ${project.year}` : ""}
                  {project.stack ? ` · ${project.stack}` : ""}
                </p>
                {project.summary && (
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/70 line-clamp-2">
                    {project.summary}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 md:hidden">
              <button
                type="button"
                onClick={() => go(-1)}
                className="h-10 w-10 rounded-md bg-white/10 text-sm backdrop-blur-md"
                aria-label="Previous design"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="h-10 w-10 rounded-md bg-white/10 text-sm backdrop-blur-md"
                aria-label="Next design"
              >
                →
              </button>
            </div>
            <Link
              href={`/get-found/${project.slug}`}
              className="inline-flex h-10 items-center rounded-md bg-white px-4 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[var(--walala-red)] hover:text-white"
            >
              View case
            </Link>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-md border border-white/25 px-4 text-xs font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
              >
                Visit site
              </a>
            )}
          </div>
        </div>

        <div
          className="mt-3 flex max-w-full flex-wrap justify-center gap-1.5"
          role="tablist"
          aria-label="Designs"
        >
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${p.title} (${i + 1} of ${total})`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-1.5 rounded-sm transition-all duration-300 ${
                i === index
                  ? "w-6 bg-[var(--walala-red)]"
                  : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <p className="mt-2 hidden text-[11px] uppercase tracking-[0.14em] text-white/30 md:block">
          Arrow keys · swipe · click frame
        </p>
      </div>
    </div>
  );
}
