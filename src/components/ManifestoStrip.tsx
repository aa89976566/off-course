import Link from "next/link";
import { LogoMark } from "./Logo";

/** Below-fold strip — Walala keeps home visual; slogan lives here */
export function ManifestoStrip() {
  return (
    <section className="border-t border-black/10 bg-white px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-3xl">
        <LogoMark className="text-xl md:text-2xl" />
        <h2 className="mt-8 font-display text-3xl leading-[1.05] tracking-tight text-black md:text-5xl">
          GO OFF COURSE.
        </h2>
        <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-black md:text-lg">
          Sometimes getting lost
          <br />
          is how brands get found.
        </p>
        <Link
          href="/start"
          className="mt-10 inline-block font-display text-sm tracking-[0.14em] text-black hover:text-accent"
        >
          [ START THE DETOUR ]
        </Link>
      </div>
    </section>
  );
}
