import { streamPath, type Project } from "@/lib/projects";
import { ProjectTile } from "./ProjectTile";

type ProjectGridProps = {
  projects: Project[];
};

/** Walala projects index: 5→4→3→2→1 cols, zero gap, square tiles */
export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="flex w-full flex-wrap">
      {projects.map((project) => (
        <div
          key={`${project.stream}-${project.slug}`}
          className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
        >
          <ProjectTile
            href={`${streamPath(project.stream)}/${project.slug}`}
            title={project.title}
            cover={project.cover}
            accent={project.accent}
          />
        </div>
      ))}
    </div>
  );
}
