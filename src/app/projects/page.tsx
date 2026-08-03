import type { Metadata } from "next";
import { RedirectClient } from "@/components/RedirectClient";

export const metadata: Metadata = {
  title: "Archive",
};

/** Legacy route → Archive */
export default function ProjectsRedirectPage() {
  return <RedirectClient to="/archive/" label="Archive" />;
}
