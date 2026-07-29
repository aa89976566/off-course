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
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGEwYTBhIi8+PC9zdmc+";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * GET FOUND case — clean editorial structure for website pitch boards.
 * Hero media → intro/facts → gallery → optional about → other works → dock.
 */
export function FoundCase({ project, others, prev, next }: FoundCaseProps) {
  const reduce = useReducedMotion();
  const gallery = (project.images.length ? project.images : [project.cover]).filter(
    (src, i, arr) => arr.indexOf(src) === i
  );

  const heroSrc =
    gallery.find((src) => src.includes("-hero.")) ||
    gallery.find((src) => src.includes("-wide.")) ||
    project.cover;

  // Prefer pitch boards in a deliberate rhythm; keep one non-pitch as closer.
  const boards = gallery.filter(
    (src) => src.includes("/pitch/") && src !== heroSrc
  );
  const extras = gallery.filter(
    (src) => !src.includes("/pitch/") && src !== heroSrc
  );
  const ordered = [
    ...boards.filter((s) => s.includes("-wide.")),
    ...boards.filter((s) => s.includes("-cover.")),
    ...boards.filter((s) => !s.includes("-wide.") && !s.includes("-cover.")),
    ...extras.slice(0, 1),
  ];

  const paragraphs = (project.summary || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const blurb =
    paragraphs[0] || `${project.type} — crafted so the brand gets found.`;
  const aboutCopy = paragraphs.slice(1);
  const client = project.client?.replace(/^for\s+/i, "") || null;

  const facts = [
    client ? { label: "Client", value: client } : null,
    { label: "Year", value: project.year },
    { label: "Service", value: project.type },
    project.stack ? { label: "Stack", value: project.stack } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <FoundSmoothScroll>
      <article className="zf-case">
        <FoundPillNav />

        <header className="zf-case__hero">
          <div className="zf-case__hero-frame">
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
          </div>
        </header>

        <section className="zf-case__intro">
          <motion.div
            className="zf-case__intro-copy"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="zf-case__kicker">Case study</p>
            <h1 className="zf-case__name">{project.title}</h1>
            <p className="zf-case__blurb">{blurb}</p>
          </motion.div>

          <motion.dl
            className="zf-case__facts"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease }}
          >
            {facts.map((fact) => (
              <div key={fact.label} className="zf-case__fact">
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </motion.dl>
        </section>

        <section className="zf-case__gallery" aria-label="Project visuals">
          {ordered.map((src, i) => {
            const wide = src.includes("-wide.") || i === 0;
            const board = src.includes("/pitch/");
            return (
              <motion.div
                key={`${src}-${i}`}
                className={`zf-case__shot${wide ? " is-wide" : ""}${board ? " is-board" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease }}
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
              </motion.div>
            );
          })}
        </section>

        {aboutCopy.length > 0 && (
          <section className="zf-case__about">
            <p className="zf-case__about-label">About</p>
            <div className="zf-case__about-copy">
              {aboutCopy.map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="zf-case__others">
            <div className="zf-case__others-head">
              <h2>Other works</h2>
              <Link href="/get-found">View all →</Link>
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
            ← Works
          </Link>
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="zf-case__dock-btn zf-case__dock-btn--solid"
            >
              Open live
            </a>
          ) : next ? (
            <Link
              href={`/get-found/${next.slug}`}
              className="zf-case__dock-btn zf-case__dock-btn--solid"
            >
              Next project
            </Link>
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
              Next →
            </Link>
          ) : prev ? (
            <Link
              href={`/get-found/${prev.slug}`}
              className="zf-case__dock-btn"
            >
              Prev →
            </Link>
          ) : (
            <Link href="/get-found" className="zf-case__dock-btn">
              All →
            </Link>
          )}
        </nav>
      </article>
    </FoundSmoothScroll>
  );
}
