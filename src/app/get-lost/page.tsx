import type { Metadata } from "next";
import { LostIndex } from "@/components/LostIndex";
import { WORLDS } from "@/lib/content";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET LOST",
  description: WORLDS.lost.blurb,
};

export default function GetLostPage() {
  const projects = getProjectsByStream("lost");
  return <LostIndex projects={projects} />;
}
