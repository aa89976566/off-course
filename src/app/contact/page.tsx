import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-8 font-display text-2xl tracking-nav text-ink md:text-4xl">
          GET IN TOUCH
        </h1>
        <p className="font-sans text-base leading-relaxed text-ink md:text-[17px]">
          Whether it&apos;s a wall or a website — tell us what you&apos;re trying
          to say.
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
            Instagram:{" "}
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
