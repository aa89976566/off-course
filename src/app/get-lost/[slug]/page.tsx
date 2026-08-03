import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LostCaseStudy } from "@/components/LostCaseStudy";
import {
  getAdjacentProjects,
  getProject,
  getProjectsByStream,
} from "@/lib/projects";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getProjectsByStream("lost").map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject("lost", params.slug);
  if (!project) return { title: "GET LOST" };
  return { title: `${project.title} — GET LOST` };
}

export default function GetLostProjectPage({ params }: Props) {
  const project = getProject("lost", params.slug);
  if (!project) notFound();
  const { prev, next } = getAdjacentProjects("lost", project.slug);
  return <LostCaseStudy project={project} prev={prev} next={next} />;
}
