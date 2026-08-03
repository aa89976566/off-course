"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { HOME, STUDIO, WORLDS } from "@/lib/content";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const IW = 1024;
const IH = 1536;

const PRESETS = [
  { id: 1, href: "/get-lost", station: "GET LOST" },
  { id: 2, href: "/get-found", station: "GET FOUND" },
  { id: 3, href: "/archive", station: "ARCHIVE" },
  { id: 4, href: "/about", station: "ABOUT" },
  { id: 5, href: "/contact", station: "CONTACT" },
  { id: 6, href: "mailto:hello@offcourse.studio", station: "HELLO" },
] as const;

/** Road / scene axis in image space (vanishing point x). */
const SCENE_CX = 0.467;
/** Horizon / asphalt start in image-normalized Y. */
const ROAD_Y0 = 0.335;
/** Road end just above dashboard lip. */
const ROAD_Y1 = 0.448;
/** Centre-line dash half-widths (image-normalized). */
const DASH_HALF_FAR = 0.0042;
const DASH_HALF_NEAR = 0.0165;
/** Full road edge half-widths — clip mask only. */
const ROAD_EDGE_FAR = 0.048;
const ROAD_EDGE_NEAR = 0.318;

const DISPLAY = { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 };
const BUTTON_CX = [0.346, 0.394, 0.441, 0.49, 0.533, 0.584];
const BUTTON_CY = 0.664;
const BUTTON_W = 0.04;
const BUTTON_H = 0.03;

/** Rear-view mirror plate in image-normalized coords. */
const MIRROR = { x0: 0.395, y0: 0.055, x1: 0.565, y1: 0.162 };

type Box = { left: string; top: string; width: string; height: string };

type Phase =
  | "boot"
  | "static"
  | "seek-lost"
  | "lock-lost"
  | "seek-found"
  | "lock-found"
  | "settle";

type Layout = {
  image: { left: string; top: string; width: string; height: string };
  display: Box;
  buttons: Box[];
  mirror: Box;
  road: {
    cx: number;
    y0: number;
    y1: number;
    halfFar: number;
    halfNear: number;
    edgeFar: number;
    edgeNear: number;
  };
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  vw: number;
  vh: number;
};

function coverLayout(vw: number, vh: number): Layout {
  const scale = Math.max(vw / IW, vh / IH);
  const dw = IW * scale;
  const dh = IH * scale;
  const dx = vw / 2 - SCENE_CX * dw;
  const dy = (vh - dh) / 2;

  const box = (x0: number, y0: number, x1: number, y1: number): Box => ({
    left: `${(((dx + x0 * dw) / vw) * 100).toFixed(3)}%`,
    top: `${(((dy + y0 * dh) / vh) * 100).toFixed(3)}%`,
    width: `${((((x1 - x0) * dw) / vw) * 100).toFixed(3)}%`,
    height: `${((((y1 - y0) * dh) / vh) * 100).toFixed(3)}%`,
  });

  return {
    image: {
      left: `${dx}px`,
      top: `${dy}px`,
      width: `${dw}px`,
      height: `${dh}px`,
    },
    display: box(DISPLAY.x0, DISPLAY.y0, DISPLAY.x1, DISPLAY.y1),
    buttons: BUTTON_CX.map((cxFrac) =>
      box(
        cxFrac - BUTTON_W / 2,
        BUTTON_CY - BUTTON_H / 2,
        cxFrac + BUTTON_W / 2,
        BUTTON_CY + BUTTON_H / 2
      )
    ),
    mirror: box(MIRROR.x0, MIRROR.y0, MIRROR.x1, MIRROR.y1),
    road: {
      cx: dx + dw * SCENE_CX,
      y0: dy + dh * ROAD_Y0,
      y1: dy + dh * ROAD_Y1,
      halfFar: dw * DASH_HALF_FAR,
      halfNear: dw * DASH_HALF_NEAR,
      edgeFar: dw * ROAD_EDGE_FAR,
      edgeNear: dw * ROAD_EDGE_NEAR,
    },
    dx,
    dy,
    dw,
    dh,
    vw,
    vh,
  };
}

/** Paint asphalt dashes in true road-plane perspective (canvas, no WebGL). */
function paintRoad(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  scroll: number,
  moving: boolean
) {
  const { cx, y0, y1, halfFar, halfNear, edgeFar, edgeNear } = layout.road;
  const h = y1 - y0;
  if (h < 4) return;

  ctx.clearRect(0, 0, layout.vw, layout.vh);
  ctx.save();

  // Mask markings strictly inside the asphalt trapezoid
  ctx.beginPath();
  ctx.moveTo(cx - edgeFar, y0);
  ctx.lineTo(cx + edgeFar, y0);
  ctx.lineTo(cx + edgeNear, y1);
  ctx.lineTo(cx - edgeNear, y1);
  ctx.closePath();
  ctx.clip();

  const sample = (t: number) => {
    // Inverse-depth feel: denser + smaller toward horizon
    const clamped = Math.min(1, Math.max(0, t));
    const p = Math.pow(clamped, 1.62);
    const y = y0 + h * p;
    const half = halfFar + (halfNear - halfFar) * Math.pow(p, 1.28);
    return { y, half, p };
  };

  const count = 16;
  const gap = 1 / count;
  const offset = moving ? ((scroll % gap) + gap) % gap : gap * 0.15;

  for (let i = -2; i < count + 2; i++) {
    const tA = i * gap + offset;
    const tB = tA + gap * 0.42;
    if (tB <= 0.02 || tA >= 0.98) continue;

    const a = sample(Math.max(0.02, tA));
    const b = sample(Math.min(0.98, tB));
    if (b.y - a.y < 0.7) continue;

    // Deterministic edge wear — painted, not vector-clean
    const wearL = 0.82 + ((i * 13) % 9) * 0.018;
    const wearR = 0.82 + ((i * 29) % 9) * 0.018;
    const taper = 0.1 + a.p * 0.1;

    const ax0 = cx - a.half * wearL;
    const ax1 = cx + a.half * wearR;
    const bx0 = cx - b.half * wearL;
    const bx1 = cx + b.half * wearR;

    // Desaturate + fade toward horizon (atmospheric)
    const alpha = 0.18 + a.p * 0.62;
    const r = Math.round(155 + a.p * 55);
    const g = Math.round(105 + a.p * 35);
    const bl = Math.round(18 + a.p * 8);
    ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${alpha})`;

    ctx.beginPath();
    ctx.moveTo(ax0 + a.half * taper, a.y);
    ctx.lineTo(ax1 - a.half * taper, a.y);
    ctx.lineTo(bx1 - b.half * taper * 0.55, b.y);
    ctx.lineTo(bx0 + b.half * taper * 0.55, b.y);
    ctx.closePath();
    ctx.fill();

    // Soft worn edge into asphalt
    ctx.strokeStyle = `rgba(70, 48, 14, ${0.1 + a.p * 0.22})`;
    ctx.lineWidth = 0.55 + a.p * 0.9;
    ctx.stroke();
  }

  // Horizon haze over far asphalt
  const grad = ctx.createLinearGradient(0, y0, 0, y0 + h * 0.5);
  grad.addColorStop(0, "rgba(205, 185, 155, 0.32)");
  grad.addColorStop(0.55, "rgba(205, 185, 155, 0.08)");
  grad.addColorStop(1, "rgba(205, 185, 155, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - edgeNear, y0, edgeNear * 2, h * 0.5);

  ctx.restore();
}

/**
 * Car-radio entrance — diegetic radio + mirror identity,
 * perspective road canvas, environmental philosophy (no UI panels).
 */
export function HomeCanvas() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<Layout | null>(null);
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  const [lcdText, setLcdText] = useState<string>("");
  const [statement, setStatement] = useState<string | null>(null);
  const [mirrorOn, setMirrorOn] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [roadMoving, setRoadMoving] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduceMotion(reduce);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const sync = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (w < 1 || h < 1) return;
      const next = coverLayout(w, h);
      layoutRef.current = next;
      setLayout(next);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintRoad(ctx, next, scrollRef.current, false);
      }
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(section);
    window.addEventListener("orientationchange", sync);
    const t = window.setTimeout(() => setReady(true), 1800);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
      window.clearTimeout(t);
    };
  }, []);

  // Road motion loop — only while travelling
  useEffect(() => {
    if (!ready || reduceMotion || !roadMoving) {
      const canvas = canvasRef.current;
      const lay = layoutRef.current;
      if (canvas && lay) {
        const ctx = canvas.getContext("2d");
        if (ctx) paintRoad(ctx, lay, scrollRef.current, false);
      }
      return;
    }

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      scrollRef.current += dt * 0.2;
      const canvas = canvasRef.current;
      const lay = layoutRef.current;
      if (canvas && lay) {
        const ctx = canvas.getContext("2d");
        if (ctx) paintRoad(ctx, lay, scrollRef.current, true);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, roadMoving, reduceMotion]);

  // Allow early skip via scroll / Escape — never trap the visitor
  useEffect(() => {
    if (!ready || reduceMotion || interactive) return;

    const skip = () => {
      if (touchedRef.current) return;
      touchedRef.current = true;
      setMirrorOn(true);
      setSeeking(false);
      setPhase("settle");
      setLcdText(HOME.radio.settled);
      setStatement(null);
      setInteractive(true);
      setRoadMoving(true);
    };

    const onWheel = () => skip();
    const onKey = (e: Event) => {
      if ((e as globalThis.KeyboardEvent).key === "Escape") skip();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, reduceMotion, interactive]);

  // Cinematic sequence
  useEffect(() => {
    if (!ready) return;

    if (reduceMotion) {
      setMirrorOn(true);
      setLcdText(HOME.radio.settled);
      setStatement(null);
      setPhase("settle");
      setInteractive(true);
      setSeeking(false);
      setRoadMoving(false);
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    setPhase("boot");
    setLcdText("");
    setMirrorOn(false);
    setStatement(null);
    setRoadMoving(false);

    // 1–2. Scene settles → mirror identity
    at(400, () => {
      if (touchedRef.current) return;
      setMirrorOn(true);
    });

    // 3–5. Radio search + road motion; static clears toward a lock
    at(1400, () => {
      if (touchedRef.current) return;
      setPhase("static");
      setSeeking(true);
      setRoadMoving(true);
      setLcdText(HOME.radio.static);
    });
    at(2400, () => {
      if (touchedRef.current) return;
      setLcdText(HOME.radio.tuning);
    });
    at(3200, () => {
      if (touchedRef.current) return;
      setPhase("seek-lost");
      setLcdText(HOME.radio.seek);
    });

    // 6–7. GET LOST lock + philosophy in windscreen
    at(4200, () => {
      if (touchedRef.current) return;
      setPhase("lock-lost");
      setSeeking(false);
      setLcdText(HOME.radio.lockLost);
      setStatement(WORLDS.lost.statement);
    });

    // 8. Signal lost
    at(7000, () => {
      if (touchedRef.current) return;
      setPhase("seek-found");
      setSeeking(true);
      setStatement(null);
      setLcdText(HOME.radio.static);
    });
    at(7800, () => {
      if (touchedRef.current) return;
      setLcdText(HOME.radio.seek);
    });

    // 9–10. SIGNAL FOUND → GET FOUND + statement
    at(8800, () => {
      if (touchedRef.current) return;
      setPhase("lock-found");
      setSeeking(false);
      setLcdText(HOME.radio.signalFound);
      setStatement(null);
    });
    at(9600, () => {
      if (touchedRef.current) return;
      setLcdText(HOME.radio.lockFound);
      setStatement(WORLDS.found.statement);
    });

    // 11. Settle (~13s total — under 15s brief)
    at(12500, () => {
      if (touchedRef.current) return;
      setPhase("settle");
      setLcdText(HOME.radio.settled);
      setStatement(null);
      setInteractive(true);
      setSeeking(false);
      setRoadMoving(true);
    });

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [ready, reduceMotion]);

  const markTouched = (station: string) => {
    touchedRef.current = true;
    setSeeking(false);
    setInteractive(true);
    setPhase("settle");
    setMirrorOn(true);
    setRoadMoving(!reduceMotion);
    setLcdText(station);
    if (station === "GET LOST") setStatement(WORLDS.lost.statement);
    else if (station === "GET FOUND") setStatement(WORLDS.found.statement);
    else setStatement(null);
  };

  const onKeyNav = (e: KeyboardEvent<HTMLElement>) => {
    if (!interactive && phase !== "settle") return;
    const n = Number(e.key);
    if (n >= 1 && n <= 6) markTouched(PRESETS[n - 1].station);
  };

  return (
    <section
      ref={sectionRef}
      className={`home-radio relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a] phase-${phase}${
        reduceMotion ? " is-reduced" : ""
      }${roadMoving && !reduceMotion ? " is-travelling" : ""}`}
      onKeyDown={onKeyNav}
    >
      <div className={`home-radio__scene${ready ? " is-live" : ""}`}>
        <picture>
          <source srcSet={`${BASE}/hero-car-road.webp?v=14`} type="image/webp" />
          <img
            src={`${BASE}/hero-car-road.jpg?v=14`}
            alt=""
            className={
              layout
                ? "pointer-events-none absolute max-w-none select-none home-radio__plate"
                : "pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
            }
            style={layout?.image}
            draggable={false}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setReady(true)}
          />
        </picture>

        {/* Perspective road markings — painted onto asphalt plane */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-[5] home-radio__road-canvas"
          aria-hidden
        />

        {/* Atmospheric haze over distant landscape */}
        <div className="home-radio__haze" aria-hidden />

        {/* Soft windscreen reflection veil */}
        <div className="home-radio__glass" aria-hidden />

        {/* Analogue grain */}
        <div className="home-radio__grain" aria-hidden />

        {/* A. Rear-view mirror — identity only */}
        {layout && (
          <div
            className={`home-radio__mirror${mirrorOn ? " is-on" : ""}`}
            style={layout.mirror}
            aria-hidden={!mirrorOn}
          >
            <p className="home-radio__mirror-brand">{STUDIO.name}</p>
            <p className="home-radio__mirror-tag">{STUDIO.tagline}</p>
          </div>
        )}

        {/* B. Radio LCD — diegetic stations */}
        {layout && (
          <div
            className="radio-lcd pointer-events-none absolute z-[8] flex items-center justify-center overflow-hidden"
            style={layout.display}
            aria-live="polite"
          >
            {lcdText ? (
              <span
                className={`radio-lcd-text${seeking ? " is-seeking" : ""}`}
                key={lcdText}
              >
                {lcdText}
              </span>
            ) : null}
          </div>
        )}

        {/* C. Philosophy as windscreen ghost — no dark panel */}
        {statement && (
          <p
            className={`home-radio__ghost${
              phase === "lock-lost" ? " is-lost" : ""
            }${phase === "lock-found" || phase === "settle" ? " is-found" : ""}`}
            key={statement}
          >
            {statement}
          </p>
        )}

        {layout && (
          <nav
            className={`absolute inset-0 z-[12]${seeking ? " radio-seeking" : ""}`}
            aria-label="Radio frequency presets 1 to 6"
          >
            {PRESETS.map((ch, i) => (
              <Link
                key={ch.id}
                href={ch.href}
                className="radio-channel absolute block rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea9a26]"
                style={
                  {
                    ...layout.buttons[i],
                    ["--seek-i" as string]: i,
                  } as CSSProperties
                }
                aria-label={`Frequency ${ch.id}: ${ch.station}`}
                onMouseEnter={() => interactive && markTouched(ch.station)}
                onFocus={() => markTouched(ch.station)}
                onTouchStart={() => markTouched(ch.station)}
              />
            ))}
          </nav>
        )}
      </div>

      <div className="home-radio__fallback">
        <Link href="/get-lost">{WORLDS.lost.label}</Link>
        <span aria-hidden>·</span>
        <Link href="/get-found">{WORLDS.found.label}</Link>
        <span aria-hidden>·</span>
        <a href="#home-editorial">{HOME.continueLabel}</a>
      </div>

      <p className="sr-only">
        Off Course. Concrete and Code. Identity appears in the rear-view mirror.
        The car radio searches frequencies. GET LOST — ideas become physical.
        GET FOUND — ideas become accessible. Use presets 1 to 6, or the text
        links. Reduced motion skips the search animation.
      </p>

      <div
        className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[var(--ed-paper)] transition-opacity duration-700 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-baseline font-display text-lg uppercase tracking-[0.08em] text-black md:text-xl">
            <span>OFF</span>
            <span className="logo-underscore mx-[0.06em] cursor-blink" />
            <span>COURSE</span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
            Loading
          </span>
        </div>
      </div>
    </section>
  );
}
