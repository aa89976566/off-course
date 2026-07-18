"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export function DualPaths() {
  const [hovered, setHovered] = useState<"lost" | "found" | null>(null);

  return (
    <section className="border-t border-ink/10">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <Link
          href="/get-lost"
          className="group relative min-h-[70vh] overflow-hidden md:min-h-[85vh]"
          onMouseEnter={() => setHovered("lost")}
          onMouseLeave={() => setHovered(null)}
        >
          <Image
            src="/murals/hero.jpg"
            alt=""
            fill
            className="object-cover transition-opacity duration-300"
            style={{ opacity: hovered === "found" ? 0.45 : 1 }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-ink/20" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <motion.p
              className="font-display text-3xl tracking-nav text-paper md:text-5xl"
              animate={{ x: hovered === "lost" ? 4 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              GET LOST
            </motion.p>
            <p className="mt-3 max-w-xs font-sans text-sm text-paper/90 md:text-base">
              We left the route on purpose.
            </p>
          </div>
        </Link>

        <Link
          href="/get-found"
          className="group relative min-h-[70vh] overflow-hidden md:min-h-[85vh]"
          onMouseEnter={() => setHovered("found")}
          onMouseLeave={() => setHovered(null)}
        >
          <Image
            src="/digital/hero.jpg"
            alt=""
            fill
            className="object-cover transition-opacity duration-300"
            style={{ opacity: hovered === "lost" ? 0.45 : 1 }}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-ink/25" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-right md:p-10">
            <motion.p
              className="font-display text-3xl tracking-nav text-paper md:text-5xl"
              animate={{
                opacity: hovered === "found" || hovered === null ? 1 : 0.7,
                letterSpacing: hovered === "found" ? "0.16em" : "0.12em",
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              GET FOUND
            </motion.p>
            <p className="mt-3 ml-auto max-w-xs font-sans text-sm text-paper/90 md:text-base">
              Being found is only the beginning.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
