import Link from "next/link";

/** Ultra-minimal Walala-style footer */
export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="flex h-[50px] items-center justify-between px-4 md:px-6">
        <Link
          href="/privacy"
          className="font-sans text-xs text-black hover:text-accent"
        >
          Privacy Policy
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/offcourse.studio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-black hover:text-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>
          <a
            href="mailto:hello@offcourse.studio"
            aria-label="Email"
            className="text-black hover:text-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M4 7l8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
