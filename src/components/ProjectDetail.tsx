import Image from "next/image";
import {
  getAdjacentProjects,
  type Project,
  type ProjectStream,
} from "@/lib/projects";
import { ProjectNav } from "./ProjectNav";

type ProjectDetailProps = {
  project: Project;
  stream: ProjectStream;
};

/** Vertical stack of full-width images — Walala project page pattern */
export function ProjectDetail({ project, stream }: ProjectDetailProps) {
  const { prev, next } = getAdjacentProjects(stream, project.slug);

  return (
    <article>
      <ProjectNav stream={stream} prev={prev} next={next} />

      <header className="px-5 py-12 md:px-8 md:py-16">
        <h1 className="max-w-4xl font-display text-3xl tracking-[0.06em] text-black md:text-5xl">
          {project.title}
        </h1>
        <dl className="mt-6 space-y-0.5 font-sans text-sm text-[#6b6b6b] md:text-base">
          <dd>{project.year}</dd>
          <dd>{project.type}</dd>
          {project.materials && <dd>{project.materials}</dd>}
          {project.stack && <dd>{project.stack}</dd>}
          {project.location && <dd>{project.location}</dd>}
          {project.client && <dd>{project.client}</dd>}
        </dl>
      </header>

      <div className="flex flex-col gap-3 md:gap-4">
        {project.images.map((src, i) => (
          <div key={src} className="relative w-full">
            <Image
              src={src}
              alt=""
              width={1600}
              height={1200}
              className="h-auto w-full"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="px-5 py-10 md:px-8">
        <ProjectNav stream={stream} prev={prev} next={next} />
      </div>
    </article>
  );
}
