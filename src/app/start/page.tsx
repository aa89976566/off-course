import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Start",
  description: "Start the detour.",
};

export default function StartPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-8 font-display text-2xl tracking-nav text-ink md:text-4xl">
          START THE DETOUR
        </h1>
        <p className="max-w-md font-sans text-base leading-relaxed text-ink md:text-[17px]">
          A wall. A system. Or both.
          <br />
          Tell us where you are.
        </p>

        <div className="mt-10 space-y-3 font-sans text-base text-ink">
          <p>
            <a
              href="mailto:hello@offcourse.studio"
              className="font-medium underline decoration-2 underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              hello@offcourse.studio
            </a>
          </p>
          <p>
            <a
              href="https://instagram.com/offcourse.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-2 underline-offset-4 hover:text-accent hover:decoration-accent"
            >
              @offcourse.studio
            </a>
          </p>
        </div>

        <ContactForm />
      </div>
    </article>
  );
}
