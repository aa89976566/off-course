"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project, type ProjectStream } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

export type BrowseMode = "vertical" | "horizontal" | "grid";

type WorldGalleryProps = {
  stream: ProjectStream;
  projects: Project[];
  /** LOST covers that reuse shared archive bytes — show pending treatment. */
  pendingMediaSlugs?: string[];
};

type RailFocus =
  | { kind: "open" }
  | { kind: "craft" }
  | { kind: "project"; slug: string };

const MODES: { id: BrowseMode; label: string }[] = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
  { id: "grid", label: "Grid" },
];

const FOUND_CRAFT = [
  "Websites",
  "Systems",
  "Applications",
  "CMS",
  "Automation",
  "AI",
  "Internal tools",
];

const LOST_CRAFT = [
  "Murals",
  "Illustration",
  "Identity",
  "Installations",
  "Spatial",
  "Public art",
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

function modeToSearch(mode: BrowseMode): string {
  if (mode === "vertical") return "";
  return `?view=${mode}`;
}

/**
 * World index = first-viewport work browser.
 * Fixed nav + left project rail + center media + right meta + fixed mode controls.
 * No giant hero / capabilities intro ahead of the gallery.
 */
export function WorldGallery({
  stream,
  projects,
  pendingMediaSlugs = [],
}: WorldGalleryProps) {
  const world = stream === "found" ? WORLDS.found : WORLDS.lost;
  const counterpart = stream === "found" ? WORLDS.lost : WORLDS.found;
  const craftLabel = stream === "found" ? "Access" : "Craft";
  const craftItems = stream === "found" ? FOUND_CRAFT : LOST_CRAFT;
  const pending = useMemo(
    () => new Set(pendingMediaSlugs),
    [pendingMediaSlugs]
  );

  const [mode, setMode] = useState<BrowseMode>("vertical");
  const [focus, setFocus] = useState<RailFocus>(() =>
    projects[0] ? { kind: "project", slug: projects[0].slug } : { kind: "open" }
  );
  const horizontalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(readModeFromUrl());
  }, []);

  useEffect(() => {
    const onPop = () => setMode(readModeFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setBrowseMode = useCallback(
    (next: BrowseMode, historyMode: "replace" | "push" = "push") => {
      setMode(next);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (next === "vertical") url.searchParams.delete("view");
      else url.searchParams.set("view", next);
      const href = `${url.pathname}${url.search}${url.hash}`;
      if (historyMode === "push") window.history.pushState({ view: next }, "", href);
      else window.history.replaceState({ view: next }, "", href);
    },
    []
  );

  const activeProject =
    focus.kind === "project"
      ? projects.find((p) => p.slug === focus.slug) || projects[0] || null
      : projects[0] || null;

  const activeIndex = activeProject
    ? Math.max(0, projects.findIndex((p) => p.slug === activeProject.slug))
    : 0;

  const selectProject = useCallback((slug: string) => {
    setFocus({ kind: "project", slug });
  }, []);

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!projects.length) return;
    const idx = Math.max(
      0,
      projects.findIndex((p) => p.slug === (focus.kind === "project" ? focus.slug : ""))
    );
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = projects[Math.min(projects.length - 1, Math.max(0, idx) + 1)];
      if (next) setFocus({ kind: "project", slug: next.slug });
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = projects[Math.max(0, idx - 1)];
      if (prev) setFocus({ kind: "project", slug: prev.slug });
    }
    if (e.key === "Enter" && activeProject && focus.kind === "project") {
      window.location.href = `${world.href}/${activeProject.slug}`;
    }
  };

  useEffect(() => {
    if (mode !== "horizontal") return;
    const el = horizontalRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        el.scrollBy({ left: -el.clientWidth * 0.85, behavior: "smooth" });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [mode]);

  return (
    <div
      className={`world-ed world-ed--${stream} world-browser world-browser--${stream} mode-${mode}`}
    >
      <p className="world-browser__world-label" aria-hidden="false">
        <span className="world-browser__world-code">
          {stream === "found" ? "FOUND · DIGITAL" : "LOST · PHYSICAL"}
        </span>
        <span className="world-browser__world-name">{world.label}</span>
      </p>

      <div
        className={`world-browser__shell world-browser__shell--${mode}`}
        id="gallery"
      >
        <nav className="world-browser__rail" aria-label="World chapters and projects">
          <ul className="world-browser__rail-list">
            <li>
              <button
                type="button"
                className={`world-browser__rail-btn world-browser__rail-btn--chapter${
                  focus.kind === "open" ? " is-active" : ""
                }`}
                aria-pressed={focus.kind === "open"}
                onClick={() => setFocus({ kind: "open" })}
              >
                <span className="world-browser__rail-mark" aria-hidden />
                <span className="world-browser__rail-label">Open</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`world-browser__rail-btn world-browser__rail-btn--chapter${
                  focus.kind === "craft" ? " is-active" : ""
                }`}
                aria-pressed={focus.kind === "craft"}
                onClick={() => setFocus({ kind: "craft" })}
              >
                <span className="world-browser__rail-mark" aria-hidden />
                <span className="world-browser__rail-label">{craftLabel}</span>
              </button>
            </li>
            <li className="world-browser__rail-divider" aria-hidden>
              <span>01–06</span>
            </li>
          </ul>

          <ul
            className="world-browser__project-list"
            role="listbox"
            aria-label="Projects"
            tabIndex={0}
            onKeyDown={onListKey}
          >
            {projects.map((project, i) => {
              const selected =
                focus.kind === "project" && focus.slug === project.slug;
              return (
                <li key={project.slug} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`world-browser__rail-btn world-browser__rail-btn--project${
                      selected ? " is-active" : ""
                    }`}
                    onClick={() => selectProject(project.slug)}
                    onFocus={() => selectProject(project.slug)}
                  >
                    <span className="world-browser__rail-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="world-browser__rail-name">{project.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="world-browser__main">
          {mode === "vertical" && focus.kind === "open" && (
            <div className="world-browser__context world-browser__context--open">
              <ArchivePlate
                code={stream === "found" ? "FOUND · OPEN" : "LOST · OPEN"}
                title={world.label}
                subtitle={world.statement}
                note={world.blurb}
                stream={stream}
                pending={false}
              />
            </div>
          )}

          {mode === "vertical" && focus.kind === "craft" && (
            <div className="world-browser__context world-browser__context--craft">
              <div className="world-browser__craft-plate">
                <p className="world-browser__mono">
                  {stream === "found" ? "Capabilities" : "Craft"}
                </p>
                <ul className="world-browser__craft-chips">
                  {craftItems.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
                <p className="world-browser__craft-hint">
                  Select a project in the rail to browse work.
                </p>
              </div>
            </div>
          )}

          {mode === "vertical" && focus.kind === "project" && activeProject && (
            <Link
              href={`${world.href}/${activeProject.slug}`}
              className="world-browser__stage"
              id={`project-${activeProject.slug}`}
            >
              {pending.has(activeProject.slug) ? (
                <ArchivePlate
                  code={getProjectCode(activeProject)}
                  title={activeProject.title}
                  subtitle={activeProject.type}
                  note="ARCHIVE MATERIAL PENDING"
                  stream={stream}
                  pending
                  textureSrc={
                    activeProject.artwork?.[0] || activeProject.cover
                  }
                />
              ) : (
                <div className="world-browser__stage-media">
                  <Image
                    src={assetPath(
                      activeProject.artwork?.[0] || activeProject.cover
                    )}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 899px) 100vw, 58vw"
                    priority
                  />
                </div>
              )}
              <span className="world-browser__stage-cta">Open case</span>
            </Link>
          )}

          {mode === "horizontal" && (
            <div
              ref={horizontalRef}
              className="world-browser__horizontal"
              tabIndex={0}
              aria-label="Horizontal project rail"
            >
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  index={i}
                  href={`${world.href}/${project.slug}`}
                  pending={pending.has(project.slug)}
                  layout="rail"
                  stream={stream}
                />
              ))}
            </div>
          )}

          {mode === "grid" && (
            <div className="world-browser__grid">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  index={i}
                  href={`${world.href}/${project.slug}`}
                  pending={pending.has(project.slug)}
                  layout="grid"
                  stream={stream}
                />
              ))}
            </div>
          )}
        </div>

        <aside
          className="world-browser__meta"
          aria-label="Active project metadata"
        >
          {focus.kind === "project" && activeProject ? (
            <>
              <p className="world-browser__mono">
                {getProjectCode(activeProject)}
              </p>
              <p className="world-browser__meta-title">{activeProject.title}</p>
              <dl className="world-browser__meta-dl">
                <div>
                  <dt>Discipline</dt>
                  <dd>{activeProject.type}</dd>
                </div>
                <div>
                  <dt>Services</dt>
                  <dd>{servicesLine(activeProject)}</dd>
                </div>
                <div>
                  <dt>Year</dt>
                  <dd>{activeProject.year}</dd>
                </div>
                <div>
                  <dt>Index</dt>
                  <dd>
                    {String(activeIndex + 1).padStart(2, "0")}/
                    {String(projects.length).padStart(2, "0")}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <>
              <p className="world-browser__mono">
                {focus.kind === "open" ? "OPEN" : craftLabel.toUpperCase()}
              </p>
              <p className="world-browser__meta-title">{world.label}</p>
              <dl className="world-browser__meta-dl">
                <div>
                  <dt>World</dt>
                  <dd>
                    {stream === "found"
                      ? "Digital discovery"
                      : "Physical expression"}
                  </dd>
                </div>
                <div>
                  <dt>Cases</dt>
                  <dd>{String(projects.length).padStart(2, "0")}</dd>
                </div>
                <div>
                  <dt>Browse</dt>
                  <dd>Select 01–06</dd>
                </div>
              </dl>
            </>
          )}
        </aside>
      </div>

      <div
        className="world-browser__modes"
        role="group"
        aria-label="Browse mode"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`world-browser__mode${mode === m.id ? " is-active" : ""}`}
            aria-pressed={mode === m.id}
            onClick={() => setBrowseMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <footer className="world-browser__foot">
        <p className="world-browser__mono">
          Mileage · {String(projects.length).padStart(2, "0")}{" "}
          {stream === "found" ? "signals" : "sites"}
          {mode !== "vertical" ? ` · ${modeToSearch(mode)}` : ""}
        </p>
        <div className="world-browser__foot-links">
          <Link href="/archive">Full archive</Link>
          <Link href={counterpart.href}>Counterpart · {counterpart.label}</Link>
        </div>
      </footer>
    </div>
  );
}

function ArchivePlate({
  code,
  title,
  subtitle,
  note,
  stream,
  pending,
  textureSrc,
}: {
  code: string;
  title: string;
  subtitle?: string;
  note?: string;
  stream: ProjectStream;
  pending: boolean;
  textureSrc?: string;
}) {
  return (
    <div
      className={`world-browser__plate world-browser__plate--${stream}${
        pending ? " is-pending" : ""
      }`}
    >
      {textureSrc && (
        <div className="world-browser__plate-texture" aria-hidden>
          <Image
            src={assetPath(textureSrc)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 899px) 100vw, 58vw"
            priority
          />
        </div>
      )}
      <div className="world-browser__plate-grain" aria-hidden />
      <div className="world-browser__plate-body">
        <p className="world-browser__mono">{code}</p>
        <p className="world-browser__plate-title">{title}</p>
        {subtitle && <p className="world-browser__plate-sub">{subtitle}</p>}
        {note && (
          <p className={`world-browser__plate-note${pending ? " is-pending" : ""}`}>
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  href,
  pending,
  layout,
  stream,
}: {
  project: Project;
  index: number;
  href: string;
  pending: boolean;
  layout: "rail" | "grid";
  stream: ProjectStream;
}) {
  const code = getProjectCode(project);
  return (
    <Link
      href={href}
      id={`project-${project.slug}`}
      className={`world-browser__card world-browser__card--${layout}`}
    >
      <div className="world-browser__card-media">
        {pending ? (
          <ArchivePlate
            code={code}
            title={project.title}
            subtitle={project.type}
            note="ARCHIVE MATERIAL PENDING"
            stream={stream}
            pending
            textureSrc={project.artwork?.[0] || project.cover}
          />
        ) : (
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
        )}
      </div>
      <div className="world-browser__card-body">
        <p className="world-browser__mono">
          <span>{code}</span>
          <span aria-hidden> · </span>
          <span>{project.type}</span>
          <span aria-hidden> · </span>
          <span>{project.year}</span>
        </p>
        <h2 className="world-browser__card-title">{project.title}</h2>
        <p className="world-browser__card-services">{servicesLine(project)}</p>
        <p className="world-browser__mono">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </Link>
  );
}
