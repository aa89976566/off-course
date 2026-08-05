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

type LostIndexProps = {
  projects: Project[];
};

const CAPABILITIES = [
  { label: "Murals", emphasis: true },
  { label: "Illustration", emphasis: true },
  { label: "Identity", emphasis: true },
  { label: "Installations", emphasis: true },
  { label: "Wayfinding", emphasis: false },
  { label: "Surface", emphasis: false },
  { label: "Place marks", emphasis: true },
] as const;

/**
 * GET LOST index — shared editorial system with FOUND;
 * Canvas CGI opening; warm paper / road-orange / physical texture.
 */
export function LostIndex({ projects }: LostIndexProps) {
  const chapters: WorldChapter[] = [
    { id: "open", label: "Open" },
    { id: "capabilities", label: "Craft" },
    ...projects.map((p, i) => ({
      id: `project-${p.slug}`,
      label: String(i + 1).padStart(2, "0"),
    })),
  ];

  return (
    <div className="world-ed world-ed--lost">
      <WorldChapterRail chapters={chapters} theme="lost" />

      <section
        id="open"
        className="world-screen world-screen--open"
        aria-labelledby="lost-open-title"
      >
        <WorldSignalField theme="lost" intensity="opening" />
        <div className="world-open__content">
          <p className="world-open__meta">Distance · Off-map · Physical</p>
          <h1 id="lost-open-title" className="world-open__title">
            {WORLDS.lost.label}
          </h1>
          <p className="world-open__statement">{WORLDS.lost.statement}</p>
          <p className="world-open__blurb">{WORLDS.lost.blurb}</p>
        </div>
      </section>

      <section
        id="capabilities"
        className="world-screen world-screen--caps world-tone--deep"
        aria-labelledby="lost-caps-title"
      >
        <WorldCapsReveal>
          <p className="world-caps__meta">Capabilities</p>
          <h2 id="lost-caps-title" className="sr-only">
            Physical expression
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
        const side = i % 2 === 0 ? "left" : "right";
        const tone = i % 2 === 0 ? "paper" : "deep";

        return (
          <section
            key={project.slug}
            id={`project-${project.slug}`}
            className={`world-screen world-screen--project world-tone--${tone} world-project--${side}`}
            aria-labelledby={`lost-title-${project.slug}`}
          >
            <WorldProjectStage theme="lost">
              <Link
                href={`/get-lost/${project.slug}`}
                className="world-project__link"
              >
                <div className="world-project__frame">
                  <Image
                    src={assetPath(project.cover)}
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
                    id={`lost-title-${project.slug}`}
                    className="world-project__title"
                  >
                    {project.title}
                  </h2>
                  <p className="world-project__detail">
                    {project.materials ||
                      project.location?.split(",")[0] ||
                      "Physical work"}
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
          Mileage · {String(projects.length).padStart(2, "0")} places
        </p>
        <div className="world-foot__links">
          <Link href="/archive" className="world-foot__link">
            Full archive
          </Link>
          <Link href="/get-found" className="world-foot__link">
            Counterpart · GET FOUND
          </Link>
        </div>
      </footer>
    </div>
  );
}
