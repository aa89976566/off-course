"use client";

import { WorldGallery } from "@/components/WorldGallery";
import type { Project } from "@/lib/projects";

type FoundIndexProps = {
  projects: Project[];
};

/**
 * GET FOUND index — Obys-style browse over the six published signals.
 * Order is authoritative from data: Jieshin → Fred's → Boxing → AMS → Crespidia → Shop X.
 */
export function FoundIndex({ projects }: FoundIndexProps) {
  return <WorldGallery stream="found" projects={projects} />;
}
