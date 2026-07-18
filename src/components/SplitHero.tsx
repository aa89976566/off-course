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
  const springX = useSpring(mx, { stiffness: 80, damping: 20 });
  const springY = useSpring(my, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x * 16);
    my.set(y * 12);
  };

  const lostGrow = hovered === "lost" ? 1.45 : hovered === "found" ? 0.7 : 1;
  const foundGrow = hovered === "found" ? 1.45 : hovered === "lost" ? 0.7 : 1;

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-paper pt-[6.5rem] md:pt-16"
      onMouseMove={onMove}
      onMouseLeave={() => {
        setHovered(null);
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 bg-paper"
        initial={{ opacity: 1 }}
        animate={{ opacity: ready ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      <div className="flex h-full w-full flex-col md:flex-row">
        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{ flexGrow: lostGrow }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseEnter={() => setHovered("lost")}
          style={{ opacity: hovered === "found" ? 0.55 : 1, flexGrow: 1 }}
        >
          <Link href="/get-lost" className="absolute inset-0 block">
            <motion.div
              className="absolute inset-[-4%]"
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
            <div className="absolute inset-0 bg-ink/10" />
            <motion.span
              className="absolute bottom-5 left-4 font-display text-sm tracking-nav text-paper mix-blend-difference md:bottom-8 md:left-6 md:text-base"
              animate={{ x: hovered === "lost" ? 4 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              GET LOST →
            </motion.span>
          </Link>
        </motion.div>

        <motion.div
          className="relative min-h-0 basis-0 overflow-hidden"
          animate={{ flexGrow: foundGrow }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseEnter={() => setHovered("found")}
          style={{ opacity: hovered === "lost" ? 0.55 : 1, flexGrow: 1 }}
        >
          <Link href="/get-found" className="absolute inset-0 block">
            <motion.div
              className="absolute inset-[-4%]"
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
            <div className="absolute inset-0 bg-ink/15" />
            <motion.span
              className="absolute bottom-5 right-4 font-display text-sm tracking-nav text-paper mix-blend-difference md:bottom-8 md:right-6 md:text-base"
              animate={{
                opacity: hovered === "found" || hovered === null ? 1 : 0.55,
                letterSpacing: hovered === "found" ? "0.16em" : "0.12em",
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              GET FOUND →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
