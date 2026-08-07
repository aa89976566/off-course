import type { Metadata } from "next";
import { ArchiveIndex } from "@/components/ArchiveIndex";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Archive",
  description: "Complete index of Off Course work across GET LOST and GET FOUND.",
};

export default function ArchivePage() {
  const projects = getAllProjects();
  return <ArchiveIndex projects={projects} />;
}
