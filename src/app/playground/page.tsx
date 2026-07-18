import type { Metadata } from "next";
import { DisciplineFilter } from "@/components/DisciplineFilter";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Playground",
};

export default function PlaygroundPage() {
  const projects = getProjectsByStream("playground");

  return (
    <div>
      <header className="px-4 pb-8 pt-10 md:px-6 md:pb-10 md:pt-14">
        <h1 className="font-display text-3xl tracking-nav text-ink md:text-5xl">
          PLAYGROUND
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-ink md:text-[17px]">
          Self-initiated experiments in paint and code — studies, prototypes and
          side paths that feed the commissioned work.
        </p>
      </header>
      <DisciplineFilter projects={projects} stream="playground" />
    </div>
  );
}
