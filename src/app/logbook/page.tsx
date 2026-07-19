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
};

export default function LogbookPage() {
  const entries = [...getAllProjects()].sort((a, b) => {
    if (a.year !== b.year) return Number(b.year) - Number(a.year);
    return a.title.localeCompare(b.title);
  });

  return (
    <article className="px-5 py-16 md:px-8 md:py-24">
      <header className="mb-14 max-w-2xl md:mb-20">
        <h1 className="font-display text-4xl tracking-[0.08em] text-black md:text-6xl">
          LOGBOOK
        </h1>
        <p className="mt-4 max-w-md font-sans text-base text-black">
          A running record of detours.
        </p>
      </header>

      <ul className="divide-y divide-black/10 border-y border-black/10">
        {entries.map((project) => {
          const stream = project.stream as ProjectStream;
          const meta = STREAM_META[stream];
          return (
            <li key={`${stream}-${project.slug}`}>
              <Link
                href={`${streamPath(stream)}/${project.slug}`}
                className="grid grid-cols-[4rem_1fr] items-baseline gap-4 py-5 hover:text-accent md:grid-cols-[5rem_9rem_1fr_auto] md:gap-8 md:py-6"
              >
                <span className="font-sans text-sm text-[#6b6b6b]">
                  {project.year}
                </span>
                <span className="hidden font-display text-[10px] tracking-[0.12em] text-[#6b6b6b] md:inline">
                  {meta.label}
                </span>
                <span className="font-display text-sm tracking-[0.06em] md:text-base">
                  {project.title}
                </span>
                <span className="hidden font-sans text-sm text-[#6b6b6b] md:inline">
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
