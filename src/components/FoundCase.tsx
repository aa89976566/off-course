"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FoundPillNav } from "@/components/FoundPillNav";
import { FoundSmoothScroll } from "@/components/FoundSmoothScroll";
import type { Project, ProjectPitchBoard } from "@/lib/projects";
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
 * GET FOUND case — agency-style pitch:
 * media → snapshot → challenge/influence → features → labeled boards → outcomes.
 */
export function FoundCase({ project, others, prev, next }: FoundCaseProps) {
  const reduce = useReducedMotion();
  const pitch = project.pitch;

  const fallbackGallery = (
    project.images.length ? project.images : [project.cover]
  ).filter((src, i, arr) => arr.indexOf(src) === i);

  const heroSrc =
    pitch?.boards?.[0]?.src ||
    fallbackGallery.find((src) => src.includes("-hero.")) ||
    fallbackGallery.find((src) => src.includes("-wide.")) ||
    project.cover;

  const boards: ProjectPitchBoard[] =
    pitch?.boards?.filter((b) => b.src !== heroSrc) ||
    fallbackGallery
      .filter((src) => src !== heroSrc)
      .map((src, i) => ({
        src,
        label: `0${i + 1}`,
        caption: undefined,
      }));

  const paragraphs = (project.summary || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const blurb =
    pitch?.hook ||
    paragraphs[0] ||
    `${project.type} — crafted so the brand gets found.`;
  const client = project.client?.replace(/^for\s+/i, "") || null;

  const facts = [
    client ? { label: "Client", value: client } : null,
    { label: "Year", value: project.year },
    { label: "Service", value: project.type },
    project.stack ? { label: "Stack", value: project.stack } : null,
    project.location ? { label: "Locale", value: project.location } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const hasStory = Boolean(
    pitch?.challenge || pitch?.influence || pitch?.features?.length
  );

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

        {hasStory && (
          <section className="zf-case__story" aria-label="Project narrative">
            {pitch?.challenge && (
              <div className="zf-case__story-block">
                <p className="zf-case__section-label">Challenge</p>
                <p>{pitch.challenge}</p>
              </div>
            )}
            {pitch?.influence && (
              <div className="zf-case__story-block">
                <p className="zf-case__section-label">Client influence</p>
                <p>{pitch.influence}</p>
              </div>
            )}
          </section>
        )}

        {pitch?.features && pitch.features.length > 0 && (
          <section className="zf-case__features" aria-label="Platform functions">
            <div className="zf-case__features-head">
              <p className="zf-case__section-label">What the site does</p>
              <h2>Functions built into the platform</h2>
            </div>
            <ul className="zf-case__feature-list">
              {pitch.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="zf-case__gallery" aria-label="Project visuals">
          <div className="zf-case__gallery-head">
            <p className="zf-case__section-label">Visual proof</p>
            <h2>Different surfaces, different jobs</h2>
          </div>
          {boards.map((board, i) => {
            const wide =
              board.src.includes("-wide.") ||
              board.src.includes("-about.") ||
              board.src.includes("-detail.") ||
              i === 0;
            const framed = board.src.includes("/pitch/");
            return (
              <motion.figure
                key={`${board.src}-${i}`}
                className={`zf-case__shot${wide ? " is-wide" : ""}${framed ? " is-board" : ""}`}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.65, ease }}
              >
                <Image
                  src={assetPath(board.src)}
                  alt={board.caption || board.label}
                  fill
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className={framed ? "object-contain" : "object-cover"}
                  sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                />
                {(board.label || board.caption) && (
                  <figcaption className="zf-case__shot-cap">
                    {board.label && <span>{board.label}</span>}
                    {board.caption && <p>{board.caption}</p>}
                  </figcaption>
                )}
              </motion.figure>
            );
          })}
        </section>

        {pitch?.outcomes && pitch.outcomes.length > 0 && (
          <section className="zf-case__outcomes" aria-label="Outcomes">
            <p className="zf-case__section-label">After effect</p>
            <h2>What changed for the client</h2>
            <ul>
              {pitch.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {!pitch && paragraphs.length > 1 && (
          <section className="zf-case__about">
            <p className="zf-case__about-label">About</p>
            <div className="zf-case__about-copy">
              {paragraphs.slice(1).map((para) => (
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
