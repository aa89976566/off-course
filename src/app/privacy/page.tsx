import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <article className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 font-display text-2xl tracking-nav text-ink md:text-4xl">
          PRIVACY POLICY
        </h1>
        <div className="space-y-4 font-sans text-base leading-relaxed text-ink">
          <p>
            OFF_COURSE collects only the information you choose to send us —
            typically your name, email address, and message via the contact form
            or email.
          </p>
          <p>
            We use that information solely to respond to enquiries. We do not
            sell, rent, or share personal data with third parties for marketing.
          </p>
          <p>
            If you have questions about this policy, write to{" "}
            <a
              href="mailto:hello@offcourse.studio"
              className="underline decoration-2 underline-offset-4 hover:text-brand"
            >
              hello@offcourse.studio
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}
