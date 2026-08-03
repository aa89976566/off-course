import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import {
  getProjectCode,
  type Project,
  type ProjectPitchBoard,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundCaseStudyProps = {
  project: Project;
  others: Project[];
  prev: Project | null;
  next: Project | null;
};

const ARTWORK_HINT = /detail|process|about|jieshin-|sculpture|work/i;

/**
 * GET FOUND case — artist / place first, system later.
 * Especially for Jieshin: publication before UI review.
 */
export function FoundCaseStudy({
  project,
  others,
  prev,
  next,
}: FoundCaseStudyProps) {
  const pitch = project.pitch;
  const code = getProjectCode(project);
  const client = project.client?.replace(/^for\s+/i, "") || null;

  const allSrc = (
    pitch?.boards?.map((b) => b.src) ||
    (project.images.length ? project.images : [project.cover])
  ).filter((src, i, arr) => arr.indexOf(src) === i);

  const artworkList =
    project.artwork && project.artwork.length > 0
      ? project.artwork
      : allSrc.filter(
          (s) =>
            ARTWORK_HINT.test(s) &&
            !/cover|hero|wide|board|pitch/i.test(s)
        );

  const artworkSrc = artworkList[0] || allSrc[0] || project.cover;
  const secondaryArt = artworkList.slice(1, 3);

  const systemBoards: ProjectPitchBoard[] =
    pitch?.boards?.filter((b) => !artworkList.includes(b.src)) ||
    allSrc
      .filter((s) => !artworkList.includes(s))
      .map((src, i) => ({
        src,
        label: `System ${String(i + 1).padStart(2, "0")}`,
      }));

  const hook =
    pitch?.hook ||
    project.summary?.split("\n\n")[0] ||
    `${project.type} — crafted so the work can be found.`;

  return (
    <article className="case-study">
      <header className="case-study__header">
        <p className="ed-meta">
          {code}
          <span aria-hidden> · </span>
          {WORLDS.found.label}
          <span aria-hidden> · </span>
          Signal locked
        </p>
        <h1 className="case-study__title">{project.title}</h1>
        <p className="case-study__hook">{hook}</p>
        <dl className="case-study__meta">
          <div>
            <dt>Type</dt>
            <dd>{project.type}</dd>
          </div>
          {project.location && (
            <div>
              <dt>Coordinates</dt>
              <dd>{project.location}</dd>
            </div>
          )}
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          {project.stack && (
            <div>
              <dt>Built with</dt>
              <dd>{project.stack}</dd>
            </div>
          )}
          {client && (
            <div>
              <dt>Client</dt>
              <dd>{client}</dd>
            </div>
          )}
        </dl>
      </header>

      {/* 2. Strongest real visual / artwork */}
      <figure className="case-study__bleed">
        <Image
          src={assetPath(artworkSrc)}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <figcaption className="ed-meta">
          {project.slug === "jieshin-tseng"
            ? "Artwork · material research"
            : "Visual · opening"}
        </figcaption>
      </figure>

      {secondaryArt.length > 0 && (
        <div className="case-study__art-row">
          {secondaryArt.map((src) => (
            <figure key={src} className="case-study__art">
              <Image
                src={assetPath(src)}
                alt=""
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </figure>
          ))}
        </div>
      )}

      {/* 3. Context */}
      {(pitch?.challenge || project.summary) && (
        <section className="case-study__block">
          <p className="ed-meta">Context</p>
          <h2 className="ed-section">What needed to become discoverable</h2>
          <p className="ed-body">
            {pitch?.challenge || project.summary}
          </p>
        </section>
      )}

      {/* 4. Digital system */}
      {pitch?.influence && (
        <section className="case-study__block">
          <p className="ed-meta">Approach</p>
          <h2 className="ed-section">The system Off Course designed</h2>
          <p className="ed-body">{pitch.influence}</p>
        </section>
      )}

      {/* 5–6. Website / structure — after the artist is understood */}
      {systemBoards.length > 0 && (
        <section className="case-study__system" aria-label="Digital surfaces">
          <header className="case-study__block">
            <p className="ed-meta">Access</p>
            <h2 className="ed-section">Website and structure</h2>
            <p className="ed-body">
              Screens and flows appear here — after the practice is clear.
            </p>
          </header>
          {systemBoards.map((board, i) => (
            <figure
              key={`${board.src}-${i}`}
              className={`case-study__shot${i % 3 === 0 ? " is-wide" : ""}`}
            >
              <div className="case-study__shot-frame">
                <Image
                  src={assetPath(board.src)}
                  alt={board.caption || board.label}
                  fill
                  className="object-cover"
                  sizes={i % 3 === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                />
              </div>
              {(board.label || board.caption) && (
                <figcaption>
                  {board.label && <span className="ed-meta">{board.label}</span>}
                  {board.caption && <p className="ed-body">{board.caption}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      {pitch?.features && pitch.features.length > 0 && (
        <section className="case-study__block">
          <p className="ed-meta">Structure</p>
          <h2 className="ed-section">What the platform holds</h2>
          <ul className="case-study__features">
            {pitch.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {pitch?.outcomes && pitch.outcomes.length > 0 && (
        <section className="case-study__block">
          <p className="ed-meta">Outcome</p>
          <h2 className="ed-section">Arrival</h2>
          <ul className="case-study__features">
            {pitch.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="case-study__footer">
        <div className="case-study__credits">
          <p className="ed-meta">Credits</p>
          <p>
            {client || project.title}
            {project.stack ? ` · ${project.stack}` : ""}
            {` · ${project.year}`}
          </p>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ed-text-link"
            >
              Open live site
            </a>
          )}
        </div>

        <nav className="case-study__next" aria-label="Next on route">
          <Link href="/get-found" className="ed-text-link">
            ← GET FOUND
          </Link>
          {next ? (
            <Link
              href={`/get-found/${next.slug}`}
              className="case-study__next-link"
            >
              <span className="ed-meta">Next on route</span>
              <span>{next.title}</span>
            </Link>
          ) : prev ? (
            <Link
              href={`/get-found/${prev.slug}`}
              className="case-study__next-link"
            >
              <span className="ed-meta">Previous</span>
              <span>{prev.title}</span>
            </Link>
          ) : null}
        </nav>

        {others.length > 0 && (
          <ul className="case-study__others">
            {others.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/get-found/${p.slug}`}>
                  <span className="ed-meta">{getProjectCode(p)}</span>
                  <span>{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </article>
  );
}
