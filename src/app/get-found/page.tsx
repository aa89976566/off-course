import type { Metadata } from "next";
import { FoundIndex } from "@/components/FoundIndex";
import { getProjectsByStream } from "@/lib/projects";
import { WORLDS } from "@/lib/content";

export const metadata: Metadata = {
  title: "GET FOUND",
  description: WORLDS.found.blurb,
};

/**
 * GET FOUND index — published projects only, in authoritative data order:
 * Jieshin → Fred's → Boxing → AMS → Crespidia → Shop X.
 */
export default function GetFoundPage() {
  const projects = getProjectsByStream("found");
  return <FoundIndex projects={projects} />;
}
