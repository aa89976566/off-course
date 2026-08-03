import type { Metadata } from "next";
import Link from "next/link";
import { STUDIO, WORLDS } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="about-page">
      <p className="ed-meta">Studio</p>
      <h1 className="ed-display">About</h1>
      <p className="ed-body about-page__lead">{STUDIO.positioning}</p>

      <section className="about-page__block">
        <h2 className="ed-section">Stance</h2>
        <p className="ed-body">
          OFF_COURSE is a London studio founded by Yuming Chien, working across
          large-scale physical interventions and the digital systems brands need
          after they&apos;re discovered. The name is the method: leave the
          expected path, find better ideas by getting lost.
        </p>
      </section>

      <section className="about-page__worlds">
        <div>
          <p className="ed-meta">Frequency · 01</p>
          <h2 className="ed-section">{WORLDS.lost.label}</h2>
          <p className="about-page__statement">{WORLDS.lost.statement}</p>
          <p className="ed-body">{WORLDS.lost.blurb}</p>
          <Link href={WORLDS.lost.href} className="ed-text-link">
            Enter
          </Link>
        </div>
        <div>
          <p className="ed-meta">Frequency · 02</p>
          <h2 className="ed-section">{WORLDS.found.label}</h2>
          <p className="about-page__statement">{WORLDS.found.statement}</p>
          <p className="ed-body">{WORLDS.found.blurb}</p>
          <Link href={WORLDS.found.href} className="ed-text-link">
            Enter
          </Link>
        </div>
      </section>

      <section className="about-page__block">
        <h2 className="ed-section">Independence</h2>
        <p className="ed-body">
          A project never needs to become both worlds. Bridge only when it
          creates meaningful value — never as a third category.
        </p>
      </section>

      <p className="about-page__mail">
        <a href={`mailto:${STUDIO.email}`} className="ed-text-link">
          {STUDIO.email}
        </a>
      </p>
    </article>
  );
}
