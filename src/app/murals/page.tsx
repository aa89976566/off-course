import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getMurals } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Murals",
};

export default function MuralsPage() {
  const projects = getMurals();

  return (
    <div>
      <header className="px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-display text-3xl tracking-nav text-ink md:text-5xl">
          MURALS
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-ink md:text-[17px]">
          Hand-painted walls, storefronts and installations for shops,
          restaurants and public spaces.
        </p>
      </header>
      <ProjectGrid projects={projects} category="murals" />
    </div>
  );
}
