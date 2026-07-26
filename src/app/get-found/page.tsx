import type { Metadata } from "next";
import { FoundStack } from "@/components/FoundStack";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Scroll the stack — coffee shop, artist portfolio, and boxing coach websites.",
};

/** Featured GET FOUND stack: cafe → artist → boxing coach */
const FEATURED = ["freds-cafe", "jieshin-tseng", "boxing-training"] as const;

export default function GetFoundPage() {
  const found = getProjectsByStream("found");
  const featured = FEATURED.map((slug) =>
    found.find((p) => p.slug === slug)
  ).filter(Boolean) as typeof found;

  const projects = featured.length >= 3 ? featured : found.slice(0, 3);

  return <FoundStack projects={projects} />;
}
