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

/**
 * After Effects–style ease (ease-out expo / quint hybrid).
 * Long settle, no bounce — satto 3D Carusel S4 silky feel.
 */
const AE_EASE = [0.16, 1, 0.3, 1] as const;
const AE_DURATION = 0.92;
const AE_LOCK_MS = 780;

const MOVE: Transition = {
  duration: AE_DURATION,
  ease: AE_EASE,
};

const FADE: Transition = {
  duration: AE_DURATION * 0.72,
  ease: AE_EASE,
};

const META: Transition = {
  duration: 0.55,
  ease: AE_EASE,
};

function wrapOffset(i: number, index: number, total: number) {
  let d = i - index;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

/**
 * Pose for satto 3D Carusel S4:
 * front card nearest (rotateX), stack recedes upward into depth.
 */
function cardPose(d: number, narrow: boolean) {
  const yUnit = narrow ? 72 : 98;
  const zUnit = narrow ? 90 : 140;
  const tilt = narrow ? 34 : 40;

  if (d < 0) {
    const t = Math.abs(d);
    return {
      x: 0,
      y: t * (narrow ? 170 : 220),
      z: 160 + t * 90,
      rotateX: tilt + 8 + t * 4,
      scale: 1.06 + t * 0.05,
      opacity: t > 1 ? 0 : 0.12,
      filter: "blur(0px)",
    };
  }

  return {
    x: 0,
    y: -d * yUnit,
    z: 110 - d * zUnit,
    rotateX: tilt,
    scale: Math.max(0.7, 1 - d * 0.075),
    opacity: d > 3 ? 0 : Math.max(0.42, 1 - d * 0.1),
    // Soft depth-of-field like AE camera blur
    filter: d === 0 ? "blur(0px)" : `blur(${Math.min(2.4, d * 0.55)}px)`,
  };
}

function cardTransition(d: number, reduce: boolean | null): Transition {
  if (reduce) return { duration: 0 };
  // Depth cards lag a hair — cascade like AE layer offsets
  const delay = d > 0 ? d * 0.045 : d < 0 ? 0 : 0.02;
  return {
    x: { ...MOVE, delay },
    y: { ...MOVE, delay },
    z: { ...MOVE, delay },
    rotateX: { ...MOVE, delay },
    scale: { ...MOVE, delay },
    opacity: { ...FADE, delay: delay * 0.6 },
    filter: { ...FADE, delay: delay * 0.6 },
  };
}

/**
 * GET FOUND — satto 3D Carusel S4 with AE silky motion.
 */
export function FoundCarousel3D({ projects }: FoundCarousel3DProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const lock = useRef(false);
  const wheelAcc = useRef(0);
  const wheelTimer = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);
  const touchT = useRef(0);
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
      if (!total || lock.current || delta === 0) return;
      lock.current = true;
      setIndex((i) => (i + delta + total) % total);
      window.setTimeout(
        () => {
          lock.current = false;
        },
        reduce ? 100 : AE_LOCK_MS
      );
    },
    [total, reduce]
  );

  useEffect(() => {
    const flushWheel = () => {
      const acc = wheelAcc.current;
      wheelAcc.current = 0;
      if (Math.abs(acc) < 28) return;
      go(acc > 0 ? 1 : -1);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Normalize trackpad + mouse wheel into one silky step
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      wheelAcc.current += dy;
      if (wheelTimer.current != null) window.clearTimeout(wheelTimer.current);
      // Fire on gesture settle — feels AE scrubbed, not jittery
      if (Math.abs(wheelAcc.current) > 64 && !lock.current) {
        flushWheel();
        return;
      }
      wheelTimer.current = window.setTimeout(flushWheel, 90);
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
      if (wheelTimer.current != null) window.clearTimeout(wheelTimer.current);
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
        touchT.current = performance.now();
      }}
      onTouchEnd={(e) => {
        if (touchY.current == null) return;
        const y = e.changedTouches[0]?.clientY ?? touchY.current;
        const dy = touchY.current - y;
        const dt = Math.max(16, performance.now() - touchT.current);
        const velocity = dy / dt;
        touchY.current = null;
        // Distance or flick velocity — silky mobile scrub
        if (Math.abs(dy) < 28 && Math.abs(velocity) < 0.35) return;
        go(dy > 0 || velocity > 0 ? 1 : -1);
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
                  `translate(-50%, -50%) translate3d(${tx ?? 0}px, ${ty ?? 0}px, ${tz ?? 0}px) rotateX(${rx ?? 0}deg) scale(${scale ?? 1})`
                }
                initial={false}
                animate={pose}
                transition={cardTransition(d, reduce)}
                onClick={() => {
                  if (d === 0) {
                    openActive();
                    return;
                  }
                  go(d);
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
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={reduce ? { duration: 0 } : META}
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
