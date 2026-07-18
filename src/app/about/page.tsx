import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-10 font-display text-2xl tracking-nav text-ink md:text-4xl">
          <span className="inline-flex items-baseline">
            <LogoMark className="text-2xl md:text-4xl" />
            <span className="ml-3">STUDIO</span>
          </span>
        </h1>

        <div className="space-y-6 font-sans text-base leading-relaxed text-ink md:text-[17px] md:leading-[1.65]">
          <p>
            OFF_COURSE is a London creative agency founded by Yuming Chien,
            working across visual and systems. The practice is organised in two
            modes — Work for commissioned projects, and Playground for
            self-initiated experiments — and two disciplines that stay in
            conversation: large-scale visual work, and the digital infrastructure
            a small business actually needs.
          </p>
          <p>
            On the visual side, the studio paints storefronts, interiors and
            public walls for shop owners and brands who want their space to say
            something before a single word is read. On the systems side, the
            studio designs and builds websites, booking tools and lightweight
            internal products for the same kind of independent businesses — the
            people who need something that works on day one and doesn&apos;t need
            an agency retainer to maintain.
          </p>
          <p>
            Work is where those disciplines meet a brief. Playground is where
            they meet a hunch. Both start from the same place: a sketch, a color,
            and a question about what the space or the business is actually
            trying to say.
          </p>
          <p>
            Get in touch:{" "}
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
