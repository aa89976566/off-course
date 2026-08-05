"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { WorldSignalTheme } from "@/components/WorldSignalField";

type Props = {
  theme: WorldSignalTheme;
  children: ReactNode;
  className?: string;
  /** Selector relative to root for the framed media */
  frameSelector?: string;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Project viewport stage: signal-sweep reveal, restrained depth on frame,
 * local optical sheen canvas (never on text/nav).
 */
export function WorldProjectStage({
  theme,
  children,
  className = "",
  frameSelector = ".world-project__frame",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });
  const scrollAmp = useRef(0);
  const raf = useRef(0);
  const reduced = useRef(false);

  const paintSheen = useCallback(
    (intensity: number) => {
      const root = rootRef.current;
      const canvas = sheenRef.current;
      if (!root || !canvas) return;
      const frame = root.querySelector(frameSelector) as HTMLElement | null;
      if (!frame) return;

      const fr = frame.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      const w = Math.max(1, Math.floor(fr.width));
      const h = Math.max(1, Math.floor(fr.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.left = `${fr.left - rr.left}px`;
      canvas.style.top = `${fr.top - rr.top}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (intensity < 0.02 || reduced.current) return;

      const t = performance.now() / 1000;
      const px = pointer.current.x;
      const bands = 7;
      for (let i = 0; i < bands; i++) {
        const y = ((i / bands + t * 0.08 + px * 0.1) % 1) * h;
        const bh = h * 0.04;
        const alpha =
          intensity *
          (0.08 + Math.sin(t * 1.4 + i) * 0.04) *
          (theme === "found" ? 1 : 0.85);
        const grad = ctx.createLinearGradient(0, y, w, y + bh);
        if (theme === "found") {
          grad.addColorStop(0, `rgba(61,255,168,0)`);
          grad.addColorStop(0.45, `rgba(120,220,255,${alpha})`);
          grad.addColorStop(0.55, `rgba(180,140,255,${alpha * 0.7})`);
          grad.addColorStop(1, `rgba(61,255,168,0)`);
        } else {
          grad.addColorStop(0, `rgba(232,90,36,0)`);
          grad.addColorStop(0.5, `rgba(255,200,140,${alpha})`);
          grad.addColorStop(1, `rgba(120,60,30,0)`);
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, y - bh * 0.5, w, bh);
      }

      // Soft optical edge refraction hint
      const edge = ctx.createLinearGradient(0, 0, w, 0);
      const a = intensity * 0.12;
      if (theme === "found") {
        edge.addColorStop(0, `rgba(40,200,160,${a})`);
        edge.addColorStop(0.5, "rgba(0,0,0,0)");
        edge.addColorStop(1, `rgba(150,120,255,${a * 0.8})`);
      } else {
        edge.addColorStop(0, `rgba(180,80,40,${a})`);
        edge.addColorStop(0.5, "rgba(0,0,0,0)");
        edge.addColorStop(1, `rgba(90,50,30,${a})`);
      }
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
    },
    [frameSelector, theme]
  );

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true);
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(root);

    if (reduced.current) {
      setRevealed(true);
      return () => io.disconnect();
    }

    let hovering = false;
    let inView = false;

    const applyDepth = () => {
      const frame = root.querySelector(frameSelector) as HTMLElement | null;
      if (!frame) return;

      const rect = root.getBoundingClientRect();
      const mid = rect.top + rect.height * 0.5;
      const viewH = window.innerHeight || 1;
      // -1 top … +1 bottom relative to viewport centre
      const scrollN = Math.max(-1, Math.min(1, (mid - viewH * 0.5) / (viewH * 0.5)));
      scrollAmp.current = scrollN;

      const px = pointer.current.active ? pointer.current.x - 0.5 : 0;
      const py = pointer.current.active ? pointer.current.y - 0.5 : 0;

      // Frame moves more than type (type stays untransformed).
      // Preserve CSS vertical centering (translateY -50%) on desktop absolute frames.
      const centered =
        window.getComputedStyle(frame).position === "absolute";
      const fx = px * 14 + scrollN * -6;
      const fy = py * 10 + scrollN * 12;
      const fScale = 1 + Math.abs(scrollN) * 0.018 + (hovering ? 0.012 : 0);
      const ty = centered ? `calc(-50% + ${fy.toFixed(2)}px)` : `${fy.toFixed(2)}px`;
      frame.style.transform = `translate3d(${fx.toFixed(2)}px, ${ty}, 0) scale(${fScale.toFixed(4)})`;

      const sheenIntensity =
        (hovering ? 0.85 : 0.25) + Math.abs(scrollN) * 0.2;
      paintSheen(sheenIntensity);
    };

    const loop = () => {
      if (inView) applyDepth();
      raf.current = requestAnimationFrame(loop);
    };

    const io2 = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !raf.current) {
          raf.current = requestAnimationFrame(loop);
        }
        if (!inView && raf.current) {
          cancelAnimationFrame(raf.current);
          raf.current = 0;
          paintSheen(0);
        }
      },
      { threshold: [0, 0.1, 0.4] }
    );
    io2.observe(root);

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.current.x = (e.clientX - rect.left) / Math.max(1, rect.width);
      pointer.current.y = (e.clientY - rect.top) / Math.max(1, rect.height);
      pointer.current.active = true;
    };
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
      pointer.current.active = false;
      pointer.current.x = 0.5;
      pointer.current.y = 0.5;
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);

    const onVis = () => {
      if (document.visibilityState !== "visible" && raf.current) {
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      } else if (document.visibilityState === "visible" && inView && !raf.current) {
        raf.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      io2.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      if (raf.current) cancelAnimationFrame(raf.current);
      const frame = root.querySelector(frameSelector) as HTMLElement | null;
      if (frame) frame.style.transform = "";
    };
  }, [frameSelector, paintSheen]);

  return (
    <div
      ref={rootRef}
      className={`world-stage${revealed ? " is-revealed" : ""} ${className}`.trim()}
      data-world-theme={theme}
    >
      {children}
      <canvas
        ref={sheenRef}
        className="world-stage__sheen"
        aria-hidden="true"
      />
    </div>
  );
}
