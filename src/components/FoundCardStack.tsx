"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { CardStack } from "@/components/framer/CardStack";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundCardStackProps = {
  projects: Project[];
};

/**
 * GET FOUND stage built around the Framer CardStack module
 * https://framer.com/m/CardStack-OuhS.js@1RaielqCLjljis9tIHVX
 */
export function FoundCardStack({ projects }: FoundCardStackProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [order, setOrder] = useState(() => projects.map((_, i) => i));
  const lock = useRef(false);

  const safeOrder = useMemo(() => {
    if (order.length === projects.length) return order;
    return projects.map((_, i) => i);
  }, [order, projects]);

  const active = projects[safeOrder[0]] ?? projects[0];
  const activeNum =
    projects.findIndex((p) => p.slug === active?.slug) + 1 || 1;

  const images = useMemo(
    () =>
      safeOrder.map((i) => ({
        src: assetPath(projects[i].cover),
        alt: projects[i].title,
      })),
    [safeOrder, projects]
  );

  const cycleNext = useCallback(() => {
    if (lock.current) return;
    lock.current = true;
    setOrder((prev) => {
      const base =
        prev.length === projects.length ? prev : projects.map((_, i) => i);
      return [...base.slice(1), base[0]];
    });
    window.setTimeout(() => {
      lock.current = false;
    }, reduce ? 80 : 420);
  }, [projects, reduce]);

  const cyclePrev = useCallback(() => {
    if (lock.current) return;
    lock.current = true;
    setOrder((prev) => {
      const base =
        prev.length === projects.length ? prev : projects.map((_, i) => i);
      return [base[base.length - 1], ...base.slice(0, -1)];
    });
    window.setTimeout(() => {
      lock.current = false;
    }, reduce ? 80 : 420);
  }, [projects, reduce]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 18) return;
      e.preventDefault();
      if (e.deltaY > 0) cycleNext();
      else cyclePrev();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        cycleNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        cyclePrev();
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [cycleNext, cyclePrev]);

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
      <div className="flex min-h-svh items-center justify-center bg-[#ececec] text-black/50">
        No projects yet.
      </div>
    );
  }

  return (
    <section className="found-cs">
      <header className="found-cs__chrome">
        <Link href="/" className="found-cs__brand" aria-label="OFF_COURSE home">
          <span>OFF</span>
          <span className="logo-underscore mx-[0.06em]" aria-hidden />
          <span>COURSE</span>
        </Link>
        <p className="found-cs__label">GET FOUND</p>
        <p className="found-cs__count">
          {String(activeNum).padStart(2, "0")} /{" "}
          {String(projects.length).padStart(2, "0")}
        </p>
      </header>

      <div className="found-cs__body">
        <div className="found-cs__meta">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.slug}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="found-cs__type">{active.type}</p>
              <h1 className="found-cs__title">{active.title}</h1>
              {active.location && (
                <p className="found-cs__place">{active.location}</p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="found-cs__actions">
            <button
              type="button"
              className="found-cs__btn found-cs__btn--ghost"
              onClick={cyclePrev}
              aria-label="Previous"
            >
              ←
            </button>
            <button
              type="button"
              className="found-cs__btn found-cs__btn--ghost"
              onClick={cycleNext}
              aria-label="Next"
            >
              →
            </button>
            <button
              type="button"
              className="found-cs__btn found-cs__btn--solid"
              onClick={openActive}
            >
              {active.liveUrl ? "OPEN LIVE" : "VIEW CASE"}
            </button>
          </div>
        </div>

        <div className="found-cs__stage">
          <CardStack
            images={images}
            offset={9}
            scaleStep={0.055}
            dimStep={0.14}
            stiff={170}
            damp={26}
            ratio="16 / 9"
            borderRadius={18}
            onCycle={cycleNext}
            className="found-cs__stack"
            style={{ width: "100%" }}
          />
          <p className="found-cs__hint">Drag front card to cycle</p>
        </div>
      </div>
    </section>
  );
}
