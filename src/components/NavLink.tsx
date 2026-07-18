"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type NavLinkProps = {
  href: string;
  label: string;
  active?: boolean;
  className?: string;
  /** Subtle horizontal drift on hover */
  drift?: boolean;
  /** Precise fade-in on hover */
  arrive?: boolean;
};

export function NavLink({
  href,
  label,
  active = false,
  className = "",
  drift = false,
  arrive = false,
}: NavLinkProps) {
  const [hovered, setHovered] = useState(false);

  const base =
    `font-display tracking-nav uppercase ${
      active ? "text-accent" : "text-ink"
    } ${className}`.trim();

  if (drift) {
    return (
      <Link
        href={href}
        className="inline-block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.span
          className={`inline-block ${base}`}
          animate={{ x: hovered ? 3 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {label}
        </motion.span>
      </Link>
    );
  }

  if (arrive) {
    return (
      <Link
        href={href}
        className="inline-block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.span
          className={`inline-block ${base}`}
          animate={{
            opacity: hovered || active ? 1 : 0.72,
            letterSpacing: hovered ? "0.14em" : "0.12em",
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} hover:text-accent`}
    >
      {label}
    </Link>
  );
}
