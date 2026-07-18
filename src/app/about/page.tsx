import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-12 font-display text-2xl tracking-nav text-ink md:text-4xl">
          <LogoMark className="text-2xl md:text-4xl" />
        </h1>

        <div className="space-y-8 font-sans text-base leading-relaxed text-ink md:text-[17px] md:leading-[1.65]">
          <p className="font-display text-xl leading-snug tracking-tight md:text-2xl">
            Sometimes getting lost is how brands get found.
          </p>
          <p>
            OFF_COURSE is a London studio founded by Yuming Chien. The name is
            the method: take the long way, leave the expected path, find better
            ideas by getting lost.
          </p>
          <p>
            GET LOST is physical work — murals, window painting, installation,
            spatial branding, public art, retail experience. Some ideas
            don&apos;t belong on screens.
          </p>
          <p>
            GET FOUND is what happens after discovery — websites, booking
            systems, CRM, automation, AI tools, internal platforms. Good systems
            are invisible.
          </p>
          <p>
            One studio. Two directions. Same instinct for clarity.
          </p>
          <p>
            <a
              href="mailto:hello@offcourse.studio"
              className="font-medium underline decoration-2 underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              hello@offcourse.studio
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
