"use client";

import { useEffect, useState } from "react";

export type WorldChapter = {
  id: string;
  label: string;
};

type Props = {
  chapters: WorldChapter[];
  theme: "found" | "lost";
};

export function WorldChapterRail({ chapters, theme }: Props) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const nodes = chapters
      .map((c) => document.getElementById(c.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      className={`world-rail world-rail--${theme}`}
      aria-label="Chapter navigation"
    >
      <ol className="world-rail__list">
        {chapters.map((chapter) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={`world-rail__link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="world-rail__mark" aria-hidden="true" />
                <span className="world-rail__label">{chapter.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
