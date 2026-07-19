import Link from "next/link";

/** Ultra-minimal Walala footer */
export function Footer() {
  return (
    <footer className="group mt-auto flex h-[50px] min-h-[50px] w-full items-center justify-between bg-white px-2.5 text-black transition-colors duration-300 hover:bg-black hover:text-white">
      <Link
        href="/privacy"
        className="flex items-center gap-1 text-xs hover:bg-[var(--walala-red)] hover:text-white"
      >
        Privacy Policy
      </Link>
      <div className="flex items-center gap-4">
        <a
          href="https://instagram.com/offcourse.studio"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:text-[var(--walala-red)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>
        <a
          href="mailto:hello@offcourse.studio"
          aria-label="Email"
          className="hover:text-[var(--walala-red)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
