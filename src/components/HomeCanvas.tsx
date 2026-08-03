"use client";

import Link from "next/link";
import {
  useCallback,
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
const ROAD_Y0 = 0.338;
const ROAD_Y1 = 0.455;
const DASH_HALF_FAR = 0.0028;
const DASH_HALF_NEAR = 0.038;
const ROAD_EDGE_FAR = 0.048;
const ROAD_EDGE_NEAR = 0.318;

const DISPLAY = { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 };
const BUTTON_CX = [0.346, 0.394, 0.441, 0.49, 0.533, 0.584];
const BUTTON_CY = 0.664;
const BUTTON_W = 0.04;
const BUTTON_H = 0.03;

/** SCAN button — right of LCD, where the hand presses. */
const SCAN = { x0: 0.618, y0: 0.592, x1: 0.702, y1: 0.652 };

const MIRROR = { x0: 0.395, y0: 0.055, x1: 0.565, y1: 0.162 };

/**
 * Crop bias — dashboard is the protagonist.
 * Move dash ~20% higher in the viewport and enlarge it so radio / SCAN / dials lead.
 */
const FOCUS_IMG_Y = 0.655;
const FOCUS_VIEW_Y = 0.51;

type Box = { left: string; top: string; width: string; height: string };

type Phase =
  | "boot"
  | "searching"
  | "await-scan"
  | "tuning"
  | "signal"
  | "lock-lost"
  | "mirage"
  | "seek-found"
  | "lock-found"
  | "settle";

type Layout = {
  image: { left: string; top: string; width: string; height: string };
  display: Box;
  buttons: Box[];
  mirror: Box;
  scan: Box;
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
  wideFit: boolean;
};

function coverLayout(vw: number, vh: number): Layout {
  const wideFit = vw / vh > 1.05;
  // Tighter fit = more dashboard in-frame (instruments become the weight).
  const scale = wideFit
    ? vh / (IH * 0.78)
    : Math.max(vw / IW, vh / IH) * 1.14;
  const dw = IW * scale;
  const dh = IH * scale;
  const dx = vw / 2 - SCENE_CX * dw;
  let dy = FOCUS_VIEW_Y * vh - FOCUS_IMG_Y * dh;
  dy = Math.min(0, Math.max(vh - dh, dy));

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
    scan: box(SCAN.x0, SCAN.y0, SCAN.x1, SCAN.y1),
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
    wideFit,
  };
}

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

  const vpY = y0 - Math.max(6, h * 0.08);

  ctx.beginPath();
  ctx.moveTo(cx - edgeFar * 0.5, y0);
  ctx.lineTo(cx + edgeFar * 0.5, y0);
  ctx.lineTo(cx + edgeNear * 0.4, y1);
  ctx.lineTo(cx - edgeNear * 0.4, y1);
  ctx.closePath();
  ctx.clip();

  const halfAt = (y: number) => {
    const t = (y - vpY) / (y1 - vpY);
    return Math.max(halfFar * 0.85, halfNear * t);
  };

  const count = 10;
  const span = y1 - y0;
  const yOf = (u: number) => y0 + span * Math.pow(Math.min(1, Math.max(0, u)), 2.2);
  const gap = 1 / count;
  const offset = moving ? ((scroll % gap) + gap) % gap : gap * 0.2;

  for (let i = -2; i < count + 2; i++) {
    const uA = i * gap + offset;
    const uB = uA + gap * 0.55;
    if (uB <= 0.02 || uA >= 0.98) continue;

    const yA = yOf(Math.max(0.02, uA));
    const yB = yOf(Math.min(0.98, uB));
    if (yB - yA < 0.9) continue;

    const hA = halfAt(yA);
    const hB = halfAt(yB);
    const depth = (yA - y0) / span;
    const wearL = 0.7 + ((i * 13) % 11) * 0.025;
    const wearR = 0.7 + ((i * 29) % 11) * 0.025;
    const jig = (((i * 17) % 7) - 3) * 0.015;

    const ax0 = cx - hA * wearL + hA * jig;
    const ax1 = cx + hA * wearR - hA * jig * 0.5;
    const bx0 = cx - hB * wearL + hB * jig;
    const bx1 = cx + hB * wearR - hB * jig * 0.5;

    const alpha = 0.2 + depth * 0.62;
    const r = Math.round(148 + depth * 60);
    const g = Math.round(105 + depth * 45);
    const bl = Math.round(16 + depth * 14);

    const body = ctx.createLinearGradient(ax0, yA, ax1, yA);
    body.addColorStop(0, `rgba(${r - 28}, ${g - 20}, ${bl}, ${alpha * 0.7})`);
    body.addColorStop(0.45, `rgba(${r}, ${g}, ${bl}, ${alpha})`);
    body.addColorStop(1, `rgba(${r - 28}, ${g - 20}, ${bl}, ${alpha * 0.7})`);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(ax0, yA);
    ctx.lineTo(ax1, yA);
    ctx.lineTo(bx1, yB);
    ctx.lineTo(bx0, yB);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(45, 32, 10, ${0.12 + depth * 0.28})`;
    ctx.lineWidth = 0.4 + depth * 1.3;
    ctx.stroke();
  }

  const grad = ctx.createLinearGradient(0, y0, 0, y0 + h * 0.55);
  grad.addColorStop(0, "rgba(200, 182, 155, 0.36)");
  grad.addColorStop(0.5, "rgba(200, 182, 155, 0.1)");
  grad.addColorStop(1, "rgba(200, 182, 155, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - edgeNear * 0.5, y0, edgeNear, h * 0.55);

  ctx.restore();
}

/** Reused offscreens for heat mirage (avoid per-frame allocation). */
let mirageRoadOff: HTMLCanvasElement | null = null;
let mirageTextOff: HTMLCanvasElement | null = null;

function ensureCanvas(current: HTMLCanvasElement | null, w: number, h: number) {
  if (current && current.width === w && current.height === h) return current;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Desert heat mirage — row displacement + refraction shimmer.
 * No blur, glow, drop-shadow, or glass panels.
 */
function paintMirage(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  plate: HTMLImageElement | null,
  tSec: number,
  life: number,
  line: string
) {
  const { cx, y0, y1, edgeNear } = layout.road;
  const { vw, vh, dx, dy, dw, dh } = layout;
  ctx.clearRect(0, 0, vw, vh);
  if (life <= 0.01) return;

  const form = Math.min(1, life);
  const dissolve = life > 1.35 ? Math.min(1, (life - 1.35) / 0.65) : 0;
  const readable = Math.max(0, Math.min(1, (form - 0.25) / 0.55));
  const amp =
    (10 + (1 - readable) * 18) * (1 - dissolve * 0.85) * Math.min(1, form * 1.4);
  const opacity = (0.15 + readable * 0.75) * (1 - dissolve);

  const padX = edgeNear * 1.05;
  const x0 = Math.max(0, Math.floor(cx - padX));
  const x1 = Math.min(vw, Math.ceil(cx + padX));
  const yy0 = Math.max(0, Math.floor(y0 - (y1 - y0) * 0.15));
  const yy1 = Math.min(vh, Math.ceil(y1 + (y1 - y0) * 0.08));
  const bw = x1 - x0;
  const bh = yy1 - yy0;
  if (bw < 8 || bh < 8) return;

  if (plate && plate.complete && plate.naturalWidth > 0) {
    mirageRoadOff = ensureCanvas(mirageRoadOff, bw, bh);
    const octx = mirageRoadOff.getContext("2d");
    if (octx) {
      const sx = ((x0 - dx) / dw) * IW;
      const sy = ((yy0 - dy) / dh) * IH;
      const sw = (bw / dw) * IW;
      const sh = (bh / dh) * IH;
      octx.clearRect(0, 0, bw, bh);
      octx.drawImage(plate, sx, sy, sw, sh, 0, 0, bw, bh);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - edgeNear * 0.35, y0);
      ctx.lineTo(cx + edgeNear * 0.35, y0);
      ctx.lineTo(cx + edgeNear * 0.95, y1);
      ctx.lineTo(cx - edgeNear * 0.95, y1);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = 0.55 * (1 - dissolve) * Math.min(1, form * 1.6);

      for (let row = 0; row < bh; row++) {
        const ny = row / bh;
        const wave =
          Math.sin(ny * 14 + tSec * 3.2) * amp * (0.35 + ny * 0.9) +
          Math.sin(ny * 31 + tSec * 5.1) * amp * 0.28;
        ctx.drawImage(mirageRoadOff, 0, row, bw, 1, x0 + wave, yy0 + row, bw, 1);
      }
      ctx.restore();
    }
  }

  const tw = Math.max(8, Math.floor(Math.min(bw * 0.92, vw * 0.42)));
  const th = Math.max(36, Math.floor(bh * 0.42));
  mirageTextOff = ensureCanvas(mirageTextOff, tw, th);
  const tctx = mirageTextOff.getContext("2d");
  if (!tctx) return;

  tctx.clearRect(0, 0, tw, th);
  tctx.fillStyle = `rgba(245, 236, 220, ${0.55 + readable * 0.35})`;
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-archivo-black")
      .trim() || "sans-serif";
  tctx.font = `700 ${Math.max(11, tw * 0.055)}px ${family}, sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText(line.toUpperCase(), tw / 2, th / 2);

  const tx = cx - tw / 2;
  const ty = y0 + (y1 - y0) * 0.28;

  ctx.save();
  ctx.globalAlpha = opacity;
  for (let row = 0; row < th; row++) {
    const ny = row / th;
    const wave =
      Math.sin(ny * 18 + tSec * 4.0) * amp * (1.1 - readable * 0.7) +
      Math.sin(ny * 41 + tSec * 6.2) * amp * 0.35 * (1 - readable);
    const squash = 1 + Math.sin(ny * 9 + tSec * 2.4) * 0.012 * (1 - readable);
    ctx.drawImage(
      mirageTextOff,
      0,
      row,
      tw,
      1,
      tx + wave,
      ty + row,
      tw * squash,
      1
    );
  }
  ctx.restore();
}

/**
 * Opening hero — radio is the story.
 * Mirror → LCD → road. Diegetic LCD only. Heat-haze philosophy.
 */
export function HomeCanvas() {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLImageElement>(null);
  const roadCanvasRef = useRef<HTMLCanvasElement>(null);
  const mirageCanvasRef = useRef<HTMLCanvasElement>(null);
  const layoutRef = useRef<Layout | null>(null);
  const roadRafRef = useRef(0);
  const mirageRafRef = useRef(0);
  const scrollRef = useRef(0);
  const mirageLifeRef = useRef(0);
  const postScanTimers = useRef<number[]>([]);

  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [phase, setPhase] = useState<Phase>("boot");
  const [lcdText, setLcdText] = useState<string>("");
  const [mirrorOn, setMirrorOn] = useState(false);
  const [roadMoving, setRoadMoving] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [awaitingScan, setAwaitingScan] = useState(false);
  const [mirageOn, setMirageOn] = useState(false);
  const [seekingVisual, setSeekingVisual] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchedRef = useRef(false);
  const scannedRef = useRef(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const road = roadCanvasRef.current;
    const mirage = mirageCanvasRef.current;
    if (!section || !road) return;

    const sync = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (w < 1 || h < 1) return;
      const next = coverLayout(w, h);
      layoutRef.current = next;
      setLayout(next);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const canvas of [road, mirage]) {
        if (!canvas) continue;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const ctx = road.getContext("2d");
      if (ctx) paintRoad(ctx, next, scrollRef.current, false);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(section);
    window.addEventListener("orientationchange", sync);
    const t = window.setTimeout(() => setReady(true), 1600);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
      window.clearTimeout(t);
    };
  }, []);

  // Road motion
  useEffect(() => {
    if (!ready || reduceMotion || !roadMoving) {
      const canvas = roadCanvasRef.current;
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
      const canvas = roadCanvasRef.current;
      const lay = layoutRef.current;
      if (canvas && lay) {
        const ctx = canvas.getContext("2d");
        if (ctx) paintRoad(ctx, lay, scrollRef.current, true);
      }
      roadRafRef.current = requestAnimationFrame(tick);
    };
    roadRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(roadRafRef.current);
  }, [ready, roadMoving, reduceMotion]);

  // Heat mirage loop
  useEffect(() => {
    if (!mirageOn || reduceMotion) {
      const canvas = mirageCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let last = performance.now();
    mirageLifeRef.current = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      mirageLifeRef.current += dt / 2.4; // ~4.8s full cycle to 2.0
      const canvas = mirageCanvasRef.current;
      const lay = layoutRef.current;
      if (canvas && lay) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          paintMirage(
            ctx,
            lay,
            plateRef.current,
            now / 1000,
            mirageLifeRef.current,
            WORLDS.lost.statement.replace(/\.$/, "")
          );
        }
      }
      if (mirageLifeRef.current >= 2) {
        setMirageOn(false);
        return;
      }
      mirageRafRef.current = requestAnimationFrame(tick);
    };
    mirageRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(mirageRafRef.current);
  }, [mirageOn, reduceMotion]);

  const clearPostScan = () => {
    postScanTimers.current.forEach((id) => window.clearTimeout(id));
    postScanTimers.current = [];
  };

  const finishToSettle = useCallback(() => {
    setPhase("settle");
    setLcdText(HOME.radio.settled);
    setInteractive(true);
    setAwaitingScan(false);
    setMirageOn(false);
    setSeekingVisual(false);
    setRoadMoving(!reduceMotion);
  }, [reduceMotion]);

  const runAfterScan = useCallback(() => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    touchedRef.current = true;
    setAwaitingScan(false);
    clearPostScan();

    const at = (ms: number, fn: () => void) => {
      postScanTimers.current.push(window.setTimeout(fn, ms));
    };

    setPhase("tuning");
    setLcdText(HOME.radio.tuning);
    setRoadMoving(true);
    setSeekingVisual(true);

    at(900, () => {
      setPhase("signal");
      setLcdText(HOME.radio.signal);
    });
    at(1800, () => {
      setPhase("lock-lost");
      setLcdText(HOME.radio.lockLost);
      setSeekingVisual(false);
    });
    at(2200, () => {
      setPhase("mirage");
      if (!reduceMotion) setMirageOn(true);
    });
    at(7200, () => {
      setMirageOn(false);
      setPhase("seek-found");
      setLcdText(HOME.radio.searching);
      setSeekingVisual(true);
    });
    at(8200, () => {
      setPhase("lock-found");
      setLcdText(HOME.radio.lockFound);
      setSeekingVisual(false);
    });
    at(11000, () => {
      finishToSettle();
    });
  }, [finishToSettle, reduceMotion]);

  // Opening sequence — stops at PRESS SCAN until the visitor acts
  useEffect(() => {
    if (!ready) return;

    if (reduceMotion) {
      setMirrorOn(true);
      setLcdText(HOME.radio.settled);
      setPhase("settle");
      setInteractive(true);
      setAwaitingScan(false);
      setRoadMoving(false);
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    scannedRef.current = false;
    touchedRef.current = false;
    setPhase("boot");
    setLcdText("");
    setMirrorOn(false);
    setRoadMoving(false);
    setAwaitingScan(false);
    setMirageOn(false);
    setInteractive(false);

    at(350, () => {
      if (touchedRef.current) return;
      setMirrorOn(true);
    });
    at(900, () => {
      if (touchedRef.current) return;
      setPhase("searching");
      setLcdText(HOME.radio.searching);
      setSeekingVisual(true);
      setRoadMoving(true);
    });
    at(3900, () => {
      if (touchedRef.current || scannedRef.current) return;
      setPhase("await-scan");
      setLcdText(HOME.radio.pressScan);
      setSeekingVisual(false);
      setAwaitingScan(true);
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      clearPostScan();
    };
  }, [ready, reduceMotion]);

  // Skip without trapping
  useEffect(() => {
    if (!ready || reduceMotion || interactive) return;
    const skip = () => {
      if (interactive) return;
      touchedRef.current = true;
      scannedRef.current = true;
      clearPostScan();
      setMirrorOn(true);
      setAwaitingScan(false);
      setMirageOn(false);
      setSeekingVisual(false);
      finishToSettle();
    };
    const onWheel = () => skip();
    const onKey = (e: Event) => {
      const key = (e as globalThis.KeyboardEvent).key;
      if (key === "Escape") skip();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready, reduceMotion, interactive, finishToSettle]);

  const onScan = () => {
    if (!awaitingScan || scannedRef.current) return;
    runAfterScan();
  };

  const markTouched = (station: string) => {
    if (!interactive && !awaitingScan) return;
    if (awaitingScan) {
      onScan();
      return;
    }
    touchedRef.current = true;
    scannedRef.current = true;
    clearPostScan();
    setSeekingVisual(false);
    setAwaitingScan(false);
    setMirageOn(false);
    setInteractive(true);
    setPhase("settle");
    setMirrorOn(true);
    setRoadMoving(!reduceMotion);
    setLcdText(station);
  };

  const onKeyNav = (e: KeyboardEvent<HTMLElement>) => {
    if (awaitingScan && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onScan();
      return;
    }
    if (!interactive && phase !== "settle") return;
    const n = Number(e.key);
    if (n >= 1 && n <= 6) markTouched(PRESETS[n - 1].station);
  };

  const lcdPrompt = phase === "await-scan";

  return (
    <section
      ref={sectionRef}
      className={`home-radio relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a] phase-${phase}${
        reduceMotion ? " is-reduced" : ""
      }${roadMoving && !reduceMotion ? " is-travelling" : ""}${
        awaitingScan ? " is-awaiting-scan" : ""
      }${mirageOn ? " is-mirage" : ""}`}
      onKeyDown={onKeyNav}
      tabIndex={0}
    >
      <div
        className={`home-radio__scene${ready ? " is-live" : ""}${
          layout?.wideFit ? " is-wide" : ""
        }`}
      >
        {layout?.wideFit && (
          <div className="home-radio__bleed" aria-hidden>
            <img
              src={`${BASE}/hero-car-road.jpg?v=15`}
              alt=""
              className="home-radio__bleed-img"
              draggable={false}
              decoding="async"
            />
          </div>
        )}

        <picture>
          <source srcSet={`${BASE}/hero-car-road.webp?v=15`} type="image/webp" />
          <img
            ref={plateRef}
            src={`${BASE}/hero-car-road.jpg?v=15`}
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

        <canvas
          ref={roadCanvasRef}
          className="pointer-events-none absolute inset-0 z-[5] home-radio__road-canvas"
          aria-hidden
        />

        <canvas
          ref={mirageCanvasRef}
          className="pointer-events-none absolute inset-0 z-[6] home-radio__mirage-canvas"
          aria-hidden
        />

        {/* Soft lift over the radio / centre console */}
        <div className="home-radio__radio-lift" aria-hidden />

        {/* Hierarchy: gentle periphery shade — radio stays readable */}
        <div className="home-radio__focus" aria-hidden />

        <div className="home-radio__haze" aria-hidden />
        <div className="home-radio__grain" aria-hidden />

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

        {layout && (
          <div
            className={`radio-lcd pointer-events-none absolute z-[8] flex items-center justify-center overflow-hidden${
              lcdPrompt ? " is-prompt" : ""
            }`}
            style={layout.display}
            aria-live="polite"
          >
            {lcdText ? (
              <span
                className={`radio-lcd-text${seekingVisual ? " is-seeking" : ""}`}
                key={lcdText}
              >
                {lcdText}
              </span>
            ) : null}
          </div>
        )}

        {/* Diegetic SCAN — the radio teaches the interaction */}
        {layout && awaitingScan && (
          <button
            type="button"
            className="radio-scan-hit absolute z-[14] cursor-pointer rounded-[2px]"
            style={layout.scan}
            aria-label="Press SCAN on the radio"
            onClick={onScan}
          />
        )}

        {layout && (
          <nav
            className={`absolute inset-0 z-[12]${
              seekingVisual ? " radio-seeking" : ""
            }${interactive ? "" : " pointer-events-none"}`}
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
                tabIndex={interactive ? 0 : -1}
                onMouseEnter={() => interactive && markTouched(ch.station)}
                onFocus={() => interactive && markTouched(ch.station)}
                onTouchStart={() => interactive && markTouched(ch.station)}
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
        Off Course. Concrete and Code. The rear-view mirror shows the studio
        name. The car radio searches, then asks you to press SCAN. After tuning,
        GET LOST locks and a desert heat mirage reveals Ideas become physical.
        Later GET FOUND appears on the display. Use SCAN, presets 1 to 6, or the
        text links. Reduced motion skips the sequence.
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
