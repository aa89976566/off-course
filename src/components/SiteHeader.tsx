"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/content";
import { Logo } from "./Logo";
import { SiteMenu } from "./SiteMenu";

/**
 * Quiet navigation — supports the page, does not frame it.
 * Dual worlds are NOT listed here; they are discovered on the homepage.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), 1600);
    return () => window.clearTimeout(t);
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`site-header${isHome ? " is-home" : ""}${
          scrolled ? " is-scrolled" : ""
        }${visible ? " is-visible" : ""}`}
      >
        <div className="site-header__inner">
          <Logo className="text-[13px] md:text-sm" blink={isHome && !scrolled} />

          <nav className="site-header__nav" aria-label="Primary">
            <ul className="site-header__links">
              {NAV.links.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        active
                          ? "site-header__link is-active"
                          : "site-header__link"
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="site-header__grid"
              aria-label="Open site index"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span className="site-header__grid-icon" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            </button>
          </nav>
        </div>
      </header>

      <SiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
