"use client";

import { WorldGallery } from "@/components/WorldGallery";
import type { Project } from "@/lib/projects";

type LostIndexProps = {
  projects: Project[];
};

/**
 * Shared mural bytes across several LOST titles — treat as archive-pending
 * so we never present duplicate stock as unique client deliverables.
 */
const PENDING_MEDIA_SLUGS = [
  "shoreditch-facade",
  "borough-market-wall",
  "camden-interior",
  "brixton-arcade",
];

/**
 * GET LOST index — Obys-style browse; pending treatment where archive media
 * is not uniquely verified per project.
 */
export function LostIndex({ projects }: LostIndexProps) {
  return (
    <WorldGallery
      stream="lost"
      projects={projects}
      pendingMediaSlugs={PENDING_MEDIA_SLUGS}
    />
  );
}
