import type { Metadata } from "next";
import { FoundLanding } from "@/components/FoundLanding";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Collapse the stack — websites, booking, and platforms that keep brands found.",
};

const FEATURED = ["ams-com", "freds-cafe", "crespidia-coffee"] as const;

export default function GetFoundPage() {
  const found = getProjectsByStream("found");
  const featured = FEATURED.map((slug) =>
    found.find((p) => p.slug === slug)
  ).filter(Boolean) as typeof found;

  // Fallback if featured slugs missing.
  const projects = featured.length >= 3 ? featured : found.slice(0, 3);

  return <FoundLanding projects={projects} />;
}
