import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { STUDIO } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <article className="contact-page">
      <p className="ed-meta">Destination</p>
      <h1 className="ed-display">Contact</h1>
      <p className="ed-body contact-page__lead">
        A wall. A system. Or both — tell us where you are on the route.
      </p>

      <div className="contact-page__channels">
        <a href={`mailto:${STUDIO.email}`} className="ed-text-link">
          {STUDIO.email}
        </a>
        <a
          href={STUDIO.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="ed-text-link"
        >
          {STUDIO.instagramHandle}
        </a>
      </div>

      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
    </article>
  );
}
