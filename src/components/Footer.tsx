"use client";

import Link from "next/link";
import { STUDIO } from "@/lib/content";

/** Quiet editorial footer */
export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/privacy" className="site-footer__link">
        Privacy
      </Link>
      <div className="site-footer__right">
        <a
          href={STUDIO.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer__link"
        >
          {STUDIO.instagramHandle}
        </a>
        <a href={`mailto:${STUDIO.email}`} className="site-footer__link">
          {STUDIO.email}
        </a>
      </div>
    </footer>
  );
}
