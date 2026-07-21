"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

/** Amber LCD panel (nudged left for optical center with hand on right). */
const DISPLAY = { x0: 0.328, y0: 0.587, x1: 0.605, y1: 0.651 };

/** Image-normalized button centres under the LCD. */
const BUTTON_CX = [0.361, 0.403, 0.445, 0.487, 0.529, 0.572];
const BUTTON_CY = 0.686;
const BUTTON_W = 0.042;
const BUTTON_H = 0.038;

type Box = { left: string; top: string; width: string; height: string };

function coverLayout(vw: number, vh: number) {
  const scale = Math.max(vw / IW, vh / IH);
  const dw = IW * scale;
  const dh = IH * scale;
  const dx = (vw - dw) / 2;
  const dy = (vh - dh) / 2;

  const box = (x0: number, y0: number, x1: number, y1: number): Box => ({
    left: `${(((dx + x0 * dw) / vw) * 100).toFixed(3)}%`,
    top: `${(((dy + y0 * dh) / vh) * 100).toFixed(3)}%`,
    width: `${((((x1 - x0) * dw) / vw) * 100).toFixed(3)}%`,
    height: `${((((y1 - y0) * dh) / vh) * 100).toFixed(3)}%`,
  });

  // Road dash corridor in the windshield
  const roadY0 = dy + dh * 0.34;
  const roadY1 = dy + dh * 0.5;
  const cx = dx + dw * 0.5;
  const halfFar = dw * 0.008;
  const halfNear = dw * 0.04;
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
 * Channel 1 = GET LOST; the LCD shows the active channel label.
 */
export function HomeCanvas() {
  const roadRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [layout, setLayout] = useState<ReturnType<typeof coverLayout> | null>(
    null
  );
  const [channel, setChannel] = useState(0);

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

  const active = CHANNELS[channel];

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[#1a1a1a]"
    >
      <picture>
        <source srcSet={`${BASE}/hero-car-road.webp?v=3`} type="image/webp" />
        <img
          src={`${BASE}/hero-car-road.jpg?v=3`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover select-none"
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
        <div className="road-dash-stage">
          <div className="road-dash-track" />
        </div>
      </div>

      {layout && (
        <div
          className="radio-lcd pointer-events-none absolute z-[8] flex items-center justify-center overflow-hidden"
          style={layout.display}
          aria-live="polite"
        >
          <span className="radio-lcd-text">{active.label}</span>
        </div>
      )}

      {layout && (
        <nav className="absolute inset-0 z-[12]" aria-label="Radio channels">
          {CHANNELS.map((ch, i) => (
            <Link
              key={ch.id}
              href={ch.href}
              className="radio-channel absolute block rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea9a26]"
              style={layout.buttons[i]}
              aria-label={`Channel ${ch.id}: ${ch.label}`}
              aria-current={channel === i ? "page" : undefined}
              onMouseEnter={() => setChannel(i)}
              onFocus={() => setChannel(i)}
              onTouchStart={() => setChannel(i)}
            />
          ))}
        </nav>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-white transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />
    </section>
  );
}
