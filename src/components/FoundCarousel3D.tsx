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

type FoundCarousel3DProps = {
  projects: Project[];
};

/** Soft AE-like settle — matches satto 3D Carusel S4 pacing. */
const CAROUSEL_SPRING: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 22,
  mass: 0.95,
};

function wrapOffset(i: number, index: number, total: number) {
  let d = i - index;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

/**
 * Pose for satto 3D Carusel S4:
 * front card nearest (slight rotateX), stack recedes upward into depth.
 */
function cardPose(d: number, narrow: boolean) {
  const yUnit = narrow ? 78 : 108;
  const zUnit = narrow ? 70 : 110;

  // Exiting toward camera / down
  if (d < 0) {
    const t = Math.abs(d);
    return {
      x: 0,
      y: t * (narrow ? 160 : 210),
      z: 120 + t * 80,
      rotateX: 34 + t * 6,
      scale: 1.04 + t * 0.04,
      opacity: t > 1 ? 0 : 0.15,
    };
  }

  // Active + depth stack (up / away)
  return {
    x: 0,
    y: -d * yUnit,
    z: 90 - d * zUnit,
    rotateX: narrow ? 26 : 30,
    scale: Math.max(0.72, 1 - d * 0.07),
    opacity: d > 3 ? 0 : Math.max(0.35, 1 - d * 0.12),
  };
}

/**
 * GET FOUND — satto 3D Carusel S4 CSS recreation:
 * perspective stage, rotateX stack, depth translateZ, cover slides.
 */
export function FoundCarousel3D({ projects }: FoundCarousel3DProps) {
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
      }, reduce ? 120 : 520);
    },
    [total, reduce]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return;
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

  const openActive = useCallback(() => {
    if (!active) return;
    if (active.liveUrl) {
      window.open(active.liveUrl, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(`/get-found/${active.slug}`);
  }, [active, router]);

  if (!active) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#e8e8e8] text-black/50">
        No projects yet.
      </div>
    );
  }

  return (
    <section
      className="found-c3d"
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
      <header className="found-c3d__chrome">
        <Link href="/" className="found-c3d__brand" aria-label="OFF_COURSE home">
          <span>OFF</span>
          <span className="logo-underscore mx-[0.06em]" aria-hidden />
          <span>COURSE</span>
        </Link>
        <p className="found-c3d__label">GET FOUND</p>
        <p className="found-c3d__count">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </header>

      <div className="found-c3d__stage" aria-label="3D project carousel">
        <div className="found-c3d__deck">
          {projects.map((project, i) => {
            const d = wrapOffset(i, index, total);
            const abs = Math.abs(d);
            const visible = d >= -1 && d <= 3;
            const pose = cardPose(d, narrow);
            const zIndex = d < 0 ? 40 + abs : 30 - d;

            return (
              <motion.button
                key={project.slug}
                type="button"
                tabIndex={d === 0 ? 0 : -1}
                aria-current={d === 0 ? "true" : undefined}
                aria-label={`${project.title}, ${project.type}`}
                className="found-c3d__card"
                style={{
                  zIndex,
                  pointerEvents: visible && d >= 0 ? "auto" : "none",
                }}
                transformTemplate={({
                  x: tx,
                  y: ty,
                  z: tz,
                  rotateX: rx,
                  scale,
                }) =>
                  `translate(-50%, -50%) translate3d(${tx ?? 0}, ${ty ?? 0}, ${tz ?? 0}) rotateX(${rx ?? 0}) scale(${scale ?? 1})`
                }
                initial={false}
                animate={pose}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        ...CAROUSEL_SPRING,
                        delay: d > 0 ? d * 0.03 : 0,
                      }
                }
                onClick={() => {
                  if (d === 0) {
                    openActive();
                    return;
                  }
                  if (d > 0) go(d);
                  else go(d);
                }}
              >
                <div className="found-c3d__card-face">
                  <Image
                    src={assetPath(project.cover)}
                    alt=""
                    fill
                    className="found-c3d__card-img"
                    sizes="(max-width: 768px) 88vw, 520px"
                    priority={abs <= 1}
                  />
                  <div className="found-c3d__card-shade" aria-hidden />
                  <div className="found-c3d__card-code">
                    <span>S{String(i + 1).padStart(2, "0")}</span>
                    <span>GF26</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="found-c3d__meta">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            className="found-c3d__meta-inner"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="found-c3d__meta-type">{active.type}</p>
            <h1 className="found-c3d__meta-title">{active.title}</h1>
            {active.location && (
              <p className="found-c3d__meta-place">{active.location}</p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="found-c3d__actions">
          <button
            type="button"
            className="found-c3d__btn found-c3d__btn--ghost"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            ↑
          </button>
          <button
            type="button"
            className="found-c3d__btn found-c3d__btn--ghost"
            onClick={() => go(1)}
            aria-label="Next"
          >
            ↓
          </button>
          <button
            type="button"
            className="found-c3d__btn found-c3d__btn--solid"
            onClick={openActive}
          >
            {active.liveUrl ? "OPEN LIVE" : "VIEW CASE"}
          </button>
        </div>
      </div>
    </section>
  );
}
