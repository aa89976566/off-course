import projectsData from "../../data/projects.json";

export type ProjectStream = "work" | "playground";
export type Discipline = "visual" | "systems";

export type Project = {
  slug: string;
  title: string;
  stream: ProjectStream;
  discipline: Discipline;
  year: string;
  type: string;
  materials: string | null;
  location: string | null;
  stack: string | null;
  client: string | null;
  accent: string;
  cover: string;
  images: string[];
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

export function disciplineLabel(discipline: Discipline): string {
  return discipline === "visual" ? "VISUAL" : "SYSTEMS";
}

export function streamLabel(stream: ProjectStream): string {
  return stream === "work" ? "WORK" : "PLAYGROUND";
}
