import type { Metadata } from "next";
import Link from "next/link";
import {
  STREAM_META,
  getAllProjects,
  streamPath,
  type ProjectStream,
} from "@/lib/projects";

export const metadata: Metadata = {
  title: "Logbook",
  description: "A running record of detours.",
};

export default function LogbookPage() {
  const entries = [...getAllProjects()].sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    return a.title.localeCompare(b.title);
  });

  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <header className="mb-16 max-w-2xl md:mb-24">
        <h1 className="font-display text-4xl tracking-nav text-ink md:text-6xl">
          LOGBOOK
        </h1>
        <p className="mt-6 max-w-md font-sans text-base text-ink md:text-lg">
          A running record of detours.
        </p>
      </header>

      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {entries.map((project) => {
          const stream = project.stream as ProjectStream;
          const meta = STREAM_META[stream];
          return (
            <li key={`${stream}-${project.slug}`}>
              <Link
                href={`${streamPath(stream)}/${project.slug}`}
                className="grid grid-cols-[4rem_1fr] items-baseline gap-4 py-5 transition-colors hover:text-accent md:grid-cols-[5rem_10rem_1fr_auto] md:gap-8 md:py-6"
              >
                <span className="font-sans text-sm text-mute">{project.year}</span>
                <span className="hidden font-display text-[10px] tracking-nav text-mute md:inline">
                  {meta.label}
                </span>
                <span className="col-span-1 font-display text-sm tracking-nav md:col-auto md:text-base">
                  {project.title}
                </span>
                <span className="hidden font-sans text-sm text-mute md:inline">
                  {project.type}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
