import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import {
  getAdjacentProjects,
  getProjectCode,
  type Project,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type LostCaseStudyProps = {
  project: Project;
  next: Project | null;
  prev: Project | null;
};

/**
 * GET LOST case — physical / material first.
 * Shares Off Course editorial system; never opens on device mockups.
 */
export function LostCaseStudy({ project, next, prev }: LostCaseStudyProps) {
  const code = getProjectCode(project);
  const narrative = project.lost;
  const client = project.client?.replace(/^for\s+/i, "") || null;
  const images = (
    project.images.length ? project.images : [project.cover]
  ).filter((src, i, arr) => arr.indexOf(src) === i);

  const hero = images[0] || project.cover;
  const details = images.slice(1);
  const proposition =
    narrative?.proposition ||
    project.summary ||
    `${project.type} — ideas becoming physical.`;

  return (
    <article className="case-study case-study--lost">
      <header className="case-study__header">
        <p className="ed-meta">
          {code}
          <span aria-hidden> · </span>
          {WORLDS.lost.label}
          <span aria-hidden> · </span>
          Off-map
        </p>
        <h1 className="case-study__title">{project.title}</h1>
        <p className="case-study__hook">{proposition}</p>
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
          {project.materials && (
            <div>
              <dt>Materials</dt>
              <dd>{project.materials}</dd>
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

      {/* Place / physical context */}
      {(narrative?.place || project.location) && (
        <section className="case-study__block">
          <p className="ed-meta">Place</p>
          <h2 className="ed-section">Physical context</h2>
          <p className="ed-body">
            {narrative?.place ||
              `Documented at ${project.location}.`}
          </p>
        </section>
      )}

      {/* Full-scale final work */}
      <figure className="case-study__bleed case-study__bleed--lost">
        <Image
          src={assetPath(hero)}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <figcaption className="ed-meta">Final work · full scale</figcaption>
      </figure>

      {/* Material / process details — imperfect crops, texture */}
      {details.length > 0 && (
        <section
          className="case-study__material"
          aria-label="Material and process"
        >
          <div className="case-study__block">
            <p className="ed-meta">Surface</p>
            <h2 className="ed-section">Material and gesture</h2>
            {project.materials && (
              <p className="ed-body">{project.materials}.</p>
            )}
            {narrative?.process ? (
              <p className="ed-body">{narrative.process}</p>
            ) : (
              <p className="ed-meta case-study__gap">
                Process notes — content pending
              </p>
            )}
          </div>
          <div className="case-study__detail-grid">
            {details.map((src, i) => (
              <figure
                key={src}
                className={`case-study__detail case-study__detail--${i % 3}`}
              >
                <Image
                  src={assetPath(src)}
                  alt=""
                  width={1400}
                  height={1600}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      {(narrative?.relationship || client) && (
        <section className="case-study__block">
          <p className="ed-meta">Route</p>
          <h2 className="ed-section">Location and relationship</h2>
          <p className="ed-body">
            {narrative?.relationship ||
              (client
                ? `Made with ${client}.`
                : "Relationship notes — content pending")}
          </p>
        </section>
      )}

      <section className="case-study__block">
        <p className="ed-meta">Arrival</p>
        <h2 className="ed-section">Outcome</h2>
        {narrative?.outcome ? (
          <p className="ed-body">{narrative.outcome}</p>
        ) : (
          <p className="ed-meta case-study__gap">
            Outcome notes — content pending (no invented metrics)
          </p>
        )}
      </section>

      <footer className="case-study__footer">
        <div className="case-study__credits">
          <p className="ed-meta">Credits</p>
          <p>
            {client || project.title}
            {project.materials ? ` · ${project.materials}` : ""}
            {` · ${project.year}`}
          </p>
        </div>

        <nav className="case-study__next" aria-label="Next on route">
          <Link href="/get-lost" className="ed-text-link">
            ← GET LOST
          </Link>
          {next ? (
            <Link
              href={`/get-lost/${next.slug}`}
              className="case-study__next-link"
            >
              <span className="ed-meta">Next on route</span>
              <span>{next.title}</span>
            </Link>
          ) : prev ? (
            <Link
              href={`/get-lost/${prev.slug}`}
              className="case-study__next-link"
            >
              <span className="ed-meta">Previous</span>
              <span>{prev.title}</span>
            </Link>
          ) : null}
        </nav>
      </footer>
    </article>
  );
}

/** Helper for pages that need adjacency without duplicating imports. */
export function lostAdjacency(slug: string) {
  return getAdjacentProjects("lost", slug);
}
