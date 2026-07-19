"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ManifestoHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-paper px-4 pb-20 pt-[6.5rem] md:justify-center md:px-6 md:pb-28 md:pt-16">
      {/* Subtle atmosphere — not a brand color block */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #0a0a0a 0.6px, transparent 0.7px), radial-gradient(circle at 80% 60%, #0a0a0a 0.5px, transparent 0.6px)",
          backgroundSize: "3px 3px, 4px 4px",
        }}
      />

      <motion.div
        className="relative mx-auto w-full max-w-5xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-6 font-display text-[10px] tracking-nav text-mute md:mb-8 md:text-[11px]">
          OFF
          <span className="logo-underscore mx-[0.06em] cursor-blink" />
          COURSE
        </p>

        <h1 className="font-display text-[12vw] leading-[0.9] tracking-tight text-ink md:text-[7.5rem]">
          GO OFF
          <br />
          COURSE.
        </h1>

        <p className="mt-10 max-w-sm font-sans text-lg leading-snug text-ink md:mt-14 md:max-w-md md:text-2xl md:leading-snug">
          Sometimes getting lost
          <br />
          is how brands get found.
        </p>

        <Link
          href="/start"
          className="mt-12 inline-flex items-center font-display text-sm tracking-nav text-ink transition-colors hover:text-accent md:mt-16"
        >
          [ Start the detour ]
        </Link>
      </motion.div>
    </section>
  );
}
