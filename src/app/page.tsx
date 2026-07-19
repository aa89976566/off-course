import { DualPaths } from "@/components/DualPaths";
import { ManifestoHero } from "@/components/ManifestoHero";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <div className="-mt-[6.5rem] md:-mt-16">
        <ManifestoHero />
      </div>
      <DualPaths />
      <section className="border-t border-ink/10 px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md font-display text-2xl leading-tight tracking-tight text-ink md:text-3xl">
            Take the long way.
            <br />
            Leave the expected path.
          </p>
          <Link
            href="/logbook"
            className="font-display text-sm tracking-nav text-ink hover:text-accent"
          >
            LOGBOOK →
          </Link>
        </div>
      </section>
    </>
  );
}
