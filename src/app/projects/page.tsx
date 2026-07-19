import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

/** Unified projects index — Walala /projects pattern */
export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="min-h-[calc(100svh-100px)] bg-white">
      <ProjectGrid projects={projects} />
    </div>
  );
}
