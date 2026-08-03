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

/** Editorial project code — LOST 001 / FOUND 001 from stream order. */
export function getProjectCode(project: Project): string {
  const list = getProjectsByStream(project.stream);
  const index = list.findIndex((p) => p.slug === project.slug);
  const n = String(Math.max(index, 0) + 1).padStart(3, "0");
  return `${project.stream === "lost" ? "LOST" : "FOUND"} ${n}`;
}

export function getAllProjects(): Project[] {
  return projectsData.projects as Project[];
}

export function getProjectsByStream(stream: ProjectStream): Project[] {
  return getAllProjects().filter((p) => p.stream === stream);
}

export function getProject(
  stream: ProjectStream,
  slug: string
): Project | undefined {
  return getProjectsByStream(stream).find((p) => p.slug === slug);
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
