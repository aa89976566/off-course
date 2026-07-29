import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FoundCase } from "@/components/FoundCase";
import {
  getAdjacentProjects,
  getProject,
  getProjectsByStream,
} from "@/lib/projects";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getProjectsByStream("found").map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject("found", params.slug);
  if (!project) return { title: "GET FOUND" };
  return { title: `${project.title} — GET FOUND` };
}

export default function GetFoundProjectPage({ params }: Props) {
  const project = getProject("found", params.slug);
  if (!project) notFound();
  const others = getProjectsByStream("found").filter(
    (p) => p.slug !== project.slug
  );
  const { prev, next } = getAdjacentProjects("found", project.slug);
  return (
    <FoundCase project={project} others={others} prev={prev} next={next} />
  );
}
