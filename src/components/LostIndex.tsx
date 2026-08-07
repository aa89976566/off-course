"use client";

import { WorldGallery } from "@/components/WorldGallery";
import type { Project } from "@/lib/projects";

type LostIndexProps = {
  projects: Project[];
};

/**
 * Shared mural bytes across several LOST titles — archive-content flag only
 * (honesty badge). Media load `is-pending` is handled separately in
 * WorldGallery and must clear when the image is already complete/cached.
 */
const PENDING_MEDIA_SLUGS = [
  "shoreditch-facade",
  "borough-market-wall",
  "camden-interior",
  "brixton-arcade",
];

/**
 * GET LOST index — world browser; archive badge where media is not uniquely
 * verified per project. Does not block interactivity on image decode.
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
