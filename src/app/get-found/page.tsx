import type { Metadata } from "next";
import { FoundWorks } from "@/components/FoundWorks";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Website and system cases — coffee shops, portfolios, booking platforms.",
};

/** Featured first, then remaining found cases (ZeroFrame works order). */
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
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const rest = found.filter((p) => !featuredSlugs.has(p.slug));
  const projects = [...featured, ...rest];

  return <FoundWorks projects={projects} />;
}
