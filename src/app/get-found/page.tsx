import type { Metadata } from "next";
import { FoundIndex } from "@/components/FoundIndex";
import { getProjectsByStream } from "@/lib/projects";
import { WORLDS } from "@/lib/content";

export const metadata: Metadata = {
  title: "GET FOUND",
  description: WORLDS.found.blurb,
};

const FEATURED = [
  "jieshin-tseng",
  "freds-cafe",
  "boxing-training",
  "ams-com",
  "crespidia-coffee",
  "shop-x-booking",
] as const;

export default function GetFoundPage() {
  const found = getProjectsByStream("found");
  const featured = FEATURED.map((slug) =>
    found.find((p) => p.slug === slug)
  ).filter(Boolean) as typeof found;
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const rest = found.filter((p) => !featuredSlugs.has(p.slug));
  const projects = [...featured, ...rest];

  return <FoundIndex projects={projects} />;
}
