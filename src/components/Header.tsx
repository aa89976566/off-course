"use client";

import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const NAV = [
  { href: "/", label: "HOME", kind: "plain" as const },
  { href: "/get-lost", label: "GET LOST", kind: "drift" as const },
  { href: "/get-found", label: "GET FOUND", kind: "arrive" as const },
  { href: "/about", label: "ABOUT", kind: "plain" as const },
  { href: "/contact", label: "CONTACT", kind: "plain" as const },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper">
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <Logo className="text-lg md:text-xl" blink />

        <div className="flex items-center gap-4 md:gap-7">
          <nav className="hidden md:block" aria-label="Primary">
            <ul className="flex items-center gap-5 lg:gap-7">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      active={active}
                      className="text-[11px]"
                      drift={item.kind === "drift"}
                      arrive={item.kind === "arrive"}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>

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
        </div>
      </div>

      <nav
        className="flex h-11 items-center justify-between gap-2 overflow-x-auto border-t border-ink/10 px-4 md:hidden"
        aria-label="Primary mobile"
      >
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={active}
              className="whitespace-nowrap text-[9px]"
              drift={item.kind === "drift"}
              arrive={item.kind === "arrive"}
            />
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
