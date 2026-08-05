"use client";

import { useEffect, useRef } from "react";

export type WorldSignalTheme = "found" | "lost";

type Props = {
  theme: WorldSignalTheme;
  className?: string;
  /** opening = full cinematic field; ambient = quieter project wash */
  intensity?: "opening" | "ambient";
};

type Palette = {
  base: [number, number, number];
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  edge: [number, number, number];
  grain: number;
};

const PALETTES: Record<WorldSignalTheme, Palette> = {
  found: {
    base: [8, 12, 20],
    a: [20, 90, 110],
    b: [40, 200, 140],
    c: [90, 60, 180],
    edge: [160, 120, 255],
    grain: 28,
  },
  lost: {
    base: [236, 226, 208],
    a: [210, 120, 70],
    b: [190, 70, 45],
    c: [150, 110, 70],
    edge: [90, 55, 35],
    grain: 22,
  },
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Full-bleed cinematic CGI field for world openings.
 * Canvas 2D only — procedural flow, refraction bands, grain, drift.
 */
export function WorldSignalField({
  theme,
  className = "",
  intensity = "opening",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const palette = PALETTES[theme];
    const reduced = prefersReducedMotion();
    const isAmbient = intensity === "ambient";

    let raf = 0;
    let running = false;
    let visible = true;
    let inView = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let simW = 0;
    let simH = 0;
    const started = performance.now();

    // Offscreen buffers for base field + displacement
    const field = document.createElement("canvas");
    const fieldCtx = field.getContext("2d", { willReadFrequently: true });
    const band = document.createElement("canvas");
    const bandCtx = band.getContext("2d");
    if (!fieldCtx || !bandCtx) return;

    // Grain pattern (reused)
    const grain = document.createElement("canvas");
    const grainCtx = grain.getContext("2d");
    if (!grainCtx) return;
    grain.width = 128;
    grain.height = 128;
    const gData = grainCtx.createImageData(128, 128);
    for (let i = 0; i < gData.data.length; i += 4) {
      const n = (Math.random() * 255) | 0;
      gData.data[i] = n;
      gData.data[i + 1] = n;
      gData.data[i + 2] = n;
      gData.data[i + 3] = 255;
    }
    grainCtx.putImageData(gData, 0, 0);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const cap = width < 500 ? 1.25 : 1.75;
      dpr = Math.min(window.devicePixelRatio || 1, cap);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Simulate at reduced resolution for soft cinematic look + perf
      const scale = width < 500 ? 0.22 : isAmbient ? 0.26 : 0.34;
      simW = Math.max(64, Math.floor(width * scale));
      simH = Math.max(64, Math.floor(height * scale));
      // Keep even dims for block fill
      simW -= simW % 2;
      simH -= simH % 2;
      field.width = simW;
      field.height = simH;
      band.width = simW;
      band.height = simH;
    };

    const paintField = (t: number) => {
      const img = fieldCtx.createImageData(simW, simH);
      const data = img.data;
      const driftX = Math.sin(t * 0.07) * 0.35 + Math.sin(t * 0.031) * 0.2;
      const driftY = Math.cos(t * 0.055) * 0.28 + Math.sin(t * 0.019) * 0.18;
      const camX = Math.sin(t * 0.045) * 0.04;
      const camY = Math.cos(t * 0.038) * 0.035;

      // Volume centres slowly orbit
      const v1x = 0.62 + Math.sin(t * 0.11) * 0.12 + camX;
      const v1y = 0.38 + Math.cos(t * 0.09) * 0.1 + camY;
      const v2x = 0.28 + Math.cos(t * 0.08) * 0.14 + camX * 0.6;
      const v2y = 0.72 + Math.sin(t * 0.1) * 0.12 + camY * 0.6;
      const v3x = 0.78 + Math.sin(t * 0.06 + 1.2) * 0.1;
      const v3y = 0.68 + Math.cos(t * 0.07 + 0.4) * 0.1;
      const step = width < 500 ? 2 : 1;

      for (let y = 0; y < simH; y += step) {
        const ny = y / simH + driftY * 0.15;
        for (let x = 0; x < simW; x += step) {
          const nx = x / simW + driftX * 0.15;
          const px = nx + camX;
          const py = ny + camY;

          // Low-frequency flow (layered sines — no external noise lib)
          const f1 =
            Math.sin((px + driftX) * 4.2 + t * 0.55) *
            Math.cos((py + driftY) * 3.1 - t * 0.42);
          const f2 =
            Math.sin((px * 2.4 - py * 1.7 + t * 0.28) * Math.PI) * 0.55;
          const f3 =
            Math.cos((px + py) * 5.5 - t * 0.33) *
            Math.sin(px * 3.8 + t * 0.21) *
            0.35;
          const flow = clamp01(0.5 + f1 * 0.28 + f2 * 0.22 + f3 * 0.18);

          const d1 = (px - v1x) * (px - v1x) + (py - v1y) * (py - v1y);
          const dy2 = (py - v2y) * 1.15;
          const d2 = (px - v2x) * (px - v2x) + dy2 * dy2;
          const dx3 = (px - v3x) * 1.2;
          const d3 = dx3 * dx3 + (py - v3y) * (py - v3y);
          const vol1 = Math.exp(-d1 * (isAmbient ? 6 : 4.2));
          const vol2 = Math.exp(-d2 * (isAmbient ? 7 : 5));
          const vol3 = Math.exp(-d3 * 8);

          let col = palette.base;
          col = mix(col, palette.a, vol1 * (isAmbient ? 0.45 : 0.72));
          col = mix(
            col,
            palette.b,
            vol2 * (isAmbient ? 0.35 : 0.55) * (0.55 + flow * 0.45)
          );
          col = mix(col, palette.c, vol3 * (isAmbient ? 0.25 : 0.4));
          const ridge = Math.abs(f1) * Math.abs(f1);
          col = mix(col, palette.edge, ridge * (theme === "found" ? 0.22 : 0.14));

          const fall = theme === "found" ? 1 - py * 0.18 : 0.92 + py * 0.08;
          const r = Math.min(255, col[0] * fall);
          const g = Math.min(255, col[1] * fall);
          const b = Math.min(255, col[2] * fall);

          for (let oy = 0; oy < step && y + oy < simH; oy++) {
            for (let ox = 0; ox < step && x + ox < simW; ox++) {
              const i = ((y + oy) * simW + (x + ox)) * 4;
              data[i] = r;
              data[i + 1] = g;
              data[i + 2] = b;
              data[i + 3] = 255;
            }
          }
        }
      }
      fieldCtx.putImageData(img, 0, 0);
    };

    const paintFrame = (now: number) => {
      const t = (now - started) / 1000;
      paintField(t);

      // Refraction / displacement bands — evolve over 5–10s cycles
      bandCtx.clearRect(0, 0, simW, simH);
      const bandCount = isAmbient ? 10 : 18;
      const amp = (isAmbient ? 2.2 : 4.5) * (1 + Math.sin(t * 0.4) * 0.25);
      for (let i = 0; i < bandCount; i++) {
        const y0 = Math.floor((i / bandCount) * simH);
        const y1 = Math.floor(((i + 1) / bandCount) * simH);
        const h = Math.max(1, y1 - y0);
        const phase =
          t * (0.55 + i * 0.03) +
          i * 0.7 +
          Math.sin(t * 0.19 + i) * 0.8;
        const shift = Math.sin(phase) * amp + Math.sin(phase * 1.7 + t) * amp * 0.35;
        const skew = Math.cos(t * 0.27 + i * 0.4) * (isAmbient ? 0.4 : 0.9);
        bandCtx.drawImage(
          field,
          0,
          y0,
          simW,
          h,
          shift,
          y0 + skew,
          simW,
          h
        );
      }

      // Composite to display
      ctx.fillStyle =
        theme === "found"
          ? `rgb(${palette.base.join(",")})`
          : `rgb(${palette.base.join(",")})`;
      ctx.fillRect(0, 0, width, height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;
      ctx.drawImage(band, 0, 0, width, height);

      // Soft secondary wash for depth
      ctx.save();
      ctx.globalCompositeOperation =
        theme === "found" ? "screen" : "multiply";
      ctx.globalAlpha = theme === "found" ? 0.18 : 0.12;
      ctx.drawImage(field, -width * 0.02, height * 0.01, width * 1.04, height);
      ctx.restore();

      // Analogue grain
      ctx.save();
      ctx.globalCompositeOperation =
        theme === "found" ? "overlay" : "soft-light";
      ctx.globalAlpha = (palette.grain / 255) * (isAmbient ? 0.35 : 0.55);
      const gScale = 2.2;
      const pat = ctx.createPattern(grain, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.translate((t * 12) % 40, (t * 7) % 40);
        ctx.scale(gScale, gScale);
        ctx.fillRect(
          -40,
          -40,
          width / gScale + 80,
          height / gScale + 80
        );
      }
      ctx.restore();

      // Subtle vignette — keep text readable, not glassmorphism
      const vig = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.15,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      if (theme === "found") {
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.45)");
      } else {
        vig.addColorStop(0, "rgba(243,239,230,0)");
        vig.addColorStop(1, "rgba(90,55,35,0.18)");
      }
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    };

    const tick = (now: number) => {
      if (!running) return;
      paintFrame(now);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced) return;
      if (!visible || !inView) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    paintFrame(performance.now());

    if (reduced) {
      // Polished static frame only
      return () => {
        stop();
      };
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) paintFrame(performance.now());
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0.05;
        if (inView && visible) start();
        else stop();
      },
      { threshold: [0, 0.05, 0.2] }
    );
    io.observe(wrap);

    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible && inView) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVis);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [theme, intensity]);

  return (
    <div
      ref={wrapRef}
      className={`world-signal ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="world-signal__canvas" />
    </div>
  );
}
