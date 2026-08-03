import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import {
  getProjectCode,
  getProjectsByStream,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "GET LOST",
  description: WORLDS.lost.blurb,
};

export default function GetLostPage() {
  const projects = getProjectsByStream("lost");

  return (
    <div className="lost-index">
      <header className="lost-index__open">
        <p className="ed-meta">Off-map</p>
        <h1 className="ed-display">{WORLDS.lost.label}</h1>
        <p className="lost-index__statement">{WORLDS.lost.statement}</p>
        <p className="ed-body lost-index__lead">{WORLDS.lost.blurb}</p>
      </header>

      <ol className="lost-index__list">
        {projects.map((project, i) => (
          <li
            key={project.slug}
            className={`lost-spread lost-spread--${i % 3}`}
          >
            <Link
              href={`/get-lost/${project.slug}`}
              className="lost-spread__link"
            >
              <div className="lost-spread__media">
                <Image
                  src={assetPath(project.cover)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={i < 2}
                />
              </div>
              <div className="lost-spread__copy">
                <p className="ed-meta">
                  {getProjectCode(project)}
                  <span aria-hidden> · </span>
                  {project.type}
                  {project.location ? (
                    <>
                      <span aria-hidden> · </span>
                      {project.location.split(",")[0]}
                    </>
                  ) : null}
                  <span aria-hidden> · </span>
                  {project.year}
                </p>
                <h2 className="lost-spread__title">{project.title}</h2>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
