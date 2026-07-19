"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const COLORS = ["#4848ED", "#F7A80D", "#D1ADD4", "#FF3829", "#008B8E", "#000000", "#FFFFFF"];

type Shape =
  | { kind: "rect"; x: number; y: number; w: number; h: number; color: string }
  | { kind: "circle"; x: number; y: number; r: number; color: string }
  | { kind: "stripe"; x: number; y: number; w: number; h: number; color: string };

function buildShapes(w: number, h: number): Shape[] {
  const out: Shape[] = [];
  // Big colour fields
  const cols = 8;
  const rows = 6;
  const cw = w / cols;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.35) {
        out.push({
          kind: "rect",
          x: c * cw,
          y: r * rh,
          w: cw + 2,
          h: rh + 2,
          color: COLORS[(r * 3 + c) % COLORS.length],
        });
      }
    }
  }
  // Dots
  for (let i = 0; i < 40; i++) {
    out.push({
      kind: "circle",
      x: Math.random() * w,
      y: Math.random() * h,
      r: 12 + Math.random() * 70,
      color: COLORS[i % COLORS.length],
    });
  }
  // Vertical stripes
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * w;
    out.push({
      kind: "stripe",
      x,
      y: 0,
      w: 8 + (i % 3) * 6,
      h,
      color: COLORS[i % COLORS.length],
    });
  }
  return out;
}

/**
 * Walala-style home hero: full-viewport colourful geometric canvas.
 * No marketing copy — pure visual entry, like camillewalala.com.
 */
export function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shapesRef.current = buildShapes(w, h);
    };

    const draw = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (now - t0) / 1000;
      const mx = (mouseRef.current.x - 0.5) * 24;
      const my = (mouseRef.current.y - 0.5) * 18;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < shapesRef.current.length; i++) {
        const s = shapesRef.current[i];
        const driftX = Math.sin(t * 0.4 + i * 0.15) * 6 + mx * (0.2 + (i % 5) * 0.05);
        const driftY = Math.cos(t * 0.35 + i * 0.12) * 5 + my * (0.2 + (i % 4) * 0.05);
        ctx.fillStyle = s.color;
        if (s.kind === "rect" || s.kind === "stripe") {
          ctx.fillRect(s.x + driftX, s.y + driftY, s.w, s.h);
        } else {
          ctx.beginPath();
          ctx.arc(s.x + driftX, s.y + driftY, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const show = window.setTimeout(() => setReady(true), 700);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(show);
    };
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  };

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-white"
      onMouseMove={onMove}
    >
      {/* White preload resolve — like Walala entrance */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 bg-white"
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />

      {/* Invisible full-bleed hit area → projects (Walala home is the entry) */}
      <Link
        href="/projects"
        className="absolute inset-0 z-10 block"
        aria-label="Enter projects"
      />

      {/* Micro labels only — brand paths, Walala-sparse */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 md:p-7">
        <Link
          href="/get-lost"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white mix-blend-difference hover:opacity-70 md:text-base"
        >
          GET LOST →
        </Link>
        <Link
          href="/get-found"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white mix-blend-difference hover:opacity-70 md:text-base"
        >
          GET FOUND →
        </Link>
      </div>
    </section>
  );
}
