"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Hero: car-interior POV over the illustrated highway.
 * Static art stays fixed; yellow centre dashes scroll downward
 * so the road feels like the car is driving forward.
 */
export function HomeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const img = new Image();
    img.src = "/hero-car-road.png";
    imgRef.current = img;

    let raf = 0;
    const t0 = performance.now();
    let w = 0;
    let h = 0;
    let loaded = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Cover-fit the art into the viewport (like object-fit: cover). */
    const coverRect = (iw: number, ih: number) => {
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      return { dx: (w - dw) / 2, dy: (h - dh) / 2, dw, dh, scale };
    };

    const draw = (now: number) => {
      const t = reduceMotion ? 0 : (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h);

      if (loaded && imgRef.current) {
        const { dx, dy, dw, dh } = coverRect(
          imgRef.current.naturalWidth,
          imgRef.current.naturalHeight
        );
        ctx.drawImage(imgRef.current, dx, dy, dw, dh);

        // Road geometry in image-normalized space (tuned to the art)
        // Horizon ~40% down, dash bottom where windshield meets dash ~62%
        const y0 = dy + dh * 0.395;
        const y1 = dy + dh * 0.618;
        const cx = dx + dw * 0.5;
        const halfFar = dw * 0.01;
        const halfNear = dw * 0.09;

        // Paint asphalt over the static printed dashes so only motion shows
        ctx.beginPath();
        ctx.moveTo(cx - halfFar, y0);
        ctx.lineTo(cx + halfFar, y0);
        ctx.lineTo(cx + halfNear, y1);
        ctx.lineTo(cx - halfNear, y1);
        ctx.closePath();
        ctx.fillStyle = "#141414";
        ctx.fill();

        // Soft white edge lines
        ctx.strokeStyle = "rgba(235,235,230,0.85)";
        ctx.lineWidth = Math.max(1.5, dw * 0.0018);
        ctx.beginPath();
        ctx.moveTo(cx - halfFar * 0.9, y0);
        ctx.lineTo(cx - halfNear * 0.93, y1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + halfFar * 0.9, y0);
        ctx.lineTo(cx + halfNear * 0.93, y1);
        ctx.stroke();

        drawMovingDashes(ctx, cx, y0, y1, t, reduceMotion, dw);

        // Keep car interior on top of the road strip (re-draw bottom + top
        // bands from the source image so dash doesn't clip the dash/mirror)
        const topBand = dh * 0.12;
        const bottomBand = dh * 0.385;
        ctx.drawImage(
          imgRef.current,
          0,
          0,
          imgRef.current.naturalWidth,
          imgRef.current.naturalHeight * 0.12,
          dx,
          dy,
          dw,
          topBand
        );
        ctx.drawImage(
          imgRef.current,
          0,
          imgRef.current.naturalHeight * 0.615,
          imgRef.current.naturalWidth,
          imgRef.current.naturalHeight * 0.385,
          dx,
          dy + dh * 0.615,
          dw,
          bottomBand
        );
      }

      raf = requestAnimationFrame(draw);
    };

    const onLoad = () => {
      loaded = true;
      setReady(true);
    };
    if (img.complete && img.naturalWidth) onLoad();
    else img.addEventListener("load", onLoad);

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      img.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a]">
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 bg-white"
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />

      <Link
        href="/projects"
        className="absolute inset-0 z-10 block"
        aria-label="Enter projects"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 md:p-7">
        <Link
          href="/get-lost"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:opacity-70 md:text-base"
        >
          GET LOST →
        </Link>
        <Link
          href="/get-found"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] hover:opacity-70 md:text-base"
        >
          GET FOUND →
        </Link>
      </div>
    </section>
  );
}

function drawMovingDashes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y0: number,
  y1: number,
  t: number,
  frozen: boolean,
  artW: number
) {
  const span = y1 - y0;
  const speed = frozen ? 0 : 0.7; // cycles / sec toward the camera
  const offset = (t * speed) % 1;
  const dashCount = 16;
  const solid = 0.55;

  ctx.fillStyle = "#F5D031";

  for (let i = -2; i < dashCount + 1; i++) {
    let u0 = (i + offset) / dashCount;
    let u1 = (i + offset + solid) / dashCount;
    if (u1 < 0 || u0 > 1) continue;
    u0 = Math.max(0, Math.min(1, u0));
    u1 = Math.max(0, Math.min(1, u1));

    // Quadratic perspective: dashes accelerate / grow as they approach
    const p0 = u0 * u0;
    const p1 = u1 * u1;
    const ya = y0 + span * p0;
    const yb = y0 + span * p1;
    if (yb - ya < 1.2) continue;

    const mid = (p0 + p1) / 2;
    const halfW = artW * (0.0012 + mid * 0.0065);

    ctx.beginPath();
    ctx.moveTo(cx - halfW, ya);
    ctx.lineTo(cx + halfW, ya);
    ctx.lineTo(cx + halfW * 1.15, yb);
    ctx.lineTo(cx - halfW * 1.15, yb);
    ctx.closePath();
    ctx.fill();
  }
}
