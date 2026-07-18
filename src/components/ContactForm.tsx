"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Front-end only — wire to email/API later
    setSent(true);
  };

  if (sent) {
    return (
      <p className="mt-10 font-sans text-base text-ink">
        Thanks — we&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 max-w-md space-y-6">
      <label className="block">
        <span className="font-display text-[10px] tracking-nav text-mute">
          NAME
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          className="input-line mt-1"
          placeholder="Your name"
        />
      </label>
      <label className="block">
        <span className="font-display text-[10px] tracking-nav text-mute">
          EMAIL
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-line mt-1"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="font-display text-[10px] tracking-nav text-mute">
          MESSAGE
        </span>
        <textarea
          name="message"
          required
          rows={4}
          className="input-line mt-1 resize-none"
          placeholder="Wall or website — tell us what you're trying to say."
        />
      </label>
      <button
        type="submit"
        className="font-display text-sm tracking-nav text-ink hover:text-accent"
      >
        SEND →
      </button>
    </form>
  );
}
