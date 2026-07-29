"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FoundPillNav } from "@/components/FoundPillNav";
import { FoundSmoothScroll } from "@/components/FoundSmoothScroll";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundWorksIndexProps = {
  projects: Project[];
};

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTIiIHhtbG5zPSJodHRwOi8vd3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTUxNTE1Ii8+PC9zdmc+";

/**
 * GET FOUND browse — ZeroFrame /works layout + Lenis smooth scroll.
 */
export function FoundWorksIndex({ projects }: FoundWorksIndexProps) {
  const reduce = useReducedMotion();

  return (
    <FoundSmoothScroll>
      <div className="zf-works">
        <FoundPillNav />

        <header className="zf-works__head">
          <div className="zf-works__titles">
            <h1 className="zf-works__title">WORKS</h1>
            <p className="zf-works__count">
              {String(projects.length).padStart(3, "0")}
            </p>
          </div>
          <p className="zf-works__tag">
            Building sites that feel as good as they look.
          </p>
        </header>

        <ul className="zf-works__grid">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <Link
                href={`/get-found/${project.slug}`}
                className="zf-works__card"
              >
                <motion.div
                  className="zf-works__card-media"
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: Math.min(i * 0.06, 0.36),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Image
                    src={assetPath(project.cover)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={i < 3}
                    loading={i < 3 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL={BLUR}
                  />
                  <div className="zf-works__card-veil" aria-hidden />
                  <div className="zf-works__card-meta">
                    <p className="zf-works__card-name">{project.title}</p>
                    <p className="zf-works__card-type">{project.type}</p>
                    <p className="zf-works__card-year">{project.year}</p>
                  </div>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </FoundSmoothScroll>
  );
}
