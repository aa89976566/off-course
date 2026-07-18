import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-paper">
      <div className="flex items-center justify-between px-4 py-5 md:px-6">
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
    </footer>
  );
}
