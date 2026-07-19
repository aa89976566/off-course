import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-10 font-display text-3xl tracking-[0.08em] text-black md:text-5xl">
          OFF_COURSE STUDIO
        </h1>

        <div className="space-y-6 font-sans text-base leading-relaxed text-black md:text-[16px] md:leading-[1.6]">
          <p>
            OFF_COURSE is a London studio founded by Yuming Chien, working
            across large-scale physical interventions and the digital systems
            brands need after they&apos;re discovered. The name is the method:
            take the long way, leave the expected path, find better ideas by
            getting lost.
          </p>
          <p>
            GET LOST is the physical side of the practice — murals, window
            painting, installation, spatial branding, public art and retail
            experience. Work that uses the built environment as a platform.
            Some ideas don&apos;t belong on screens.
          </p>
          <p>
            GET FOUND is what follows discovery — websites, booking systems,
            CRM, automation, AI tools and internal platforms. Quiet
            infrastructure that keeps independent businesses running without an
            agency retainer. Good systems are invisible.
          </p>
          <p>
            Both directions start from the same place: a sketch, a colour, and a
            question about what the space or the business is actually trying to
            say.
          </p>
          <p>
            Sometimes getting lost is how brands get found.
          </p>
          <p>
            <a
              href="mailto:hello@offcourse.studio"
              className="font-medium underline decoration-2 underline-offset-4 hover:text-accent"
            >
              hello@offcourse.studio
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
