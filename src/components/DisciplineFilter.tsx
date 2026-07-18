"use client";

import { useMemo, useState } from "react";
import type { Discipline, Project, ProjectStream } from "@/lib/projects";
import { ProjectGrid } from "./ProjectGrid";

const FILTERS: { id: "all" | Discipline; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "visual", label: "VISUAL" },
  { id: "systems", label: "SYSTEMS" },
];

type DisciplineFilterProps = {
  projects: Project[];
  stream: ProjectStream;
};

export function DisciplineFilter({ projects, stream }: DisciplineFilterProps) {
  const [filter, setFilter] = useState<"all" | Discipline>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.discipline === filter);
  }, [filter, projects]);

  return (
    <div>
      <div className="flex flex-wrap gap-5 border-b border-ink/10 px-4 pb-4 md:px-6">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`font-display text-[11px] tracking-nav ${
              filter === item.id ? "text-accent" : "text-ink hover:text-accent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ProjectGrid projects={filtered} stream={stream} />
    </div>
  );
}
