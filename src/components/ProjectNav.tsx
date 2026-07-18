import Link from "next/link";
import { streamPath, type Project, type ProjectStream } from "@/lib/projects";

type ProjectNavProps = {
  stream: ProjectStream;
  prev: Project | null;
  next: Project | null;
};

export function ProjectNav({ stream, prev, next }: ProjectNavProps) {
  const base = streamPath(stream);

  return (
    <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:px-6">
      <Link
        href={base}
        className="font-display text-[11px] tracking-nav text-ink hover:text-accent"
      >
        ← BACK
      </Link>
      {next ? (
        <Link
          href={`${base}/${next.slug}`}
          className="font-display text-[11px] tracking-nav text-ink hover:text-accent"
        >
          NEXT PROJECT →
        </Link>
      ) : prev ? (
        <Link
          href={`${base}/${prev.slug}`}
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
