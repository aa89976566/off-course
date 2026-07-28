import type { Metadata } from "next";
import { FoundCarousel3D } from "@/components/FoundCarousel3D";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "3D carousel of website and system cases — scroll to rotate the stack.",
};

/** Featured website / system cases for the 3D Carusel S4 stage. */
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

  return <FoundCarousel3D projects={projects} />;
}
