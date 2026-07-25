import Image from "next/image";
import Link from "next/link";
import {
  getAdjacentProjects,
  streamPath,
  type Project,
  type ProjectStream,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type ProjectDetailProps = {
  project: Project;
  stream: ProjectStream;
};

/** Walala project page: back/next bar, title block, stacked images */
export function ProjectDetail({ project, stream }: ProjectDetailProps) {
  const { prev, next } = getAdjacentProjects(stream, project.slug);
  const base = streamPath(stream);

  return (
    <article className="flex w-full flex-col items-center gap-5 bg-white px-5 py-5">
      <div className="mb-8 flex w-full max-w-[1000px] justify-between md:mb-12">
        <Link
          href={base}
          className="font-bold uppercase hover:text-[var(--walala-lilac)]"
        >
          ← Back
        </Link>
        {next ? (
          <Link
            href={`${base}/${next.slug}`}
            className="font-bold uppercase hover:text-[var(--walala-lilac)]"
          >
            Next Project →
          </Link>
        ) : (
          <Link
            href="/projects"
            className="font-bold uppercase hover:text-[var(--walala-lilac)]"
          >
            All Projects →
          </Link>
        )}
      </div>

      <div className="w-full max-w-[1000px]">
        <header className="mb-5">
          <h1 className="mb-5 font-display text-2xl uppercase tracking-wide text-black md:text-4xl">
            {project.title}
          </h1>
          {project.summary && (
            <p className="mb-4 max-w-2xl text-base leading-relaxed">
              {project.summary}
            </p>
          )}
          <p className="font-bold">{project.year}</p>
          <p>{project.type}</p>
          {project.materials && <p>{project.materials}</p>}
          {project.stack && <p>{project.stack}</p>}
          {project.location && <p>{project.location}</p>}
          {project.client && <p>{project.client}</p>}
          {project.liveUrl && (
            <p className="mt-4">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold uppercase hover:text-[var(--walala-red)]"
              >
                Visit site →
              </a>
            </p>
          )}
        </header>

        <div className="mt-2.5 flex w-full flex-col gap-5 md:gap-5">
          {project.images.map((src, i) => (
            <div key={src} className="relative w-full">
              <Image
                src={assetPath(src)}
                alt=""
                width={1600}
                height={1200}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1000px) 100vw, 1000px"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {prev && (
        <div className="mt-10 w-full max-w-[1000px]">
          <Link
            href={`${base}/${prev.slug}`}
            className="font-bold uppercase hover:text-[var(--walala-lilac)]"
          >
            ← Previous
          </Link>
        </div>
      )}
    </article>
  );
}
