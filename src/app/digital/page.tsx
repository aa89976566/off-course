import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getDigital } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Digital",
};

export default function DigitalPage() {
  const projects = getDigital();

  return (
    <div>
      <header className="px-4 py-12 md:px-6 md:py-16">
        <h1 className="font-display text-3xl tracking-nav text-ink md:text-5xl">
          DIGITAL
        </h1>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-ink md:text-[17px]">
          Websites, e-commerce builds and lightweight systems for independent
          businesses.
        </p>
      </header>
      <ProjectGrid projects={projects} category="digital" />
    </div>
  );
}
