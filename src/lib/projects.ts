import projectsData from "../../data/projects.json";

export type ProjectStream = "lost" | "found";

export type ProjectPitchBoard = {
  src: string;
  label: string;
  caption?: string;
};

export type ProjectPitch = {
  /** Outcome-led one-liner shown under the title */
  hook?: string;
  challenge?: string;
  /** How the website amplifies the client's presence / influence */
  influence?: string;
  features?: string[];
  outcomes?: string[];
  boards?: ProjectPitchBoard[];
};

/** GET LOST narrative — physical / place first. Null = missing, do not invent. */
export type LostNarrative = {
  proposition?: string;
  place?: string;
  process?: string | null;
  relationship?: string;
  outcome?: string | null;
};

export type Project = {
  slug: string;
  title: string;
  stream: ProjectStream;
  year: string;
  type: string;
  materials: string | null;
  location: string | null;
  stack: string | null;
  client: string | null;
  accent: string;
  cover: string;
  images: string[];
  summary?: string | null;
  liveUrl?: string | null;
  pitch?: ProjectPitch | null;
  lost?: LostNarrative | null;
  /** Optional editorial code override e.g. FOUND 001 — prefer stream order */
  code?: string | null;
  /** Opening artwork paths (non-mockup) for case studies */
  artwork?: string[] | null;
  /**
   * When false, kept in data but excluded from public world indexes,
   * adjacency, and codes. Default true when omitted.
   */
  published?: boolean;
};

export type ProjectQuery = {
  /** Include unpublished / archive-only entries. Default false. */
  includeUnpublished?: boolean;
};

export const STREAM_META: Record<
  ProjectStream,
  { href: string; label: string; title: string; line: string; sub: string }
> = {
  lost: {
    href: "/get-lost",
    label: "GET LOST",
    title: "GET LOST",
    line: "Ideas become physical.",
    sub: "Murals, illustration, identity and installations.",
  },
  found: {
    href: "/get-found",
    label: "GET FOUND",
    title: "GET FOUND",
    line: "Ideas become accessible.",
    sub: "Digital places, systems and tools for discovery.",
  },
};

function isPublished(project: Project): boolean {
  return project.published !== false;
}

/** Editorial project code — LOST 001 / FOUND 001 from published stream order. */
export function getProjectCode(project: Project): string {
  if (project.code) return project.code;
  const list = getProjectsByStream(project.stream);
  const index = list.findIndex((p) => p.slug === project.slug);
  if (index === -1) {
    // Unpublished / off-sequence — still emit a stable label from full stream
    const full = getProjectsByStream(project.stream, {
      includeUnpublished: true,
    });
    const i = full.findIndex((p) => p.slug === project.slug);
    const n = String(Math.max(i, 0) + 1).padStart(3, "0");
    return `${project.stream === "lost" ? "LOST" : "FOUND"} ${n}`;
  }
  const n = String(index + 1).padStart(3, "0");
  return `${project.stream === "lost" ? "LOST" : "FOUND"} ${n}`;
}

export function getAllProjects(query: ProjectQuery = {}): Project[] {
  const all = projectsData.projects as Project[];
  if (query.includeUnpublished) return all;
  return all.filter(isPublished);
}

export function getProjectsByStream(
  stream: ProjectStream,
  query: ProjectQuery = {}
): Project[] {
  return getAllProjects(query).filter((p) => p.stream === stream);
}

export function getProject(
  stream: ProjectStream,
  slug: string
): Project | undefined {
  // Allow direct case routes for unpublished entries still in data
  return getProjectsByStream(stream, { includeUnpublished: true }).find(
    (p) => p.slug === slug
  );
}

export function getAdjacentProjects(
  stream: ProjectStream,
  slug: string
): { prev: Project | null; next: Project | null } {
  const list = getProjectsByStream(stream);
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function streamPath(stream: ProjectStream): string {
  return STREAM_META[stream].href;
}
