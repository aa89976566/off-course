import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-12">
          <LogoMark className="text-2xl md:text-4xl" />
        </h1>

        <div className="space-y-8 font-sans text-base leading-relaxed text-ink md:text-[17px] md:leading-[1.65]">
          <p className="font-display text-xl leading-snug tracking-tight md:text-3xl">
            Sometimes getting lost
            <br />
            is how brands get found.
          </p>
          <p>
            OFF_COURSE is a London studio founded by Yuming Chien. The name is
            the method: take the long way, leave the expected path, find better
            ideas by getting lost.
          </p>
          <p>
            <Link href="/get-lost" className="underline decoration-2 underline-offset-4 hover:text-accent">
              GET LOST
            </Link>{" "}
            is physical work — murals, window painting, installation, spatial
            branding, public art, retail experience. Some ideas don&apos;t belong
            on screens.
          </p>
          <p>
            <Link href="/get-found" className="underline decoration-2 underline-offset-4 hover:text-accent">
              GET FOUND
            </Link>{" "}
            is what happens after discovery — websites, booking systems, CRM,
            automation, AI tools, internal platforms. Good systems are
            invisible.
          </p>
          <p>One studio. Two directions. Same instinct for clarity.</p>
          <p>
            <Link
              href="/start"
              className="font-display text-sm tracking-nav hover:text-accent"
            >
              [ Start the detour ]
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
