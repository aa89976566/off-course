"use client";

import Image from "next/image";
import Link from "next/link";

type ProjectTileProps = {
  href: string;
  title: string;
  cover: string;
  accent: string;
};

/**
 * Camille Walala project tile:
 * - square
 * - solid accent background
 * - cover image fills tile
 * - marquee title along the bottom (inside the tile)
 * - hover dims the image so colour shows through
 */
export function ProjectTile({ href, title, cover, accent }: ProjectTileProps) {
  const unit = `${title} `;
  const strip = unit.repeat(20);

  return (
    <Link
      href={href}
      aria-label={title}
      className="project-tile group relative flex aspect-square w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: accent }}
    >
      <div className="absolute inset-0 overflow-hidden transition-opacity duration-200 group-hover:opacity-50">
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      </div>

      {/* Bottom marquee — Walala pattern */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden py-1.5 text-white">
        <div className="marquee-track flex w-max">
          <span className="shrink-0 font-display text-[11px] uppercase tracking-[0.04em] md:text-xs">
            {strip}
          </span>
          <span className="shrink-0 font-display text-[11px] uppercase tracking-[0.04em] md:text-xs">
            {strip}
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[40%]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent})`,
          }}
        />
      </div>
    </Link>
  );
}
