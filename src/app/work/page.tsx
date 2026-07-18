import type { Metadata } from "next";
import { DisciplineFilter } from "@/components/DisciplineFilter";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  const projects = getProjectsByStream("work");

  return (
    <div>
      <header className="px-4 pb-8 pt-10 md:px-6 md:pb-10 md:pt-14">
        <h1 className="font-display text-3xl tracking-nav text-ink md:text-5xl">
          WORK
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-ink md:text-[17px]">
          Commissioned projects across visual and systems — murals, storefronts,
          websites and the tools that keep independent businesses running.
        </p>
      </header>
      <DisciplineFilter projects={projects} stream="work" />
    </div>
  );
}
