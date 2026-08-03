import Image from "next/image";
import Link from "next/link";
import { STUDIO, WORLDS } from "@/lib/content";
import {
  getProjectCode,
  getProjectsByStream,
} from "@/lib/projects";
import { assetPath } from "@/lib/utils";

/**
 * Homepage editorial continuation — magazine spreads after radio.
 * Composition only: each viewport has a different centre of mass.
 */
export function HomeEditorial() {
  const lostPick = getProjectsByStream("lost")[0];
  const foundPick =
    getProjectsByStream("found").find((p) => p.slug === "jieshin-tseng") ||
    getProjectsByStream("found")[0];

  const lostMaterial =
    lostPick?.images?.[1] || lostPick?.cover || "/media/murals/shoreditch-1.jpg";

  return (
    <div id="home-editorial" className="home-editorial">
      {/* SPREAD A — Half-title: Concrete & Code */}
      <section className="spread spread--half-title" aria-labelledby="half-title">
        <p className="ed-meta spread__edge-meta">Signal · {STUDIO.worldwide}</p>
        <h2 id="half-title" className="spread-half__display">
          {STUDIO.tagline}
        </h2>
        <p className="spread-half__line">{STUDIO.positioning}</p>
      </section>

      {/* SPREAD B — GET LOST door only */}
      <section className="spread spread--lost-door" aria-label="GET LOST">
        <div className="spread-lost-door__media">
          <Image
            src={assetPath(lostMaterial)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 68vw"
            priority
          />
        </div>
        <div className="spread-lost-door__copy">
          <p className="ed-meta">Frequency · 01</p>
          <h2 className="ed-section">{WORLDS.lost.label}</h2>
          <p className="spread-door__statement">{WORLDS.lost.statement}</p>
          <Link href={WORLDS.lost.href} className="ed-text-link">
            Enter
          </Link>
        </div>
      </section>

      {/* SPREAD C — GET FOUND door — different genotype */}
      <section className="spread spread--found-door" aria-label="GET FOUND">
        <div className="spread-found-door__copy">
          <p className="ed-meta">Frequency · 02</p>
          <h2 className="spread-found-door__display">{WORLDS.found.label}</h2>
          <p className="spread-door__statement">{WORLDS.found.statement}</p>
          <Link href={WORLDS.found.href} className="ed-text-link">
            Enter
          </Link>
        </div>
        {foundPick && (
          <div className="spread-found-door__strip">
            <Image
              src={assetPath(foundPick.artwork?.[0] || foundPick.cover)}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </section>

      {/* SPREAD D — Selected Lost — one project, image-led */}
      {lostPick && (
        <section className="spread spread--selected-lost" aria-label="Selected Lost">
          <Link
            href={`/get-lost/${lostPick.slug}`}
            className="spread-selected-lost__link"
          >
            <div className="spread-selected-lost__media">
              <Image
                src={assetPath(lostPick.cover)}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="spread-selected-lost__edge">
              <p className="ed-meta">
                {getProjectCode(lostPick)}
                <span aria-hidden> · </span>
                {WORLDS.lost.label}
                <span aria-hidden> · </span>
                {lostPick.year}
              </p>
              <h3 className="spread-selected-lost__title">{lostPick.title}</h3>
            </div>
          </Link>
        </section>
      )}

      {/* SPREAD E — Selected Found — framed / structured, not Lost mirror */}
      {foundPick && (
        <section className="spread spread--selected-found" aria-label="Selected Found">
          <Link
            href={`/get-found/${foundPick.slug}`}
            className="spread-selected-found__link"
          >
            <div className="spread-selected-found__meta">
              <p className="ed-meta">
                {getProjectCode(foundPick)}
                <span aria-hidden> · </span>
                {foundPick.type}
                {foundPick.location ? (
                  <>
                    <span aria-hidden> · </span>
                    {foundPick.location.split(",")[0]}
                  </>
                ) : null}
                <span aria-hidden> · </span>
                {foundPick.year}
              </p>
              <h3 className="spread-selected-found__title">{foundPick.title}</h3>
              {foundPick.summary && (
                <p className="ed-body spread-selected-found__hook">
                  {foundPick.summary.split("\n\n")[0]}
                </p>
              )}
            </div>
            <div className="spread-selected-found__plate">
              <Image
                src={assetPath(foundPick.artwork?.[0] || foundPick.cover)}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 48vw"
              />
            </div>
          </Link>
        </section>
      )}

      {/* SPREAD F — Close / colophon */}
      <section className="spread spread--close" aria-label="Destination">
        <div className="spread-close__invite">
          <p className="ed-meta">Destination</p>
          <p className="spread-close__line">Tell us where you are headed.</p>
          <Link href="/contact" className="ed-text-link">
            Contact
          </Link>
        </div>
        <p className="ed-meta spread-close__mileage">Arrival · Index</p>
      </section>
    </div>
  );
}
