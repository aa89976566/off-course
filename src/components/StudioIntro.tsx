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
          A London studio working in two mediums: paint and code. We hand-paint
          murals for shops, restaurants and public spaces, and we design the
          websites and back-end systems that keep those same businesses running.
          One studio, two outputs, the same instinct for color, pattern and
          clarity.
        </p>
        <div className="mt-10 flex flex-wrap gap-8">
          <Link
            href="/murals"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            SEE THE WALLS
          </Link>
          <Link
            href="/digital"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            SEE THE SYSTEMS
          </Link>
        </div>
      </div>
    </section>
  );
}
