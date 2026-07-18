import Image from "next/image";
import Link from "next/link";
import {
  disciplineLabel,
  type Project,
  type ProjectStream,
} from "@/lib/projects";
import { ProjectTicker } from "./ProjectTicker";

type ProjectGridProps = {
  projects: Project[];
  stream: ProjectStream;
};

export function ProjectGrid({ projects, stream }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/${stream}/${project.slug}`}
          className="group block"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
            <Image
              src={project.cover}
              alt={project.title}
              fill
              className="object-cover transition-none group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            />
            <span className="absolute left-3 top-3 font-display text-[10px] tracking-nav text-paper mix-blend-difference">
              {disciplineLabel(project.discipline)}
            </span>
          </div>
          <ProjectTicker title={project.title} accent={project.accent} />
        </Link>
      ))}
    </div>
  );
}
