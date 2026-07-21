"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Car-interior hero.
 * - Compressed photo as <img object-cover>
 * - Road mask clip-path is computed to match that cover fit
 * - Yellow dashes animate with CSS (GPU), so motion stays visible
 */
export function HomeCanvas() {
  const roadRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const road = roadRef.current;
    if (!section || !road) return;

    const IW = 1536;
    const IH = 1024;

    const syncClip = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (w < 1 || h < 1) return;

      const scale = Math.max(w / IW, h / IH);
      const dw = IW * scale;
      const dh = IH * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      // Road trapezoid in the art (fractions of the illustration)
      const y0 = dy + dh * 0.448;
      const y1 = dy + dh * 0.608;
      const cx = dx + dw * 0.5;
      const halfFar = dw * 0.01;
      const halfNear = dw * 0.09;

      const pct = (x: number, y: number) =>
        `${((x / w) * 100).toFixed(3)}% ${((y / h) * 100).toFixed(3)}%`;

      const poly = [
        pct(cx - halfFar, y0),
        pct(cx + halfFar, y0),
        pct(cx + halfNear, y1),
        pct(cx - halfNear, y1),
      ].join(", ");

      const clip = `polygon(${poly})`;
      road.style.clipPath = clip;
      road.style.setProperty("-webkit-clip-path", clip);
    };

    syncClip();
    const ro = new ResizeObserver(syncClip);
    ro.observe(section);
    window.addEventListener("orientationchange", syncClip);

    // Don't leave the white veil up if the image is cached / slow
    const t = window.setTimeout(() => setReady(true), 600);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", syncClip);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a]"
    >
      <picture>
        <source srcSet={`${BASE}/hero-car-road.webp`} type="image/webp" />
        <img
          src={`${BASE}/hero-car-road.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover select-none"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          onLoad={() => setReady(true)}
        />
      </picture>

      {/* Animated road (clipped to match windshield) */}
      <div
        ref={roadRef}
        className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[#101010]" />
        <div className="road-dash-stage">
          <div className="road-dash-track" />
        </div>
        <div className="road-edge road-edge-left" />
        <div className="road-edge road-edge-right" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />

      <Link
        href="/projects"
        className="absolute inset-0 z-10 block"
        aria-label="Enter projects"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 md:p-7">
        <Link
          href="/get-lost"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] hover:opacity-70 md:text-base"
        >
          GET LOST →
        </Link>
        <Link
          href="/get-found"
          className="pointer-events-auto font-display text-sm uppercase tracking-[0.14em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] hover:opacity-70 md:text-base"
        >
          GET FOUND →
        </Link>
      </div>
    </section>
  );
}
