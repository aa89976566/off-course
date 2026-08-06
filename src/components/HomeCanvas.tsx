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
const HERO_V = "16";

const PRESETS = [
  { id: 1, href: "/get-lost", station: "GET LOST" },
  { id: 2, href: "/get-found", station: "GET FOUND" },
  { id: 3, href: "/archive", station: "ARCHIVE" },
  { id: 4, href: "/about", station: "ABOUT" },
  { id: 5, href: "/contact", station: "CONTACT" },
  { id: 6, href: "mailto:hello@offcourse.studio", station: "HELLO" },
] as const;

/** Pseudo-3D camera: world Z grows away from the cabin. */
const ROAD_Z_NEAR = 1;
const ROAD_Z_FAR = 9;
/** World-space dash length and gap (constant on the asphalt plane). */
const ROAD_DASH_LEN = 0.42;
const ROAD_DASH_GAP = 0.58;

type NormBox = { x0: number; y0: number; x1: number; y1: number };

type Artboard = {
  iw: number;
  ih: number;
  sceneCx: number;
  roadY0: number;
  roadY1: number;
  dashHalfNear: number;
  roadEdgeFar: number;
  roadEdgeNear: number;
  display: NormBox;
  buttonCx: number[];
  buttonCy: number;
  buttonW: number;
  buttonH: number;
  scan: NormBox;
  mirror: NormBox;
};

/** Portrait hero (1024×1536) — phones / tall viewports. */
const PORTRAIT: Artboard = {
  iw: 1024,
  ih: 1536,
  sceneCx: 0.467,
  roadY0: 0.338,
  roadY1: 0.455,
  dashHalfNear: 0.028,
  roadEdgeFar: 0.048,
  roadEdgeNear: 0.318,
  display: { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 },
  buttonCx: [0.346, 0.394, 0.441, 0.49, 0.533, 0.584],
  buttonCy: 0.664,
  buttonW: 0.04,
  buttonH: 0.03,
  scan: { x0: 0.598, y0: 0.575, x1: 0.745, y1: 0.685 },
  mirror: { x0: 0.395, y0: 0.055, x1: 0.565, y1: 0.162 },
};

/** Wide 16:9 hero (1672×941) — desktops / landscape. */
const WIDE: Artboard = {
  iw: 1672,
  ih: 941,
  sceneCx: 0.507,
  roadY0: 0.355,
  roadY1: 0.52,
  dashHalfNear: 0.014,
  roadEdgeFar: 0.02,
  roadEdgeNear: 0.16,
  display: { x0: 0.458, y0: 0.68, x1: 0.56, y1: 0.736 },
  buttonCx: [0.463, 0.482, 0.5, 0.518, 0.536, 0.555],
  buttonCy: 0.777,
  buttonW: 0.018,
  buttonH: 0.028,
  scan: { x0: 0.544, y0: 0.723, x1: 0.64, y1: 0.81 },
  mirror: { x0: 0.43, y0: 0.015, x1: 0.57, y1: 0.135 },
};

/**
 * Landscape / square → wide art. Tall phones & portrait tablets → portrait art.
 * Matches <picture> min-aspect-ratio: 1/1.
 */
function preferWide(vw: number, vh: number) {
  return vw / vh >= 1;
}

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
  display: Box;
  buttons: Box[];
  mirror: Box;
  scan: Box;
  road: {
    cx: number;
    y0: number;
    y1: number;
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
  iw: number;
  ih: number;
  useWide: boolean;
};

/** True object-fit: cover + object-position: center — no blur sidebars / plate. */
function coverLayout(vw: number, vh: number): Layout {
  const useWide = preferWide(vw, vh);
  const art = useWide ? WIDE : PORTRAIT;
  const { iw, ih } = art;
  const scale = Math.max(vw / iw, vh / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (vw - dw) / 2;
  const dy = (vh - dh) / 2;

  const box = (x0: number, y0: number, x1: number, y1: number): Box => ({
    left: `${(((dx + x0 * dw) / vw) * 100).toFixed(3)}%`,
    top: `${(((dy + y0 * dh) / vh) * 100).toFixed(3)}%`,
    width: `${((((x1 - x0) * dw) / vw) * 100).toFixed(3)}%`,
    height: `${((((y1 - y0) * dh) / vh) * 100).toFixed(3)}%`,
  });

  return {
    display: box(
      art.display.x0,
      art.display.y0,
      art.display.x1,
      art.display.y1
    ),
    buttons: art.buttonCx.map((cxFrac) =>
      box(
        cxFrac - art.buttonW / 2,
        art.buttonCy - art.buttonH / 2,
        cxFrac + art.buttonW / 2,
        art.buttonCy + art.buttonH / 2
      )
    ),
    mirror: box(art.mirror.x0, art.mirror.y0, art.mirror.x1, art.mirror.y1),
    scan: box(art.scan.x0, art.scan.y0, art.scan.x1, art.scan.y1),
    road: {
      cx: dx + dw * art.sceneCx,
      y0: dy + dh * art.roadY0,
      y1: dy + dh * art.roadY1,
      halfNear: dw * art.dashHalfNear,
      edgeFar: dw * art.roadEdgeFar,
      edgeNear: dw * art.roadEdgeNear,
    },
    dx,
    dy,
    dw,
    dh,
    vw,
    vh,
    iw,
    ih,
    useWide,
  };
}

/**
 * Pseudo-3D centre line (Lou / Jake Gordon style).
 * Dashes live in world Z; screen size = worldWidth / Z so marks
 * converge cleanly to the vanishing point — not stacked screen trapezoids.
 */
function paintRoad(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  scroll: number,
  moving: boolean
) {
  const { cx, y0, y1, halfNear, edgeFar, edgeNear } = layout.road;
  const band = y1 - y0;
  if (band < 4) return;

  ctx.clearRect(0, 0, layout.vw, layout.vh);
  ctx.save();

  // Slightly above asphalt start = optical vanishing point
  const vpY = y0 - Math.max(4, band * 0.06);

  ctx.beginPath();
  ctx.moveTo(cx - edgeFar * 0.5, y0);
  ctx.lineTo(cx + edgeFar * 0.5, y0);
  ctx.lineTo(cx + edgeNear * 0.42, y1);
  ctx.lineTo(cx - edgeNear * 0.42, y1);
  ctx.closePath();
  ctx.clip();

  const invNear = 1 / ROAD_Z_NEAR;
  const invFar = 1 / ROAD_Z_FAR;
  // World half-width chosen so the near lip matches layout.halfNear
  const worldHalf = halfNear * ROAD_Z_NEAR;

  const project = (z: number) => {
    const zz = Math.max(ROAD_Z_NEAR * 0.85, z);
    const inv = 1 / zz;
    // t=0 at near cabin, t=1 at horizon
    const t = (inv - invNear) / (invFar - invNear);
    const y = y1 + (vpY - y1) * Math.min(1.05, Math.max(-0.05, t));
    const half = worldHalf * inv;
    return { y, half, t, inv };
  };

  const period = ROAD_DASH_LEN + ROAD_DASH_GAP;
  // scroll advances in world-Z units; dashes rush toward the camera
  const offset = moving ? ((scroll % period) + period) % period : period * 0.15;

  // Draw far → near so nearer paint sits on top
  const zStart = ROAD_Z_FAR + period;
  const zEnd = ROAD_Z_NEAR - period;

  let idx = 0;
  for (let z = zStart; z > zEnd; z -= period, idx++) {
    const zFarDash = z - offset;
    const zNearDash = zFarDash - ROAD_DASH_LEN;
    if (zNearDash >= ROAD_Z_FAR || zFarDash <= ROAD_Z_NEAR * 0.9) continue;

    const zA = Math.min(ROAD_Z_FAR, Math.max(ROAD_Z_NEAR, zFarDash));
    const zB = Math.min(ROAD_Z_FAR, Math.max(ROAD_Z_NEAR, zNearDash));
    if (zA - zB < 0.04) continue;

    const a = project(zA); // farther
    const b = project(zB); // nearer
    if (b.y - a.y < 0.7) continue;

    // Deterministic asphalt wear (still on the plane — not jittering off-axis)
    const wearL = 0.78 + ((idx * 13) % 9) * 0.02;
    const wearR = 0.78 + ((idx * 29) % 9) * 0.02;

    const ax0 = cx - a.half * wearL;
    const ax1 = cx + a.half * wearR;
    const bx0 = cx - b.half * wearL;
    const bx1 = cx + b.half * wearR;

    // Depth cue: desaturate + fade toward horizon
    const depth = Math.min(1, Math.max(0, 1 - a.t));
    const alpha = 0.18 + depth * 0.7;
    const r = Math.round(142 + depth * 68);
    const g = Math.round(100 + depth * 48);
    const bl = Math.round(14 + depth * 16);

    const body = ctx.createLinearGradient(ax0, a.y, ax1, a.y);
    body.addColorStop(0, `rgba(${r - 30}, ${g - 22}, ${bl}, ${alpha * 0.65})`);
    body.addColorStop(0.5, `rgba(${r}, ${g}, ${bl}, ${alpha})`);
    body.addColorStop(1, `rgba(${r - 30}, ${g - 22}, ${bl}, ${alpha * 0.65})`);
    ctx.fillStyle = body;

    ctx.beginPath();
    ctx.moveTo(ax0, a.y);
    ctx.lineTo(ax1, a.y);
    ctx.lineTo(bx1, b.y);
    ctx.lineTo(bx0, b.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(42, 30, 10, ${0.1 + depth * 0.32})`;
    ctx.lineWidth = 0.35 + depth * 1.4;
    ctx.stroke();
  }

  // Horizon atmosphere over far asphalt
  const haze = ctx.createLinearGradient(0, y0, 0, y0 + band * 0.55);
  haze.addColorStop(0, "rgba(200, 182, 155, 0.38)");
  haze.addColorStop(0.55, "rgba(200, 182, 155, 0.1)");
  haze.addColorStop(1, "rgba(200, 182, 155, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(cx - edgeNear * 0.5, y0, edgeNear, band * 0.55);

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
      const sx = ((x0 - dx) / dw) * layout.iw;
      const sy = ((yy0 - dy) / dh) * layout.ih;
      const sw = (bw / dw) * layout.iw;
      const sh = (bh / dh) * layout.ih;
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

  const tw = Math.max(8, Math.floor(Math.min(bw * 1.15, vw * 0.5, Math.max(160, bh * 2.2))));
  const th = Math.max(28, Math.floor(Math.max(bh * 0.55, Math.min(56, vw * 0.04))));
  mirageTextOff = ensureCanvas(mirageTextOff, tw, th);
  const tctx = mirageTextOff.getContext("2d");
  if (!tctx) return;

  tctx.clearRect(0, 0, tw, th);
  tctx.fillStyle = `rgba(248, 240, 225, ${0.62 + readable * 0.32})`;
  const family =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-archivo-black")
      .trim() || "sans-serif";
  const fontPx = Math.max(13, Math.min(tw * 0.072, th * 0.42));
  tctx.font = `700 ${fontPx}px ${family}, sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText(line.toUpperCase(), tw / 2, th / 2);

  const tx = cx - tw / 2;
  const ty = y0 + (y1 - y0) * 0.22;

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
  const awaitingScanRef = useRef(false);

  useEffect(() => {
    awaitingScanRef.current = awaitingScan;
  }, [awaitingScan]);

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
      scrollRef.current += dt * 1.35;
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
    awaitingScanRef.current = false;
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

  const runAfterScanRef = useRef(runAfterScan);
  runAfterScanRef.current = runAfterScan;

  // Opening sequence — SEARCHING → PRESS SCAN, then wait for SCAN (or auto-continue)
  useEffect(() => {
    if (!ready) return;

    if (reduceMotion) {
      setMirrorOn(true);
      setLcdText(HOME.radio.settled);
      setPhase("settle");
      setInteractive(true);
      setAwaitingScan(false);
      awaitingScanRef.current = false;
      setRoadMoving(false);
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    scannedRef.current = false;
    touchedRef.current = false;
    awaitingScanRef.current = false;
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
    // After 3s of SEARCHING → PRESS SCAN
    at(3900, () => {
      if (touchedRef.current || scannedRef.current) return;
      setPhase("await-scan");
      setLcdText(HOME.radio.pressScan);
      setSeekingVisual(false);
      setAwaitingScan(true);
      awaitingScanRef.current = true;
    });
    // Auto-continue if the visitor does not press SCAN — mirage must still play
    at(3900 + 4500, () => {
      if (scannedRef.current || touchedRef.current) return;
      if (!awaitingScanRef.current) return;
      runAfterScanRef.current();
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [ready, reduceMotion]);

  // Escape skips; accidental trackpad wheel must NOT abort the radio story
  useEffect(() => {
    if (!ready || reduceMotion || interactive) return;
    const onKey = (e: Event) => {
      if ((e as globalThis.KeyboardEvent).key !== "Escape") return;
      if (interactive) return;
      touchedRef.current = true;
      scannedRef.current = true;
      clearPostScan();
      setMirrorOn(true);
      setAwaitingScan(false);
      awaitingScanRef.current = false;
      setMirageOn(false);
      setSeekingVisual(false);
      finishToSettle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, reduceMotion, interactive, finishToSettle]);

  const onScan = () => {
    if (!awaitingScanRef.current || scannedRef.current) return;
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
      }${mirageOn ? " is-mirage" : ""}${
        layout?.useWide ? " is-wide-art" : " is-portrait-art"
      }`}
      onKeyDown={onKeyNav}
      tabIndex={0}
    >
      <div
        className={`home-radio__scene${ready ? " is-live" : ""}${
          layout?.useWide ? " is-wide" : ""
        }`}
      >
        <picture>
          <source
            media="(min-aspect-ratio: 1/1)"
            srcSet={`${BASE}/hero-car-road-wide.webp?v=${HERO_V}`}
            type="image/webp"
          />
          <source
            media="(min-aspect-ratio: 1/1)"
            srcSet={`${BASE}/hero-car-road-wide.jpg?v=${HERO_V}`}
          />
          <source
            srcSet={`${BASE}/hero-car-road.webp?v=${HERO_V}`}
            type="image/webp"
          />
          <img
            ref={plateRef}
            src={`${BASE}/hero-car-road.jpg?v=${HERO_V}`}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center home-radio__plate"
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
          className="pointer-events-none absolute inset-0 z-[8] home-radio__mirage-canvas"
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

        {/* Diegetic SCAN — printed SCAN control (+ LCD as secondary hit while prompting) */}
        {layout && awaitingScan && (
          <>
            <button
              type="button"
              className="radio-scan-hit absolute z-[14] cursor-pointer rounded-[2px]"
              style={layout.scan}
              aria-label="Press SCAN on the radio"
              onClick={onScan}
            />
            <button
              type="button"
              className="radio-scan-hit radio-scan-hit--lcd absolute z-[14] cursor-pointer"
              style={layout.display}
              aria-label="Press SCAN — radio is waiting"
              onClick={onScan}
            />
          </>
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
        If you do not press SCAN, the radio continues on its own. Later GET FOUND
        appears on the display. Use SCAN, Enter, presets 1 to 6, or the text
        links. Escape skips. Reduced motion skips the sequence.
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
