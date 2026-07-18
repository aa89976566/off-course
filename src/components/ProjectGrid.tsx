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
          className="group flex min-w-0 flex-col overflow-hidden"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/10">
            <Image
              src={project.cover}
              alt=""
              fill
              className="object-cover transition-transform duration-0 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <span className="pointer-events-none absolute left-3 top-3 z-10 bg-paper px-1.5 py-0.5 font-display text-[10px] tracking-nav text-ink">
              {disciplineLabel(project.discipline)}
            </span>
          </div>
          <ProjectTicker title={project.title} accent={project.accent} />
        </Link>
      ))}
    </div>
  );
}
