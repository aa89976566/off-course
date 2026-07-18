import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { getProject, getProjectsByStream } from "@/lib/projects";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getProjectsByStream("lost").map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const project = getProject("lost", params.slug);
  if (!project) return { title: "GET LOST" };
  return { title: project.title };
}

export default function GetLostProjectPage({ params }: Props) {
  const project = getProject("lost", params.slug);
  if (!project) notFound();
  return <ProjectDetail project={project} stream="lost" />;
}
