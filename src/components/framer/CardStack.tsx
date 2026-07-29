"use client";

/**
 * Port of Framer module:
 * https://framer.com/m/CardStack-OuhS.js@1RaielqCLjljis9tIHVX
 * Source: framerusercontent.com/modules/mLr8mQLivdEFL2NEYj15/1RaielqCLjljis9tIHVX/CardStack.js
 *
 * Controlled order: parent owns image sequence; drag end calls onCycle.
 */

import { useMemo, type CSSProperties, type HTMLAttributes } from "react";
import { motion } from "framer-motion";

export type CardStackImage =
  | string
  | {
      src: string;
      alt?: string;
    };

export type CardStackProps = {
  images?: CardStackImage[];
  /** Vertical shift between cards, percent of height. */
  offset?: number;
  scaleStep?: number;
  dimStep?: number;
  stiff?: number;
  damp?: number;
  ratio?: string;
  borderRadius?: number;
  style?: CSSProperties;
  className?: string;
  /** Front card flicked → parent should move index 0 to the end. */
  onCycle?: () => void;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

type CardObj = { id: string; src: string; alt: string };

const placeholderSrc =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect fill='#ddd' width='160' height='90'/><path d='M0 0L160 90M160 0L0 90' stroke='#aaa' stroke-width='4'/></svg>`
  );

function normalize(images: CardStackImage[]): CardObj[] {
  const list = images.length
    ? images
    : [{ src: placeholderSrc, alt: "Placeholder" }];
  return list.map((img, i) => {
    if (typeof img === "string") {
      return { id: img, src: img, alt: `Card ${i + 1}` };
    }
    return {
      id: img.src,
      src: img.src,
      alt: img.alt || `Card ${i + 1}`,
    };
  });
}

export function CardStack({
  images = [],
  offset = 10,
  scaleStep = 0.06,
  dimStep = 0.15,
  stiff = 170,
  damp = 26,
  ratio = "16 / 9",
  borderRadius = 8,
  style = {},
  className,
  onCycle,
  ...rest
}: CardStackProps) {
  const cards = useMemo(() => normalize(images), [images]);

  const spring =
    stiff || damp
      ? { type: "spring" as const, stiffness: stiff, damping: damp }
      : undefined;

  const wrapperStyle: CSSProperties = {
    ...style,
    position: "relative",
    width: style.width ?? "100%",
    aspectRatio: ratio,
    overflow: "visible",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  };
  delete (wrapperStyle as { height?: unknown }).height;

  return (
    <div {...rest} className={className} style={wrapperStyle} data-cardstack="">
      <ul
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
        }}
      >
        {cards.map(({ id, src, alt }, i) => {
          const front = i === 0;
          const brightness = Math.max(0.1, 1 - i * dimStep);
          const baseZ = cards.length - i;
          return (
            <motion.li
              key={id}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius,
                listStyle: "none",
                cursor: front ? "grab" : "auto",
                overflow: "hidden",
                touchAction: "none",
                zIndex: baseZ,
                boxShadow: front
                  ? "0 22px 50px rgba(0,0,0,0.22), 0 6px 14px rgba(0,0,0,0.1)"
                  : "0 10px 28px rgba(0,0,0,0.12)",
                transition: "box-shadow 0.3s cubic-bezier(.4,0,.2,1)",
              }}
              animate={{
                top: `calc(${i * -offset}%)`,
                scale: 1 - i * scaleStep,
                filter: `brightness(${brightness})`,
                zIndex: baseZ,
                transition: spring,
              }}
              drag={front ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.65}
              dragMomentum={false}
              onDragEnd={() => {
                if (front) onCycle?.();
              }}
              whileDrag={
                front
                  ? {
                      zIndex: cards.length + 1,
                      cursor: "grabbing",
                      scale: 1 - i * scaleStep + 0.05,
                      rotate: 2,
                    }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  display: "block",
                  transition: "filter 0.3s cubic-bezier(.4,0,.2,1)",
                }}
                draggable={false}
              />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
