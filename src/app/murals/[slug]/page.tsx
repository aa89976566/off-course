import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/ProjectNav";
import {
  getAdjacentProjects,
  getMurals,
  getProject,
  isMural,
} from "@/lib/projects";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getMurals().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject("murals", params.slug);
  if (!project) return { title: "Murals" };
  return { title: project.title };
}

export default function MuralProjectPage({ params }: Props) {
  const project = getProject("murals", params.slug);
  if (!project || !isMural(project)) notFound();

  const { prev, next } = getAdjacentProjects("murals", params.slug);

  return (
    <article>
      <ProjectNav category="murals" prev={prev} next={next} />

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
          <div>
            <dt className="sr-only">Materials</dt>
            <dd>{project.materials}</dd>
          </div>
          <div>
            <dt className="sr-only">Location</dt>
            <dd>{project.location}</dd>
          </div>
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
              alt={`${project.title} — ${i + 1}`}
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
        <ProjectNav category="murals" prev={prev} next={next} />
      </div>
    </article>
  );
}
