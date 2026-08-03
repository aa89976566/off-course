import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundIndexProps = {
  projects: Project[];
};

/**
 * GET FOUND showcase — editorial spreads, not an all-black card wall.
 * Alternating scale / alignment / whitespace like a publication.
 */
export function FoundIndex({ projects }: FoundIndexProps) {
  return (
    <div className="found-index">
      <header className="found-index__open">
        <p className="ed-meta">Frequency locked</p>
        <h1 className="ed-display">{WORLDS.found.label}</h1>
        <p className="found-index__statement">{WORLDS.found.statement}</p>
        <p className="ed-body found-index__lead">{WORLDS.found.blurb}</p>
      </header>

      <ol className="found-index__list">
        {projects.map((project, i) => {
          const rhythm = i % 4;
          const code = getProjectCode(project);
          return (
            <li
              key={project.slug}
              className={`found-spread found-spread--${rhythm}`}
            >
              <Link
                href={`/get-found/${project.slug}`}
                className="found-spread__link"
              >
                <div className="found-spread__media">
                  <Image
                    src={assetPath(project.cover)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority={i < 2}
                  />
                </div>
                <div className="found-spread__copy">
                  <p className="ed-meta">
                    {code}
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
                  <h2 className="found-spread__title">{project.title}</h2>
                  {project.summary && (
                    <p className="found-spread__hook">
                      {project.summary.split("\n\n")[0]}
                    </p>
                  )}
                  <span className="ed-text-link">Open case</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <footer className="found-index__foot">
        <p className="ed-meta">
          Mileage · {String(projects.length).padStart(2, "0")} signals
        </p>
        <Link href="/archive" className="ed-text-link">
          Full archive
        </Link>
      </footer>
    </div>
  );
}
