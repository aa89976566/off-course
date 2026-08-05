"use client";

import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";
import { WorldChapterRail, type WorldChapter } from "@/components/WorldChapterRail";
import { WorldSignalField } from "@/components/WorldSignalField";
import { WorldProjectStage } from "@/components/WorldProjectStage";
import { WorldCapsReveal } from "@/components/WorldCapsReveal";

type FoundIndexProps = {
  projects: Project[];
};

const CAPABILITIES = [
  { label: "Websites", emphasis: true },
  { label: "Systems", emphasis: true },
  { label: "Applications", emphasis: true },
  { label: "CMS", emphasis: false },
  { label: "Automation", emphasis: true },
  { label: "AI", emphasis: false },
  { label: "Internal tools", emphasis: true },
] as const;

/**
 * GET FOUND index — quiet editorial frame, chapter rail,
 * Canvas CGI opening, typographic capabilities, one project per viewport.
 */
export function FoundIndex({ projects }: FoundIndexProps) {
  const chapters: WorldChapter[] = [
    { id: "open", label: "Open" },
    { id: "capabilities", label: "Access" },
    ...projects.map((p, i) => ({
      id: `project-${p.slug}`,
      label: String(i + 1).padStart(2, "0"),
    })),
  ];

  return (
    <div className="world-ed world-ed--found">
      <WorldChapterRail chapters={chapters} theme="found" />

      <section
        id="open"
        className="world-screen world-screen--open"
        aria-labelledby="found-open-title"
      >
        <WorldSignalField theme="found" intensity="opening" />
        <div className="world-open__content">
          <p className="world-open__meta">Frequency locked · Digital</p>
          <h1 id="found-open-title" className="world-open__title">
            {WORLDS.found.label}
          </h1>
          <p className="world-open__statement">{WORLDS.found.statement}</p>
          <p className="world-open__blurb">{WORLDS.found.blurb}</p>
        </div>
      </section>

      <section
        id="capabilities"
        className="world-screen world-screen--caps world-tone--paper"
        aria-labelledby="found-caps-title"
      >
        <WorldCapsReveal>
          <p className="world-caps__meta">Capabilities</p>
          <h2 id="found-caps-title" className="sr-only">
            Digital access
          </h2>
          <ul className="world-caps__list">
            {CAPABILITIES.map((item) => (
              <li
                key={item.label}
                className={`world-caps__line${item.emphasis ? " is-strong" : " is-soft"}`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </WorldCapsReveal>
      </section>

      {projects.map((project, i) => {
        const code = getProjectCode(project);
        const src = project.artwork?.[0] || project.cover;
        const side = i % 2 === 0 ? "right" : "left";
        const tone = i % 2 === 0 ? "deep" : "paper";

        return (
          <section
            key={project.slug}
            id={`project-${project.slug}`}
            className={`world-screen world-screen--project world-tone--${tone} world-project--${side}`}
            aria-labelledby={`found-title-${project.slug}`}
          >
            <WorldProjectStage theme="found">
              <Link
                href={`/get-found/${project.slug}`}
                className="world-project__link"
              >
                <div className="world-project__frame">
                  <Image
                    src={assetPath(src)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 899px) 92vw, 58vw"
                    priority={i < 2}
                  />
                </div>
                <div className="world-project__type">
                  <p className="world-project__code">
                    {code}
                    <span aria-hidden> · </span>
                    {project.type}
                    <span aria-hidden> · </span>
                    {project.year}
                  </p>
                  <h2
                    id={`found-title-${project.slug}`}
                    className="world-project__title"
                  >
                    {project.title}
                  </h2>
                  <p className="world-project__detail">
                    {project.stack ||
                      project.location?.split(",")[0] ||
                      "Digital place"}
                  </p>
                  <span className="world-project__cta">Open case</span>
                </div>
              </Link>
            </WorldProjectStage>
          </section>
        );
      })}

      <footer className="world-foot world-tone--paper">
        <p className="world-foot__meta">
          Mileage · {String(projects.length).padStart(2, "0")} signals
        </p>
        <div className="world-foot__links">
          <Link href="/archive" className="world-foot__link">
            Full archive
          </Link>
          <Link href="/get-lost" className="world-foot__link">
            Counterpart · GET LOST
          </Link>
        </div>
      </footer>
    </div>
  );
}
