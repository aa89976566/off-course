import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="flex min-h-[calc(100svh-100px)] w-full flex-col items-center justify-center px-10 py-10">
      <div className="w-full max-w-[700px] bg-black p-10 text-white md:p-10">
        <h1 className="mb-5 font-display text-2xl uppercase tracking-wide md:text-3xl">
          OFF_COURSE STUDIO
        </h1>
        <div className="flex flex-col gap-2.5 text-base leading-relaxed">
          <p className="mb-5">
            OFF_COURSE is a London studio founded by Yuming Chien, working
            across large-scale physical interventions and the digital systems
            brands need after they&apos;re discovered. The name is the method:
            take the long way, leave the expected path, find better ideas by
            getting lost.
          </p>
          <p className="mb-5">
            GET LOST is murals, window painting, installation, spatial branding,
            public art and retail experience. GET FOUND is websites, booking
            systems, CRM, automation and internal platforms. Sometimes getting
            lost is how brands get found.
          </p>
          <p>
            <a
              href="mailto:hello@offcourse.studio"
              className="underline decoration-2 underline-offset-4"
            >
              hello@offcourse.studio
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
