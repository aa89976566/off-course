import Image from "next/image";
import Link from "next/link";
import { HOME, STUDIO, WORLDS } from "@/lib/content";
import {
  getProjectCode,
  getProjectsByStream,
  type Project,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

function FeaturedRow({
  project,
  world,
}: {
  project: Project;
  world: "lost" | "found";
}) {
  const meta = world === "lost" ? WORLDS.lost : WORLDS.found;
  const code = getProjectCode(project);

  return (
    <Link
      href={`${meta.href}/${project.slug}`}
      className="home-feature"
    >
      <div className="home-feature__media">
        <Image
          src={assetPath(project.cover)}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 42vw"
        />
      </div>
      <div className="home-feature__copy">
        <p className="ed-meta">
          {code}
          <span aria-hidden> · </span>
          {meta.label}
          {project.location ? (
            <>
              <span aria-hidden> · </span>
              {project.location.split(",")[0]}
            </>
          ) : null}
          <span aria-hidden> · </span>
          {project.year}
        </p>
        <h3 className="home-feature__title">{project.title}</h3>
        <p className="home-feature__type">{project.type}</p>
      </div>
    </Link>
  );
}

/**
 * Editorial continuation after the radio entrance.
 * One purpose per section — philosophy, then selected work on the route.
 */
export function HomeEditorial() {
  const lost = getProjectsByStream("lost").slice(0, 3);
  const found = getProjectsByStream("found").slice(0, 3);

  return (
    <div id="home-editorial" className="home-editorial">
      <section className="home-editorial__position" aria-labelledby="pos-title">
        <p className="ed-meta">Signal · {STUDIO.worldwide}</p>
        <h2 id="pos-title" className="ed-display">
          {STUDIO.tagline}
        </h2>
        <p className="ed-body home-editorial__lead">{STUDIO.positioning}</p>
      </section>

      <section className="home-editorial__worlds" aria-label="Two frequencies">
        <article className="home-world home-world--lost">
          <p className="ed-meta">Frequency · 01</p>
          <h2 className="ed-section">{WORLDS.lost.label}</h2>
          <p className="home-world__statement">{WORLDS.lost.statement}</p>
          <p className="ed-body">{WORLDS.lost.blurb}</p>
          <Link href={WORLDS.lost.href} className="ed-text-link">
            Enter {WORLDS.lost.label}
          </Link>
        </article>

        <article className="home-world home-world--found">
          <p className="ed-meta">Frequency · 02</p>
          <h2 className="ed-section">{WORLDS.found.label}</h2>
          <p className="home-world__statement">{WORLDS.found.statement}</p>
          <p className="ed-body">{WORLDS.found.blurb}</p>
          <Link href={WORLDS.found.href} className="ed-text-link">
            Enter {WORLDS.found.label}
          </Link>
        </article>
      </section>

      <section className="home-editorial__route" aria-labelledby="route-title">
        <header className="home-editorial__route-head">
          <p className="ed-meta">Selected on the route</p>
          <h2 id="route-title" className="ed-section">
            Work in both worlds
          </h2>
        </header>

        <div className="home-editorial__cols">
          <div>
            <p className="ed-meta home-editorial__col-label">
              {WORLDS.lost.label}
            </p>
            <ul className="home-editorial__list">
              {lost.map((p) => (
                <li key={p.slug}>
                  <FeaturedRow project={p} world="lost" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="ed-meta home-editorial__col-label">
              {WORLDS.found.label}
            </p>
            <ul className="home-editorial__list">
              {found.map((p) => (
                <li key={p.slug}>
                  <FeaturedRow project={p} world="found" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-editorial__close">
        <p className="ed-meta">Destination</p>
        <h2 className="ed-section">Tell us where you are headed</h2>
        <p className="ed-body">
          A wall. A system. Or a bridge between them — only when it creates
          value.
        </p>
        <div className="home-editorial__close-links">
          <Link href="/contact" className="ed-text-link">
            Contact
          </Link>
          <Link href="/archive" className="ed-text-link">
            Archive
          </Link>
        </div>
        <p className="ed-meta home-editorial__mileage">Arrival · Index</p>
      </section>
    </div>
  );
}
