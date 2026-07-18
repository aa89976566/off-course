import Link from "next/link";
import { LogoMark } from "./Logo";

export function StudioIntro() {
  return (
    <section className="border-t border-ink/10 bg-paper px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10">
          <LogoMark className="text-3xl md:text-5xl" />
        </h2>
        <p className="max-w-xl font-display text-2xl leading-tight tracking-tight text-ink md:text-4xl">
          Sometimes getting lost is how brands get found.
        </p>
        <p className="mt-8 max-w-lg font-sans text-base leading-relaxed text-ink md:text-[17px] md:leading-[1.65]">
          A London studio for physical interventions and the systems that keep
          brands running after discovery. We take the long way on purpose.
        </p>
        <div className="mt-12 flex flex-wrap gap-10">
          <Link
            href="/get-lost"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            GET LOST
          </Link>
          <Link
            href="/get-found"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            GET FOUND
          </Link>
        </div>
      </div>
    </section>
  );
}
