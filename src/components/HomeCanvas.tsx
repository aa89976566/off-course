"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { HOME, WORLDS } from "@/lib/content";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const IW = 1024;
const IH = 1536;

/**
 * Physical preset keys — destinations exist, but labels are NOT painted
 * on the buttons. The LCD reveals stations through a search narrative.
 */
const PRESETS = [
  { id: 1, href: "/get-lost", station: "GET LOST" },
  { id: 2, href: "/get-found", station: "GET FOUND" },
  { id: 3, href: "/archive", station: "ARCHIVE" },
  { id: 4, href: "/about", station: "ABOUT" },
  { id: 5, href: "/contact", station: "CONTACT" },
  { id: 6, href: "mailto:hello@offcourse.studio", station: "HELLO" },
] as const;

const SCENE_CX = 0.466;
const DISPLAY = { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 };
const BUTTON_CX = [0.346, 0.394, 0.441, 0.49, 0.533, 0.584];
const BUTTON_CY = 0.664;
const BUTTON_W = 0.04;
const BUTTON_H = 0.03;

type Box = { left: string; top: string; width: string; height: string };

type Phase =
  | "boot"
  | "static"
  | "seek-lost"
  | "lock-lost"
  | "seek-found"
  | "lock-found"
  | "settle";

function coverLayout(vw: number, vh: number) {
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

  const roadY0 = dy + dh * 0.31;
  const roadY1 = dy + dh * 0.438;
  const cx = dx + dw * SCENE_CX;
  const halfFar = dw * 0.007;
  const halfNear = dw * 0.028;
  const pct = (x: number, y: number) =>
    `${((x / vw) * 100).toFixed(3)}% ${((y / vh) * 100).toFixed(3)}%`;
  const roadClip = `polygon(${[
    pct(cx - halfFar, roadY0),
    pct(cx + halfFar, roadY0),
    pct(cx + halfNear, roadY1),
    pct(cx - halfNear, roadY1),
  ].join(", ")})`;

  return {
    roadClip,
    roadStage: {
      left: `${cx - halfNear}px`,
      top: `${roadY0}px`,
      width: `${halfNear * 2}px`,
      height: `${roadY1 - roadY0}px`,
    },
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
  };
}

/**
 * Car-radio entrance — frequency search narrative.
 * Worlds emerge as locked stations; presets stay unlabeled.
 */
export function HomeCanvas() {
  const roadRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<ReturnType<typeof coverLayout> | null>(
    null
  );
  const [phase, setPhase] = useState<Phase>("boot");
  const [lcdText, setLcdText] = useState<string>(HOME.radio.boot);
  const [statement, setStatement] = useState<string | null>(null);
  const [brandLine, setBrandLine] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const touchedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const road = roadRef.current;
    if (!section || !road) return;

    const sync = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      if (w < 1 || h < 1) return;
      const next = coverLayout(w, h);
      setLayout(next);
      road.style.clipPath = next.roadClip;
      road.style.setProperty("-webkit-clip-path", next.roadClip);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(section);
    window.addEventListener("orientationchange", sync);
    const t = window.setTimeout(() => setReady(true), 2200);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
      window.clearTimeout(t);
    };
  }, []);

  // Narrative sequence — inevitable pacing, skipped for reduced motion.
  useEffect(() => {
    if (!ready) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setLcdText(HOME.radio.settled);
      setStatement(null);
      setBrandLine(true);
      setPhase("settle");
      setInteractive(true);
      setSeeking(false);
      return;
    }

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    // 1. OFF_COURSE
    setPhase("boot");
    setLcdText(HOME.radio.boot);
    setBrandLine(true);

    // 2. Static / tuning
    at(1400, () => {
      if (touchedRef.current) return;
      setPhase("static");
      setSeeking(true);
      setLcdText(HOME.radio.static);
    });
    at(2400, () => {
      if (touchedRef.current) return;
      setLcdText(HOME.radio.tuning);
    });

    // 3–4. Lock GET LOST
    at(3400, () => {
      if (touchedRef.current) return;
      setPhase("seek-lost");
      setLcdText(HOME.radio.seek);
    });
    at(4200, () => {
      if (touchedRef.current) return;
      setPhase("lock-lost");
      setSeeking(false);
      setLcdText(HOME.radio.lockLost);
      setStatement(WORLDS.lost.statement);
    });

    // 5–7. Continue → lock GET FOUND
    at(7000, () => {
      if (touchedRef.current) return;
      setPhase("seek-found");
      setSeeking(true);
      setStatement(null);
      setLcdText(HOME.radio.seek);
    });
    at(8200, () => {
      if (touchedRef.current) return;
      setLcdText(HOME.radio.static);
    });
    at(9000, () => {
      if (touchedRef.current) return;
      setPhase("lock-found");
      setSeeking(false);
      setLcdText(HOME.radio.lockFound);
      setStatement(WORLDS.found.statement);
    });

    // 8. Settle
    at(11800, () => {
      if (touchedRef.current) return;
      setPhase("settle");
      setLcdText(HOME.radio.settled);
      setStatement(null);
      setInteractive(true);
      setSeeking(false);
    });

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [ready]);

  const markTouched = (station: string) => {
    touchedRef.current = true;
    setSeeking(false);
    setInteractive(true);
    setPhase("settle");
    setLcdText(station);
    if (station === "GET LOST") setStatement(WORLDS.lost.statement);
    else if (station === "GET FOUND") setStatement(WORLDS.found.statement);
    else setStatement(null);
  };

  const onKeyNav = (e: KeyboardEvent<HTMLElement>) => {
    if (!interactive && phase !== "settle") return;
    const n = Number(e.key);
    if (n >= 1 && n <= 6) {
      const preset = PRESETS[n - 1];
      markTouched(preset.station);
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`home-radio relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a] phase-${phase}`}
      onKeyDown={onKeyNav}
    >
      <picture>
        <source srcSet={`${BASE}/hero-car-road.webp?v=12`} type="image/webp" />
        <img
          src={`${BASE}/hero-car-road.jpg?v=12`}
          alt=""
          className={
            layout
              ? "pointer-events-none absolute max-w-none select-none"
              : "pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
          }
          style={layout?.image}
          draggable={false}
          decoding="async"
          fetchPriority="high"
          onLoad={() => setReady(true)}
        />
      </picture>

      <div
        ref={roadRef}
        className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
        aria-hidden
      >
        <div className="road-dash-stage" style={layout?.roadStage}>
          <div className="road-dash-track" />
        </div>
      </div>

      {layout && (
        <div
          className="radio-lcd pointer-events-none absolute z-[8] flex items-center justify-center overflow-hidden"
          style={layout.display}
          aria-live="polite"
        >
          <span
            className={`radio-lcd-text${seeking ? " is-seeking" : ""}`}
            key={lcdText}
          >
            {lcdText}
          </span>
        </div>
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

      {/* Overlay copy — philosophy without large paragraphs */}
      <div className="home-radio__overlay" aria-live="polite">
        {brandLine && (
          <p className="home-radio__brand">
            <span>OFF_COURSE</span>
            <span className="home-radio__tag">Concrete &amp; Code</span>
          </p>
        )}
        {statement && (
          <p className="home-radio__statement" key={statement}>
            {statement}
          </p>
        )}
      </div>

      {/* Accessible fallback — never depend only on experimentation */}
      <div className="home-radio__fallback">
        <Link href="/get-lost">{WORLDS.lost.label}</Link>
        <span aria-hidden>·</span>
        <Link href="/get-found">{WORLDS.found.label}</Link>
        <span aria-hidden>·</span>
        <a href="#home-editorial">{HOME.continueLabel}</a>
      </div>

      <p className="sr-only">
        Off Course. Concrete and Code. The car radio searches frequencies.
        GET LOST — ideas become physical. GET FOUND — ideas become accessible.
        Use presets 1 to 6, or the text links, to navigate. Prefer reduced
        motion skips the search animation.
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
