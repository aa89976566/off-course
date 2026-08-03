import Image from "next/image";
import Link from "next/link";
import { WORLDS } from "@/lib/content";
import { getProjectCode, type Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundIndexProps = {
  projects: Project[];
};

const ACCESS_LINES = [
  { n: "01", label: "Websites" },
  { n: "02", label: "Systems" },
  { n: "03", label: "Applications" },
  { n: "04", label: "CMS" },
  { n: "05", label: "Automation" },
  { n: "06", label: "AI" },
  { n: "07", label: "Internal tools" },
] as const;

/** Composition types — never consecutive repeats via i % 3 */
function compositionType(i: number): "a" | "b" | "c" {
  const t = i % 3;
  if (t === 0) return "a";
  if (t === 1) return "b";
  return "c";
}

/**
 * GET FOUND index — opening, access statement, then alternating A/B/C spreads.
 */
export function FoundIndex({ projects }: FoundIndexProps) {
  return (
    <div className="found-index">
      {/* Opening — chapter, no project image */}
      <header className="spread spread--found-open">
        <p className="ed-meta">Frequency locked</p>
        <h1 className="ed-display">{WORLDS.found.label}</h1>
        <p className="spread-found-open__statement">{WORLDS.found.statement}</p>
      </header>

      {/* Access statement — specification / contents page */}
      <section className="spread spread--access" aria-label="Access">
        <p className="ed-meta">Contents</p>
        <h2 className="ed-section">Digital places</h2>
        <ol className="spread-access__list">
          {ACCESS_LINES.map((item) => (
            <li key={item.n} className="spread-access__row">
              <span className="spread-access__n">{item.n}</span>
              <span className="spread-access__label">{item.label}</span>
            </li>
          ))}
        </ol>
        <p className="ed-body spread-access__note">{WORLDS.found.blurb}</p>
      </section>

      <ol className="found-index__list">
        {projects.map((project, i) => {
          const type = compositionType(i);
          const code = getProjectCode(project);
          const src = project.artwork?.[0] || project.cover;
          const hook = project.summary?.split("\n\n")[0];

          return (
            <li key={project.slug} className={`spread spread--proj spread--proj-${type}`}>
              <Link
                href={`/get-found/${project.slug}`}
                className={`spread-proj__link spread-proj__link--${type}`}
              >
                {type === "c" ? (
                  <>
                    <div className="spread-proj__type-mass">
                      <p className="ed-meta">
                        {code}
                        <span aria-hidden> · </span>
                        {project.type}
                        <span aria-hidden> · </span>
                        {project.year}
                      </p>
                      <h2 className="spread-proj__display">{project.title}</h2>
                      {hook && <p className="ed-body">{hook}</p>}
                    </div>
                    <div className="spread-proj__window">
                      <Image
                        src={assetPath(src)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 70vw, 28vw"
                        priority={i < 2}
                      />
                    </div>
                  </>
                ) : type === "b" ? (
                  <>
                    <div className="spread-proj__portrait">
                      <Image
                        src={assetPath(src)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 42vw"
                        priority={i < 2}
                      />
                    </div>
                    <div className="spread-proj__side">
                      <p className="ed-meta">
                        {code}
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
                      <h2 className="spread-proj__title">{project.title}</h2>
                      {hook && <p className="ed-body">{hook}</p>}
                      <span className="ed-text-link">Open case</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="spread-proj__wide">
                      <Image
                        src={assetPath(src)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={i < 2}
                      />
                    </div>
                    <div className="spread-proj__under">
                      <p className="ed-meta">
                        {code}
                        <span aria-hidden> · </span>
                        {project.type}
                        <span aria-hidden> · </span>
                        {project.year}
                      </p>
                      <h2 className="spread-proj__title">{project.title}</h2>
                    </div>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      <footer className="found-index__foot">
        <p className="ed-meta">
          Mileage · {String(projects.length).padStart(2, "0")} signals
        </p>
        <Link href="/archive" className="ed-text-link">
          Full archive
        </Link>
      </footer>
    </div>
  );
}
