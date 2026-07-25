"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/about", label: "ABOUT" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/start", label: "START" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }
    // Walala: header fades in after canvas settles
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 2200);
    return () => window.clearTimeout(t);
  }, [isHome]);

  const onFoundGallery =
    pathname === "/get-found" || pathname === "/get-found/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex h-[50px] items-center justify-between transition-opacity duration-700 ${
        onFoundGallery ? "bg-[#1a1b1e] text-white" : "bg-white text-black"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex w-full items-center justify-start pl-2.5">
        <Logo className="text-[15px] md:text-base" blink />
      </div>

      <nav
        className="flex w-full items-center justify-end gap-5 pr-2.5"
        aria-label="Primary"
      >
        <ul className="flex list-none items-center gap-5 text-[13px] font-bold uppercase tracking-wide md:text-sm">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="m-0">
                <Link
                  href={item.href}
                  className={
                    active
                      ? "text-[var(--walala-lilac)]"
                      : onFoundGallery
                        ? "text-white/80 hover:text-[var(--walala-lilac)]"
                        : "text-black hover:text-[var(--walala-lilac)]"
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-3 sm:flex">
          <a
            href="https://instagram.com/offcourse.studio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className={
              onFoundGallery
                ? "text-white/80 hover:text-[var(--walala-red)]"
                : "text-black hover:text-[var(--walala-red)]"
            }
          >
            <Ig />
          </a>
          <a
            href="mailto:hello@offcourse.studio"
            aria-label="Email"
            className={
              onFoundGallery
                ? "text-white/80 hover:text-[var(--walala-red)]"
                : "text-black hover:text-[var(--walala-red)]"
            }
          >
            <Mail />
          </a>
        </div>
      </nav>
    </header>
  );
}

function Ig() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function Mail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
