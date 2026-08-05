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
 * GET FOUND case — magazine spreads.
 * For Jieshin (and artwork-rich cases): publication first, system inset later.
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
  const isArtistLed = Boolean(project.artwork?.length) || project.slug === "jieshin-tseng";

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

  const artworkSrc = artworkList[0];
  const detailCrops = artworkList.slice(0, 3);
  // Ensure at least 2 detail slots when only one crop exists — reuse with different object position via CSS
  const details =
    detailCrops.length >= 2
      ? detailCrops
      : artworkSrc
        ? [artworkSrc, artworkSrc]
        : [];

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
    <article
      className={`case-study case-study--found world-case${isArtistLed ? " case-study--artist" : ""}`}
    >
      {/* SPREAD 1 — Title: type mass; optional narrow crop only */}
      <header className="spread spread--case-title">
        <p className="ed-meta">
          {code}
          <span aria-hidden> · </span>
          {WORLDS.found.label}
          <span aria-hidden> · </span>
          Signal locked
        </p>
        <h1 className="spread-case-title__display">{project.title}</h1>
        <p className="spread-case-title__hook">{hook}</p>
        <dl className="spread-case-title__meta">
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
        {isArtistLed && artworkSrc && (
          <div className="spread-case-title__sliver" aria-hidden>
            <Image
              src={assetPath(artworkSrc)}
              alt=""
              fill
              className="object-cover"
              sizes="120px"
              priority
            />
          </div>
        )}
      </header>

      {/* SPREAD 2 — Artwork environment */}
      {isArtistLed && artworkSrc && (
        <figure className="spread spread--case-art">
          <Image
            src={assetPath(artworkSrc)}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </figure>
      )}

      {/* SPREAD 3 — Unequal detail crops */}
      {isArtistLed && details.length > 0 && (
        <section className="spread spread--case-details" aria-label="Details">
          {details.map((src, i) => (
            <figure
              key={`${src}-${i}`}
              className={`spread-case-details__crop spread-case-details__crop--${i}`}
            >
              <Image
                src={assetPath(src)}
                alt=""
                width={1200}
                height={1400}
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <figcaption className="ed-meta">Detail {String(i + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </section>
      )}

      {/* Non-artist cases: opening bleed from first visual */}
      {!isArtistLed && (
        <figure className="spread spread--case-art">
          <Image
            src={assetPath(allSrc[0] || project.cover)}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </figure>
      )}

      {/* SPREAD 4 — Context text-led */}
      {(pitch?.challenge || project.summary) && (
        <section className="spread spread--case-context">
          <p className="ed-meta">Context</p>
          <h2 className="ed-section">What needed to become discoverable</h2>
          <p className="ed-body spread-case-context__body">
            {pitch?.challenge || project.summary}
          </p>
          {pitch?.influence && (
            <p className="ed-body spread-case-context__body">{pitch.influence}</p>
          )}
        </section>
      )}

      {/* SPREAD 5 — Digital system — inset plates */}
      {systemBoards.length > 0 && (
        <section className="spread spread--case-system" aria-label="Digital system">
          <header className="spread-case-system__head">
            <p className="ed-meta">Access</p>
            <h2 className="ed-section">Website and structure</h2>
          </header>
          <div className="spread-case-system__plates">
            {systemBoards.map((board, i) => (
              <figure key={`${board.src}-${i}`} className="spread-case-system__plate">
                <div className="spread-case-system__frame">
                  <Image
                    src={assetPath(board.src)}
                    alt={board.caption || board.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 56vw"
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
          </div>
        </section>
      )}

      {/* SPREAD 6 — Structure appendix */}
      {pitch?.features && pitch.features.length > 0 && (
        <section className="spread spread--case-structure">
          <p className="ed-meta">Appendix</p>
          <h2 className="ed-section">Structure</h2>
          <ol className="spread-case-structure__list">
            {pitch.features.map((f, i) => (
              <li key={f}>
                <span className="spread-case-structure__n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* SPREAD 7 — Closing */}
      <footer className="spread spread--case-close">
        {pitch?.outcomes && pitch.outcomes.length > 0 && (
          <div className="spread-case-close__outcome">
            <p className="ed-meta">Arrival</p>
            <ul className="spread-case-close__list">
              {pitch.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="spread-case-close__credits">
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

        <nav className="spread-case-close__next" aria-label="Next on route">
          <Link href="/get-found" className="ed-text-link">
            ← GET FOUND
          </Link>
          {next ? (
            <Link
              href={`/get-found/${next.slug}`}
              className="spread-case-close__next-link"
            >
              <span className="ed-meta">Next route</span>
              <span>{next.title}</span>
            </Link>
          ) : prev ? (
            <Link
              href={`/get-found/${prev.slug}`}
              className="spread-case-close__next-link"
            >
              <span className="ed-meta">Previous</span>
              <span>{prev.title}</span>
            </Link>
          ) : null}
        </nav>

        {others.length > 0 && (
          <ul className="spread-case-close__others">
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
