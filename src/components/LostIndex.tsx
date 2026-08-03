import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type LostIndexProps = {
  projects: Project[];
};

/**
 * GET LOST world opening — physical expression, not a Found clone.
 * Same editorial system; different rhythm (texture, place, scale).
 */
export function LostIndex({ projects }: LostIndexProps) {
  return (
    <div className="lost-index">
      <header className="lost-index__open">
        <p className="ed-meta">Distance · off-map</p>
        <h1 className="ed-display">{WORLDS.lost.label}</h1>
        <p className="lost-index__statement">{WORLDS.lost.statement}</p>
        <p className="ed-body lost-index__lead">{WORLDS.lost.blurb}</p>
      </header>

      <ol className="lost-index__list">
        {projects.map((project, i) => {
          const rhythm = i % 3;
          return (
            <li
              key={project.slug}
              className={`lost-spread lost-spread--${rhythm}`}
            >
              <Link
                href={`/get-lost/${project.slug}`}
                className="lost-spread__link"
              >
                <div className="lost-spread__media">
                  <Image
                    src={assetPath(project.cover)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority={i < 2}
                  />
                </div>
                <div className="lost-spread__copy">
                  <p className="ed-meta">
                    {getProjectCode(project)}
                    <span aria-hidden> · </span>
                    {project.type}
                    {project.location ? (
                      <>
                        <span aria-hidden> · </span>
                        {project.location.split(",")[0]}
                      </>
                    ) : null}
                    <span aria-hidden> · </span>
                    {project.year}
                  </p>
                  <h2 className="lost-spread__title">{project.title}</h2>
                  {project.materials && (
                    <p className="lost-spread__mat">{project.materials}</p>
                  )}
                  <span className="ed-text-link">Open case</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <footer className="lost-index__foot">
        <p className="ed-meta">
          Mileage · {String(projects.length).padStart(2, "0")} places
        </p>
        <Link href="/get-found" className="ed-text-link">
          Counterpart · GET FOUND
        </Link>
      </footer>
    </div>
  );
}
