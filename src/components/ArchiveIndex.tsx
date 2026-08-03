import Link from "next/link";
import { getProjectCode, type Project } from "@/lib/projects";

type ArchiveIndexProps = {
  projects: Project[];
};

/**
 * Cross-world editorial index — publication back matter, not a card grid.
 */
export function ArchiveIndex({ projects }: ArchiveIndexProps) {
  return (
    <div className="archive-index">
      <header className="archive-index__head">
        <p className="ed-meta">Mileage · {String(projects.length).padStart(2, "0")}</p>
        <h1 className="ed-display">Archive</h1>
        <p className="ed-body archive-index__lead">
          A complete index of work across GET LOST and GET FOUND. Each entry
          opens inside its primary world.
        </p>
      </header>

      <div className="archive-index__table" role="table" aria-label="Project archive">
        <div className="archive-index__row archive-index__row--head" role="row">
          <span role="columnheader">No.</span>
          <span role="columnheader">Title</span>
          <span role="columnheader">World</span>
          <span role="columnheader">Type</span>
          <span role="columnheader">Place</span>
          <span role="columnheader">Year</span>
        </div>

        {projects.map((project) => {
          const code = getProjectCode(project);
          const href =
            project.stream === "lost"
              ? `/get-lost/${project.slug}`
              : `/get-found/${project.slug}`;
          const world =
            project.stream === "lost" ? "GET LOST" : "GET FOUND";
          const place = project.location
            ? project.location.split(",")[0]
            : "—";

          return (
            <Link
              key={project.slug}
              href={href}
              className="archive-index__row"
              role="row"
            >
              <span className="archive-index__code" role="cell">
                {code}
              </span>
              <span className="archive-index__title" role="cell">
                {project.title}
              </span>
              <span className="archive-index__world" role="cell">
                {world}
              </span>
              <span className="archive-index__type" role="cell">
                {project.type}
              </span>
              <span className="archive-index__place" role="cell">
                {place}
              </span>
              <span className="archive-index__year" role="cell">
                {project.year}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
