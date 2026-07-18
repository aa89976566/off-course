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

export function ProjectDetail({ project, stream }: ProjectDetailProps) {
  const { prev, next } = getAdjacentProjects(stream, project.slug);

  return (
    <article>
      <ProjectNav stream={stream} prev={prev} next={next} />

      <header className="px-4 py-12 md:px-6 md:py-16">
        <h1 className="max-w-4xl font-display text-3xl tracking-nav text-ink md:text-5xl">
          {project.title}
        </h1>
        <dl className="mt-8 space-y-1 font-sans text-sm text-mute md:text-base">
          <div>
            <dt className="sr-only">Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Type</dt>
            <dd>{project.type}</dd>
          </div>
          {project.materials && (
            <div>
              <dt className="sr-only">Materials</dt>
              <dd>{project.materials}</dd>
            </div>
          )}
          {project.stack && (
            <div>
              <dt className="sr-only">Stack</dt>
              <dd>{project.stack}</dd>
            </div>
          )}
          {project.location && (
            <div>
              <dt className="sr-only">Location</dt>
              <dd>{project.location}</dd>
            </div>
          )}
          {project.client && (
            <div>
              <dt className="sr-only">Client</dt>
              <dd>{project.client}</dd>
            </div>
          )}
        </dl>
      </header>

      <div className="flex flex-col gap-6 md:gap-10">
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

      <div className="px-4 py-12 md:px-6">
        <ProjectNav stream={stream} prev={prev} next={next} />
      </div>
    </article>
  );
}
