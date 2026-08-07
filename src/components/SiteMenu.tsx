"use client";

import Link from "next/link";
import { useEffect } from "react";
import { NAV, STUDIO, WORLDS } from "@/lib/content";
import { Logo } from "./Logo";

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-screen editorial index — quiet, typographic, not an app drawer.
 */
export function SiteMenu({ open, onClose }: SiteMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site index"
    >
      <div className="site-menu__bar">
        <Logo className="text-[13px] md:text-sm" blink={false} />
        <button
          type="button"
          className="site-menu__close"
          onClick={onClose}
          aria-label="Close menu"
        >
          Close
        </button>
      </div>

      <nav className="site-menu__body" aria-label="Editorial index">
        <ul className="site-menu__list">
          <li>
            <Link href="/" className="site-menu__link" onClick={onClose}>
              <span className="site-menu__idx">00</span>
              <span className="site-menu__label">Index</span>
              <span className="site-menu__meta">Entrance</span>
            </Link>
          </li>
          {NAV.links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="site-menu__link"
                onClick={onClose}
              >
                <span className="site-menu__idx">{item.index}</span>
                <span className="site-menu__label">{item.label}</span>
                <span className="site-menu__meta" />
              </Link>
            </li>
          ))}
          {NAV.menuExtras.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="site-menu__link site-menu__link--world"
                onClick={onClose}
              >
                <span className="site-menu__idx">{item.index}</span>
                <span className="site-menu__label">{item.label}</span>
                <span className="site-menu__meta">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ul>

        <aside className="site-menu__aside">
          <p className="site-menu__aside-kicker">{STUDIO.tagline}</p>
          <p className="site-menu__aside-copy">{STUDIO.positioning}</p>
          <p className="site-menu__aside-worlds">
            <span>{WORLDS.lost.statement}</span>
            <span>{WORLDS.found.statement}</span>
          </p>
          <a
            href={`mailto:${STUDIO.email}`}
            className="site-menu__invite"
            onClick={onClose}
          >
            {STUDIO.email}
          </a>
        </aside>
      </nav>
    </div>
  );
}
