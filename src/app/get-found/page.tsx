import type { Metadata } from "next";
import { FoundCardStack } from "@/components/FoundCardStack";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Website and system cases in a Framer CardStack — drag or tap to cycle.",
};

const FEATURED = [
  "freds-cafe",
  "jieshin-tseng",
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
  const projects = featured.length >= 3 ? featured : found.slice(0, 6);

  return <FoundCardStack projects={projects} />;
}
