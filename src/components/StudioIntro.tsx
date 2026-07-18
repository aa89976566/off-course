import Link from "next/link";
import { LogoMark } from "./Logo";

export function StudioIntro() {
  return (
    <section className="border-t border-ink/10 bg-paper px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8">
          <LogoMark className="text-3xl md:text-5xl" />
        </h2>
        <p className="font-sans text-base leading-relaxed text-ink md:text-[17px] md:leading-[1.65]">
          A London creative agency working across visual and systems. We paint
          walls and build the digital infrastructure shops need to run — then we
          keep a playground for the experiments that don&apos;t start with a
          brief. One studio, two practices, two modes of making.
        </p>
        <div className="mt-10 flex flex-wrap gap-8">
          <Link
            href="/work"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            SEE THE WORK
          </Link>
          <Link
            href="/playground"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            SEE THE PLAYGROUND
          </Link>
        </div>
      </div>
    </section>
  );
}
