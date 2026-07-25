import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Start",
};

export default function StartPage() {
  return (
    <article className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 font-display text-3xl tracking-[0.08em] text-black md:text-5xl">
          START
        </h1>
        <p className="max-w-md font-sans text-base leading-relaxed text-black">
          A wall. A system. Or both.
          <br />
          Tell us where you are.
        </p>

        <div className="mt-10 space-y-2 font-sans text-base text-black">
          <p>
            <a
              href="mailto:hello@offcourse.studio"
              className="underline decoration-2 underline-offset-4 hover:text-brand"
            >
              hello@offcourse.studio
            </a>
          </p>
          <p>
            <a
              href="https://instagram.com/offcourse.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-4 hover:text-brand"
            >
              @offcourse.studio
            </a>
          </p>
        </div>

        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </article>
  );
}
