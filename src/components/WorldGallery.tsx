"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project, type ProjectStream } from "@/lib/projects";
import { assetPath } from "@/lib/utils";
import { WorldChapterRail, type WorldChapter } from "@/components/WorldChapterRail";

export type BrowseMode = "vertical" | "horizontal" | "grid";

type WorldGalleryProps = {
  stream: ProjectStream;
  projects: Project[];
  /** LOST covers that reuse shared archive bytes — show pending treatment. */
  pendingMediaSlugs?: string[];
};

const MODES: { id: BrowseMode; label: string }[] = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
  { id: "grid", label: "Grid" },
];

function servicesLine(project: Project): string {
  if (project.stack) return project.stack;
  if (project.materials) return project.materials;
  if (project.type) return project.type;
  return "CONTENT PENDING";
}

function readModeFromUrl(): BrowseMode {
  if (typeof window === "undefined") return "vertical";
  const q = new URLSearchParams(window.location.search).get("view");
  if (q === "horizontal" || q === "grid" || q === "vertical") return q;
  return "vertical";
}

/**
 * Obys-inspired world gallery — Vertical / Horizontal / Grid over the same cases.
 * OFF COURSE language: paper/ink, monospace meta, GET LOST / GET FOUND.
 */
export function WorldGallery({
  stream,
  projects,
  pendingMediaSlugs = [],
}: WorldGalleryProps) {
  const world = stream === "found" ? WORLDS.found : WORLDS.lost;
  const counterpart = stream === "found" ? WORLDS.lost : WORLDS.found;
  const pending = useMemo(
    () => new Set(pendingMediaSlugs),
    [pendingMediaSlugs]
  );

  const [mode, setMode] = useState<BrowseMode>("vertical");
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug ?? "");

  useEffect(() => {
    setMode(readModeFromUrl());
  }, []);

  const setBrowseMode = useCallback((next: BrowseMode) => {
    setMode(next);
    const url = new URL(window.location.href);
    if (next === "vertical") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const chapters: WorldChapter[] = useMemo(
    () => [
      { id: "open", label: "Open" },
      { id: "craft", label: stream === "found" ? "Access" : "Craft" },
      { id: "gallery", label: "01–06" },
    ],
    [stream]
  );

  const selectProject = useCallback((slug: string) => {
    setActiveSlug(slug);
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const active =
    projects.find((p) => p.slug === activeSlug) || projects[0] || null;

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!projects.length) return;
    const idx = Math.max(
      0,
      projects.findIndex((p) => p.slug === activeSlug)
    );
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = projects[Math.min(projects.length - 1, idx + 1)];
      setActiveSlug(next.slug);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = projects[Math.max(0, idx - 1)];
      setActiveSlug(prev.slug);
    }
    if (e.key === "Enter" && active) {
      window.location.href = `${world.href}/${active.slug}`;
    }
  };

  return (
    <div
      className={`world-ed world-ed--${stream} world-gallery world-gallery--${stream} mode-${mode}`}
    >
      <WorldChapterRail chapters={chapters} theme={stream} />

      <section
        id="open"
        className="world-gallery__open"
        aria-labelledby="world-open-title"
      >
        <p className="world-gallery__open-meta">
          {stream === "found" ? "Frequency locked · Digital" : "Off-map · Physical"}
        </p>
        <h1 id="world-open-title" className="world-gallery__open-title">
          {world.label}
        </h1>
        <p className="world-gallery__open-statement">{world.statement}</p>
        <p className="world-gallery__open-blurb">{world.blurb}</p>
      </section>

      <section
        id="craft"
        className="world-gallery__craft"
        aria-labelledby="world-craft-title"
      >
        <p className="world-gallery__craft-meta">
          {stream === "found" ? "Capabilities" : "Craft"}
        </p>
        <h2 id="world-craft-title" className="sr-only">
          {stream === "found" ? "Digital access" : "Physical craft"}
        </h2>
        <ul className="world-gallery__craft-list">
          {(stream === "found"
            ? ["Websites", "Systems", "Applications", "CMS", "Automation", "AI", "Internal tools"]
            : ["Murals", "Illustration", "Identity", "Installations", "Spatial", "Public art"]
          ).map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </section>

      <div className="world-gallery__browse" id="gallery">
        <div className="world-gallery__toolbar">
          <p className="world-gallery__toolbar-meta">
            {String(projects.length).padStart(2, "0")} cases · browse
          </p>
          <div
            className="world-gallery__modes"
            role="group"
            aria-label="Browse mode"
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`world-gallery__mode${mode === m.id ? " is-active" : ""}`}
                aria-pressed={mode === m.id}
                onClick={() => setBrowseMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "vertical" && active && (
          <div className="world-gallery__vertical">
            <ul
              className="world-gallery__list"
              role="listbox"
              aria-label="Projects"
              tabIndex={0}
              onKeyDown={onListKey}
            >
              {projects.map((project, i) => {
                const code = getProjectCode(project);
                const selected = project.slug === active.slug;
                return (
                  <li key={project.slug} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      className={`world-gallery__list-btn${selected ? " is-active" : ""}`}
                      onClick={() => selectProject(project.slug)}
                      onFocus={() => setActiveSlug(project.slug)}
                    >
                      <span className="world-gallery__list-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="world-gallery__list-name">
                        {project.title}
                      </span>
                      <span className="world-gallery__list-code">{code}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Link
              href={`${world.href}/${active.slug}`}
              className="world-gallery__stage"
              id={`project-${active.slug}`}
            >
              <div className="world-gallery__stage-media">
                <Image
                  src={assetPath(active.artwork?.[0] || active.cover)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 899px) 100vw, 52vw"
                  priority
                />
                {pending.has(active.slug) && (
                  <div className="world-gallery__pending" aria-hidden>
                    <span>ARCHIVE MATERIAL PENDING</span>
                  </div>
                )}
              </div>
              <span className="world-gallery__stage-cta">Open case</span>
            </Link>

            <aside className="world-gallery__meta" aria-label="Active project metadata">
              <p className="world-gallery__meta-code">{getProjectCode(active)}</p>
              <p className="world-gallery__meta-title">{active.title}</p>
              <dl className="world-gallery__meta-dl">
                <div>
                  <dt>Discipline</dt>
                  <dd>{active.type}</dd>
                </div>
                <div>
                  <dt>Services</dt>
                  <dd>{servicesLine(active)}</dd>
                </div>
                <div>
                  <dt>Year</dt>
                  <dd>{active.year}</dd>
                </div>
                <div>
                  <dt>Index</dt>
                  <dd>
                    {String(
                      projects.findIndex((p) => p.slug === active.slug) + 1
                    ).padStart(2, "0")}
                    /{String(projects.length).padStart(2, "0")}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        )}

        {mode === "horizontal" && (
          <div className="world-gallery__horizontal" tabIndex={0}>
            {projects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
                href={`${world.href}/${project.slug}`}
                pending={pending.has(project.slug)}
                layout="rail"
              />
            ))}
          </div>
        )}

        {mode === "grid" && (
          <div className="world-gallery__grid">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={i}
                href={`${world.href}/${project.slug}`}
                pending={pending.has(project.slug)}
                layout="grid"
              />
            ))}
          </div>
        )}
      </div>

      <footer className="world-gallery__foot">
        <p className="world-gallery__foot-meta">
          Mileage · {String(projects.length).padStart(2, "0")}{" "}
          {stream === "found" ? "signals" : "sites"}
        </p>
        <div className="world-gallery__foot-links">
          <Link href="/archive">Full archive</Link>
          <Link href={counterpart.href}>Counterpart · {counterpart.label}</Link>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  href,
  pending,
  layout,
}: {
  project: Project;
  index: number;
  href: string;
  pending: boolean;
  layout: "rail" | "grid";
}) {
  const code = getProjectCode(project);
  return (
    <Link
      href={href}
      id={`project-${project.slug}`}
      className={`world-gallery__card world-gallery__card--${layout}`}
    >
      <div className="world-gallery__card-media">
        <Image
          src={assetPath(project.artwork?.[0] || project.cover)}
          alt=""
          fill
          className="object-cover"
          sizes={
            layout === "grid"
              ? "(max-width: 699px) 100vw, 33vw"
              : "(max-width: 699px) 85vw, 70vw"
          }
        />
        {pending && (
          <div className="world-gallery__pending" aria-hidden>
            <span>ARCHIVE MATERIAL PENDING</span>
          </div>
        )}
      </div>
      <div className="world-gallery__card-body">
        <p className="world-gallery__card-meta">
          <span>{code}</span>
          <span aria-hidden>·</span>
          <span>{project.type}</span>
          <span aria-hidden>·</span>
          <span>{project.year}</span>
        </p>
        <h2 className="world-gallery__card-title">{project.title}</h2>
        <p className="world-gallery__card-services">{servicesLine(project)}</p>
        <p className="world-gallery__card-index">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </Link>
  );
}
