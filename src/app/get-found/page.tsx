import type { Metadata } from "next";
import { FoundGallery } from "@/components/FoundGallery";
import { getProjectsByStream } from "@/lib/projects";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Flip through the digital systems we ship after discovery — websites, booking, and platforms.",
};

export default function GetFoundPage() {
  const projects = getProjectsByStream("found");
  return <FoundGallery projects={projects} />;
}
