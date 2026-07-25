import projectsData from "../../data/projects.json";

export type ProjectStream = "lost" | "found";

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
};

export const STREAM_META: Record<
  ProjectStream,
  { href: string; label: string; title: string; line: string; sub: string }
> = {
  lost: {
    href: "/get-lost",
    label: "GET LOST",
    title: "GET LOST",
    line: "We left the route on purpose.",
    sub: "Some ideas don't belong on screens.",
  },
  found: {
    href: "/get-found",
    label: "GET FOUND",
    title: "GET FOUND",
    line: "Collapse the stack.",
    sub: "Websites, booking, and platforms after discovery.",
  },
};

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
