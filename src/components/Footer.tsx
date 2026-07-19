import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper">
      <div className="flex flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between md:px-6 md:py-10">
        <div>
          <LogoMark className="text-sm" />
          <p className="mt-3 max-w-xs font-sans text-sm leading-snug text-mute">
            Sometimes getting lost is how brands get found.
          </p>
        </div>
        <div className="flex items-center justify-between gap-8 md:justify-end">
          <Link
            href="/privacy"
            className="font-sans text-xs text-mute hover:text-accent"
          >
            Privacy Policy
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/offcourse.studio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-ink hover:text-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="mailto:hello@offcourse.studio"
              aria-label="Email"
              className="text-ink hover:text-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path
                  d="M4 7l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
