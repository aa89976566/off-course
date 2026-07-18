import projectsData from "../../data/projects.json";

export type ProjectCategory = "murals" | "digital";

export type MuralProject = {
  slug: string;
  title: string;
  year: string;
  type: string;
  materials: string;
  location: string;
  client: string | null;
  accent: string;
  cover: string;
  images: string[];
};

export type DigitalProject = {
  slug: string;
  title: string;
  year: string;
  type: string;
  stack: string;
  client: string | null;
  accent: string;
  cover: string;
  images: string[];
};

export type Project = MuralProject | DigitalProject;

export function getMurals(): MuralProject[] {
  return projectsData.murals;
}

export function getDigital(): DigitalProject[] {
  return projectsData.digital;
}

export function getProjects(category: ProjectCategory): Project[] {
  return category === "murals" ? getMurals() : getDigital();
}

export function getProject(
  category: ProjectCategory,
  slug: string
): Project | undefined {
  return getProjects(category).find((p) => p.slug === slug);
}

export function getAdjacentProjects(
  category: ProjectCategory,
  slug: string
): { prev: Project | null; next: Project | null } {
  const list = getProjects(category);
  const index = list.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function isMural(project: Project): project is MuralProject {
  return "materials" in project;
}

export function isDigital(project: Project): project is DigitalProject {
  return "stack" in project;
}
