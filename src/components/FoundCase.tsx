"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FoundPillNav } from "@/components/FoundPillNav";
import { FoundSmoothScroll } from "@/components/FoundSmoothScroll";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundCaseProps = {
  project: Project;
  others: Project[];
  prev: Project | null;
  next: Project | null;
};

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z";

/**
 * GET FOUND case — ZeroFrame /works/altaure layout + sticky dock.
 */
export function FoundCase({ project, others, prev, next }: FoundCaseProps) {
  const reduce = useReducedMotion();
  const gallery = (project.images.length ? project.images : [project.cover]).filter(
    (src, i, arr) => arr.indexOf(src) === i
  );
  const heroSrc =
    gallery.find((src) => src.includes("-hero.")) || project.cover;
  const boardGallery = gallery.filter((src) => src !== heroSrc);
  const blurb =
    project.summary?.split("\n\n")[0] ||
    `${project.type} — crafted so the brand gets found.`;

  return (
    <FoundSmoothScroll>
      <article className="zf-case">
        <FoundPillNav />

        <header className="zf-case__hero">
          <Image
            src={assetPath(heroSrc)}
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL={BLUR}
            className="zf-case__hero-img"
            sizes="100vw"
          />
          <div className="zf-case__hero-veil" aria-hidden />

          <div className="zf-case__panels">
            <motion.div
              className="zf-case__panel zf-case__panel--main"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="zf-case__name">{project.title}</h1>
              <p className="zf-case__blurb">{blurb}</p>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zf-case__live"
                >
                  OPEN LIVE ↗
                </a>
              )}
            </motion.div>

            <motion.aside
              className="zf-case__panel zf-case__panel--meta"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {project.client && (
                <div className="zf-case__meta-row">
                  <span>CLIENT</span>
                  <strong>{project.client.replace(/^for\s+/i, "")}</strong>
                </div>
              )}
              <div className="zf-case__meta-row">
                <span>YEAR</span>
                <strong>{project.year}</strong>
              </div>
              <div className="zf-case__meta-row">
                <span>SERVICE</span>
                <strong>{project.type}</strong>
              </div>
              {project.stack && (
                <div className="zf-case__meta-row">
                  <span>STACK</span>
                  <strong>{project.stack}</strong>
                </div>
              )}
            </motion.aside>
          </div>
        </header>

        {project.summary && (
          <section className="zf-case__about">
            <p className="zf-case__about-label">ABOUT</p>
            <div className="zf-case__about-copy">
              {project.summary.split("\n\n").map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </section>
        )}

        <section className="zf-case__gallery" aria-label="Website pitch boards">
          {boardGallery.map((src, i) => {
            const wide = src.includes("-wide.") || i === 0;
            const board = src.includes("/pitch/");
            return (
              <div
                key={`${src}-${i}`}
                className={`zf-case__shot${wide ? " is-wide" : ""}${board ? " is-board" : ""}`}
              >
                <Image
                  src={assetPath(src)}
                  alt=""
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className={board ? "object-contain" : "object-cover"}
                  sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                />
              </div>
            );
          })}
        </section>

        {others.length > 0 && (
          <section className="zf-case__others">
            <div className="zf-case__others-head">
              <h2>OTHER WORKS</h2>
              <Link href="/get-found">VIEW ALL →</Link>
            </div>
            <ul className="zf-case__others-grid">
              {others.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link href={`/get-found/${p.slug}`} className="zf-case__other">
                    <Image
                      src={assetPath(p.cover)}
                      alt=""
                      fill
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={BLUR}
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="zf-case__other-meta">
                      <p>{p.title}</p>
                      <span>
                        {p.type} · {p.year}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className="zf-case__dock" aria-label="Case navigation">
          <Link href="/get-found" className="zf-case__dock-btn">
            ← WORKS
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="zf-case__dock-btn zf-case__dock-btn--solid"
            >
              OPEN LIVE
            </a>
          ) : (
            <span className="zf-case__dock-btn zf-case__dock-btn--muted">
              {project.title}
            </span>
          )}
          {next ? (
            <Link
              href={`/get-found/${next.slug}`}
              className="zf-case__dock-btn"
            >
              NEXT →
            </Link>
          ) : prev ? (
            <Link
              href={`/get-found/${prev.slug}`}
              className="zf-case__dock-btn"
            >
              PREV →
            </Link>
          ) : (
            <Link href="/get-found" className="zf-case__dock-btn">
              ALL →
            </Link>
          )}
        </nav>
      </article>
    </FoundSmoothScroll>
  );
}
