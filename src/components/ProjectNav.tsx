import Link from "next/link";
import type { Project, ProjectCategory } from "@/lib/projects";

type ProjectNavProps = {
  category: ProjectCategory;
  prev: Project | null;
  next: Project | null;
};

export function ProjectNav({ category, prev, next }: ProjectNavProps) {
  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:px-6">
      <Link
        href={`/${category}`}
        className="font-display text-[11px] tracking-nav text-ink hover:text-accent"
      >
        ← BACK
      </Link>
      {next ? (
        <Link
          href={`/${category}/${next.slug}`}
          className="font-display text-[11px] tracking-nav text-ink hover:text-accent"
        >
          NEXT PROJECT →
        </Link>
      ) : prev ? (
        <Link
          href={`/${category}/${prev.slug}`}
          className="font-display text-[11px] tracking-nav text-ink hover:text-accent"
        >
          PREV PROJECT →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
