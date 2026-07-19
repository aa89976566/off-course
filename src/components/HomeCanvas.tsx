"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, type MouseEvent } from "react";

/**
 * Home = immersive visual plane (Walala home energy).
 * Split GET LOST / GET FOUND as the only labels.
 */
export function HomeCanvas() {
  const [hovered, setHovered] = useState<"lost" | "found" | null>(null);
  const [ready, setReady] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20 });
  const y = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 20);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 16);
  };

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-white"
      onMouseMove={onMove}
      onMouseLeave={() => {
        setHovered(null);
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="flex h-full w-full flex-col md:flex-row">
        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{
            flexGrow: hovered === "lost" ? 1.55 : hovered === "found" ? 0.6 : 1,
          }}
          transition={{ duration: 0.12 }}
          onMouseEnter={() => setHovered("lost")}
          style={{ flexGrow: 1, opacity: hovered === "found" ? 0.55 : 1 }}
        >
          <Link href="/get-lost" className="absolute inset-0 block">
            <motion.div className="absolute inset-[-6%]" style={{ x, y }}>
              <Image
                src="/murals/hero.jpg"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="50vw"
              />
            </motion.div>
            <span className="absolute bottom-6 left-5 font-display text-sm uppercase tracking-[0.12em] text-white mix-blend-difference md:bottom-8 md:left-6 md:text-base">
              GET LOST →
            </span>
          </Link>
        </motion.div>

        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{
            flexGrow: hovered === "found" ? 1.55 : hovered === "lost" ? 0.6 : 1,
          }}
          transition={{ duration: 0.12 }}
          onMouseEnter={() => setHovered("found")}
          style={{ flexGrow: 1, opacity: hovered === "lost" ? 0.55 : 1 }}
        >
          <Link href="/get-found" className="absolute inset-0 block">
            <motion.div className="absolute inset-[-6%]" style={{ x, y }}>
              <Image
                src="/digital/hero.jpg"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="50vw"
              />
            </motion.div>
            <span className="absolute bottom-6 right-5 font-display text-sm uppercase tracking-[0.12em] text-white mix-blend-difference md:bottom-8 md:right-6 md:text-base">
              GET FOUND →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
