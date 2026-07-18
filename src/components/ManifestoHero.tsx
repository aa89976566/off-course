"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ManifestoHero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end bg-paper px-4 pb-16 pt-[6.5rem] md:justify-center md:px-6 md:pb-24 md:pt-16">
      <motion.div
        className="mx-auto w-full max-w-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-display text-[11vw] leading-[0.92] tracking-tight text-ink md:text-[7rem]">
          GO OFF
          <br />
          COURSE.
        </h1>

        <p className="mt-10 max-w-md font-sans text-lg leading-snug text-ink md:mt-14 md:text-2xl md:leading-snug">
          Sometimes getting lost
          <br />
          is how brands get found.
        </p>

        <Link
          href="/start"
          className="mt-12 inline-block font-display text-sm tracking-nav text-ink hover:text-accent md:mt-16"
        >
          [ Start the detour ]
        </Link>
      </motion.div>
    </section>
  );
}
