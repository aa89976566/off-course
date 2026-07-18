"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const NAV = [
  { href: "/murals", label: "MURALS" },
  { href: "/digital", label: "DIGITAL" },
  { href: "/about", label: "ABOUT" },
  { href: "/contact", label: "CONTACT" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper">
      <div className="flex h-14 items-center justify-between border-b border-ink/10 px-4 md:h-16 md:px-6">
        <Logo className="text-lg md:text-xl" blink />

        <nav className="flex items-center gap-4 md:gap-7">
          <ul className="hidden items-center gap-5 md:flex lg:gap-7">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`font-display text-[11px] tracking-nav transition-none ${
                      active ? "text-accent" : "text-ink hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/offcourse.studio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-ink hover:text-accent"
            >
              <InstagramIcon />
            </a>
            <a
              href="mailto:hello@offcourse.studio"
              aria-label="Email"
              className="text-ink hover:text-accent"
            >
              <EmailIcon />
            </a>
          </div>
        </nav>
      </div>

      <nav className="flex h-10 items-center justify-between border-b border-ink/10 px-4 md:hidden">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-display text-[10px] tracking-nav ${
                active ? "text-accent" : "text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  );
}
