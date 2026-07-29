"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "INDEX" },
  { href: "/get-found", label: "WORKS" },
  { href: "/about", label: "ABOUT" },
  { href: "/start", label: "CONTACT" },
] as const;

/** ZeroFrame-style floating pill nav for GET FOUND. */
export function FoundPillNav() {
  const pathname = usePathname();

  return (
    <nav className="zf-nav" aria-label="GET FOUND">
      <Link href="/" className="zf-nav__brand">
        OFF_COURSE®
      </Link>
      <ul className="zf-nav__links">
        {LINKS.map((item) => {
          const on =
            item.href === "/get-found"
              ? pathname.startsWith("/get-found")
              : pathname === item.href || pathname === `${item.href}/`;
          return (
            <li key={item.href}>
              <Link href={item.href} aria-current={on ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/projects" className="zf-nav__grid" aria-label="All projects">
        <span />
        <span />
        <span />
        <span />
      </Link>
    </nav>
  );
}
