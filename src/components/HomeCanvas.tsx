"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Portrait hero art (radio-centered). */
const IW = 1024;
const IH = 1536;

/** Radio presets → site menu. Channel 1 opens GET LOST. */
const CHANNELS = [
  { id: 1, label: "GET LOST", href: "/get-lost" },
  { id: 2, label: "GET FOUND", href: "/get-found" },
  { id: 3, label: "PROJECTS", href: "/projects" },
  { id: 4, label: "ABOUT", href: "/about" },
  { id: 5, label: "START", href: "/start" },
  { id: 6, label: "HELLO", href: "mailto:hello@offcourse.studio" },
] as const;

/**
 * Scene axis in the art (LCD / logo / road). Pinned to the viewport
 * midline so the radio sits in the exact screen center.
 */
const SCENE_CX = 0.466;

/** Amber LCD panel in image-normalized coords. */
const DISPLAY = { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 };

/** Image-normalized button centres under the LCD (aligned to printed 1–6). */
const BUTTON_CX = [0.346, 0.394, 0.441, 0.49, 0.533, 0.584];
const BUTTON_CY = 0.664;
const BUTTON_W = 0.04;
const BUTTON_H = 0.03;

type Box = { left: string; top: string; width: string; height: string };

function coverLayout(vw: number, vh: number) {
  const scale = Math.max(vw / IW, vh / IH);
  const dw = IW * scale;
  const dh = IH * scale;
  // Pin the scene axis to the viewport center (moves radio left into place).
  const dx = vw / 2 - SCENE_CX * dw;
  const dy = (vh - dh) / 2;

  const box = (x0: number, y0: number, x1: number, y1: number): Box => ({
    left: `${(((dx + x0 * dw) / vw) * 100).toFixed(3)}%`,
    top: `${(((dy + y0 * dh) / vh) * 100).toFixed(3)}%`,
    width: `${((((x1 - x0) * dw) / vw) * 100).toFixed(3)}%`,
    height: `${((((y1 - y0) * dh) / vh) * 100).toFixed(3)}%`,
  });

  // Road dashes: only on asphalt inside the windshield (never over dash/pillars)
  const roadY0 = dy + dh * 0.31; // near horizon
  const roadY1 = dy + dh * 0.438; // stop above dashboard hood / wipers
  const cx = dx + dw * SCENE_CX;
  const halfFar = dw * 0.007;
  const halfNear = dw * 0.028; // keep centerline slim so marks stay on asphalt
  const pct = (x: number, y: number) =>
    `${((x / vw) * 100).toFixed(3)}% ${((y / vh) * 100).toFixed(3)}%`;
  const roadClip = `polygon(${[
    pct(cx - halfFar, roadY0),
    pct(cx + halfFar, roadY0),
    pct(cx + halfNear, roadY1),
    pct(cx - halfNear, roadY1),
  ].join(", ")})`;

  // Stage box = trapezoid AABB (dashes scroll inside, clipped to road)
  const stageLeft = cx - halfNear;
  const stageTop = roadY0;
  const stageW = halfNear * 2;
  const stageH = roadY1 - roadY0;

  return {
    roadClip,
    roadStage: {
      left: `${stageLeft}px`,
      top: `${stageTop}px`,
      width: `${stageW}px`,
      height: `${stageH}px`,
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
 * Car-interior hero: centered radio is the site menu.
 * Channel 1 = GET LOST; the LCD coaches the first interaction in-radio.
 */
export function HomeCanvas() {
  const roadRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<ReturnType<typeof coverLayout> | null>(
    null
  );
  const [channel, setChannel] = useState(0);
  const [lcdText, setLcdText] = useState("GET LOST");
  const [seekPulse, setSeekPulse] = useState(false);
  const [hinting, setHinting] = useState(true);
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
    const t = window.setTimeout(() => setReady(true), 600);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
      window.clearTimeout(t);
    };
  }, []);

  // Diegetic coach: LCD copy + one "station seek" pulse across presets.
  useEffect(() => {
    if (!ready || !hinting) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setLcdText("GET LOST");
      setHinting(false);
      return;
    }

    const script = ["TUNE IN", "SEEK 1–6", "GET LOST"] as const;
    let i = 0;
    setLcdText(script[0]);
    setSeekPulse(true);

    const iv = window.setInterval(() => {
      i += 1;
      if (i >= script.length) {
        window.clearInterval(iv);
        setSeekPulse(false);
        setHinting(false);
        if (!touchedRef.current) {
          setChannel(0);
          setLcdText(CHANNELS[0].label);
        }
        return;
      }
      setLcdText(script[i]);
    }, 1400);

    const stopPulse = window.setTimeout(() => setSeekPulse(false), 4200);

    return () => {
      window.clearInterval(iv);
      window.clearTimeout(stopPulse);
    };
  }, [ready, hinting]);

  // If idle too long, whisper once more through the LCD.
  useEffect(() => {
    if (!ready || hinting) return;
    let backTimer = 0;
    const idle = window.setTimeout(() => {
      if (touchedRef.current) return;
      setLcdText("PRESS 1–6");
      setSeekPulse(true);
      backTimer = window.setTimeout(() => {
        setSeekPulse(false);
        if (!touchedRef.current) {
          setLcdText(CHANNELS[channel].label);
        }
      }, 2200);
    }, 9000);
    return () => {
      window.clearTimeout(idle);
      window.clearTimeout(backTimer);
    };
  }, [ready, hinting, channel]);

  const markTouched = (i: number) => {
    touchedRef.current = true;
    setHinting(false);
    setSeekPulse(false);
    setChannel(i);
    setLcdText(CHANNELS[i].label);
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a]"
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
          <span className="radio-lcd-text" key={lcdText}>
            {lcdText}
          </span>
        </div>
      )}

      {layout && (
        <nav
          className={`absolute inset-0 z-[12]${seekPulse ? " radio-seeking" : ""}`}
          aria-label="Radio channels — press presets 1 to 6"
        >
          {CHANNELS.map((ch, i) => (
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
              aria-label={`Channel ${ch.id}: ${ch.label}`}
              aria-current={channel === i ? "page" : undefined}
              onMouseEnter={() => markTouched(i)}
              onFocus={() => markTouched(i)}
              onTouchStart={() => markTouched(i)}
            />
          ))}
        </nav>
      )}

      <p className="sr-only">
        The car radio is the menu. Press presets 1 through 6 to navigate, or use
        the header links.
      </p>

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />
    </section>
  );
}
