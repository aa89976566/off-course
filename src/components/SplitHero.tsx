"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, type MouseEvent } from "react";

type Side = "lost" | "found" | null;

export function SplitHero() {
  const [hovered, setHovered] = useState<Side>(null);
  const [ready, setReady] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 70, damping: 22 });
  const springY = useSpring(my, { stiffness: 70, damping: 22 });

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(t);
  }, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x * 18);
    my.set(y * 14);
  };

  const lostGrow = hovered === "lost" ? 1.5 : hovered === "found" ? 0.65 : 1;
  const foundGrow = hovered === "found" ? 1.5 : hovered === "lost" ? 0.65 : 1;

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
      {/* Brief white preload — Walala-style resolve */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        initial={{ opacity: 1 }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      <div className="flex h-full w-full flex-col md:flex-row">
        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{ flexGrow: lostGrow }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onMouseEnter={() => setHovered("lost")}
          style={{
            opacity: hovered === "found" ? 0.5 : 1,
            flexGrow: 1,
          }}
        >
          <Link href="/get-lost" className="absolute inset-0 block">
            <motion.div
              className="absolute inset-[-5%]"
              style={{ x: springX, y: springY }}
            >
              <Image
                src="/murals/hero.jpg"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </motion.div>
            <motion.span
              className="absolute bottom-6 left-5 z-10 font-display text-base tracking-[0.14em] text-white mix-blend-difference md:bottom-8 md:left-7 md:text-lg"
              animate={{ x: hovered === "lost" ? 5 : 0 }}
              transition={{ duration: 0.18 }}
            >
              GET LOST →
            </motion.span>
          </Link>
        </motion.div>

        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{ flexGrow: foundGrow }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onMouseEnter={() => setHovered("found")}
          style={{
            opacity: hovered === "lost" ? 0.5 : 1,
            flexGrow: 1,
          }}
        >
          <Link href="/get-found" className="absolute inset-0 block">
            <motion.div
              className="absolute inset-[-5%]"
              style={{ x: springX, y: springY }}
            >
              <Image
                src="/digital/hero.jpg"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
            </motion.div>
            <motion.span
              className="absolute bottom-6 right-5 z-10 font-display text-base tracking-[0.14em] text-white mix-blend-difference md:bottom-8 md:right-7 md:text-lg"
              animate={{
                opacity: hovered === "found" || hovered === null ? 1 : 0.65,
                letterSpacing: hovered === "found" ? "0.18em" : "0.14em",
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              GET FOUND →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
