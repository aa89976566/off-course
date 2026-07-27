"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import type { Project } from "@/lib/projects";
import { assetPath } from "@/lib/utils";

type FoundWorksProps = {
  projects: Project[];
};

const EASE: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 32,
  mass: 0.85,
};

/**
 * GET FOUND — ZeroFrame-style works UI:
 * pill nav, cinematic hero, expanding capsule accordion, project grid.
 */
export function FoundWorks({ projects }: FoundWorksProps) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const featured = projects.slice(0, 6);
  const rest = projects.slice(6);
  const heroProject = featured[0];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openProject = useCallback(
    (project: Project) => {
      if (project.liveUrl) {
        window.open(project.liveUrl, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(`/get-found/${project.slug}`);
    },
    [router]
  );

  return (
    <div className="found-zf">
      <nav className="found-zf__nav" aria-label="GET FOUND">
        <Link href="/" className="found-zf__nav-brand">
          OFF_COURSE®
        </Link>
        <ul className="found-zf__nav-links">
          <li>
            <Link href="/">INDEX</Link>
          </li>
          <li>
            <Link href="/get-found" aria-current="page">
              WORKS
            </Link>
          </li>
          <li>
            <Link href="/about">ABOUT</Link>
          </li>
          <li>
            <Link href="/start">CONTACT</Link>
          </li>
        </ul>
        <Link
          href="/projects"
          className="found-zf__nav-grid"
          aria-label="All projects"
        >
          <span />
          <span />
          <span />
          <span />
        </Link>
      </nav>

      {/* Hero — brand + one line, full-bleed image */}
      <header className="found-zf__hero">
        {heroProject && (
          <Image
            src={assetPath(heroProject.cover)}
            alt=""
            fill
            priority
            className="found-zf__hero-img"
            sizes="100vw"
          />
        )}
        <div className="found-zf__hero-veil" aria-hidden />
        <div className="found-zf__hero-copy">
          <p className="found-zf__hero-brand">GET FOUND</p>
          <p className="found-zf__hero-line">
            Websites, booking systems, and platforms built so brands get found —
            after discovery.
          </p>
        </div>
        <a href="#works" className="found-zf__scroll">
          VIEW WORKS
        </a>
      </header>

      {/* Accordion capsules — ZeroFrame signature */}
      <section
        id="works"
        className="found-zf__accordion-section"
        aria-label="Featured website cases"
      >
        <div className="found-zf__section-head">
          <h2 className="found-zf__section-title">WORKS</h2>
          <p className="found-zf__section-count">
            {String(projects.length).padStart(3, "0")}
          </p>
          <p className="found-zf__section-tag">
            Building sites that feel as good as they look.
          </p>
        </div>

        <div
          className="found-zf__accordion"
          onMouseLeave={() => {
            if (!narrow) setActive(0);
          }}
        >
          {featured.map((project, i) => {
            const on = i === active;
            return (
              <motion.button
                key={project.slug}
                type="button"
                className={`found-zf__capsule${on ? " is-active" : ""}`}
                aria-current={on ? "true" : undefined}
                aria-label={`${project.title}, ${project.type}, ${project.year}`}
                onMouseEnter={() => {
                  if (!narrow) setActive(i);
                }}
                onFocus={() => setActive(i)}
                onClick={() => {
                  if (narrow && !on) {
                    setActive(i);
                    return;
                  }
                  openProject(project);
                }}
                initial={false}
                animate={
                  narrow
                    ? { flexGrow: 1, filter: "grayscale(0%)" }
                    : {
                        flexGrow: on ? 4.2 : 0.55,
                        filter: on ? "grayscale(0%)" : "grayscale(100%)",
                      }
                }
                transition={reduce ? { duration: 0 } : EASE}
              >
                <Image
                  src={assetPath(project.cover)}
                  alt=""
                  fill
                  className="found-zf__capsule-img"
                  sizes="(max-width: 768px) 80vw, 40vw"
                  priority={i < 2}
                />
                <div className="found-zf__capsule-veil" aria-hidden />
                <motion.div
                  className="found-zf__capsule-meta"
                  initial={false}
                  animate={{
                    opacity: on ? 1 : 0,
                    y: on ? 0 : 10,
                    pointerEvents: on ? "auto" : "none",
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <p className="found-zf__capsule-title">{project.title}</p>
                  <p className="found-zf__capsule-type">{project.type}</p>
                  <p className="found-zf__capsule-year">{project.year}</p>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Secondary grid — remaining cases */}
      {rest.length > 0 && (
        <section className="found-zf__grid-section" aria-label="More cases">
          <div className="found-zf__grid">
            {rest.map((project) => (
              <Link
                key={project.slug}
                href={project.liveUrl || `/get-found/${project.slug}`}
                target={project.liveUrl ? "_blank" : undefined}
                rel={project.liveUrl ? "noopener noreferrer" : undefined}
                className="found-zf__card"
              >
                <div className="found-zf__card-media">
                  <Image
                    src={assetPath(project.cover)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 32vw"
                  />
                </div>
                <div className="found-zf__card-meta">
                  <p className="found-zf__card-title">{project.title}</p>
                  <p className="found-zf__card-type">{project.type}</p>
                  <p className="found-zf__card-year">{project.year}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="found-zf__footer">
        <p className="found-zf__footer-line">
          Thinking about your next site? We&apos;re ready when you are.
        </p>
        <Link href="/start" className="found-zf__footer-cta">
          START A PROJECT ↘
        </Link>
      </footer>
    </div>
  );
}
