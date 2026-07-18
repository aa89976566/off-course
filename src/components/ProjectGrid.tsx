import Image from "next/image";
import Link from "next/link";
import { streamPath, type Project, type ProjectStream } from "@/lib/projects";
import { ProjectTicker } from "./ProjectTicker";

type ProjectGridProps = {
  projects: Project[];
  stream: ProjectStream;
};

export function ProjectGrid({ projects, stream }: ProjectGridProps) {
  const base = streamPath(stream);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`${base}/${project.slug}`}
          className="group flex min-w-0 flex-col overflow-hidden"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/10">
            <Image
              src={project.cover}
              alt=""
              fill
              className="object-cover group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <ProjectTicker title={project.title} accent={project.accent} />
        </Link>
      ))}
    </div>
  );
}
