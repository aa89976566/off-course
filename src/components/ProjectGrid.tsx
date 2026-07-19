import Image from "next/image";
import Link from "next/link";
import { streamPath, type Project, type ProjectStream } from "@/lib/projects";
import { ProjectTicker } from "./ProjectTicker";

type ProjectGridProps = {
  projects: Project[];
  stream: ProjectStream;
};

/** Gutter-less tile grid — matches Walala projects index */
export function ProjectGrid({ projects, stream }: ProjectGridProps) {
  const base = streamPath(stream);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`${base}/${project.slug}`}
          className="group flex min-w-0 flex-col overflow-hidden"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
            <Image
              src={project.cover}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <ProjectTicker title={project.title} accent={project.accent} />
        </Link>
      ))}
    </div>
  );
}
