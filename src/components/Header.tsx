"use client";

import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const NAV = [
  { href: "/get-lost", label: "GET LOST", kind: "drift" as const },
  { href: "/get-found", label: "GET FOUND", kind: "arrive" as const },
  { href: "/logbook", label: "LOGBOOK", kind: "plain" as const },
  { href: "/about", label: "ABOUT", kind: "plain" as const },
  { href: "/start", label: "START", kind: "plain" as const },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        isHome
          ? "bg-transparent mix-blend-difference"
          : "border-b border-black/10 bg-white"
      }`}
    >
      <div className="flex h-[50px] items-center justify-between px-4 md:h-[60px] md:px-6">
        <Logo
          className={`text-base md:text-lg ${isHome ? "!text-white" : ""}`}
          blink
        />

        <div className="flex items-center gap-5 md:gap-8">
          <nav className="hidden md:block" aria-label="Primary">
            <ul className="flex items-center gap-6 lg:gap-8">
              {NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      active={active}
                      className={`text-[11px] ${
                        isHome
                          ? active
                            ? "!text-[var(--accent)]"
                            : "!text-white hover:!text-[var(--accent)]"
                          : ""
                      }`}
                      drift={item.kind === "drift"}
                      arrive={item.kind === "arrive"}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={`flex items-center gap-3 ${
              isHome ? "text-white" : "text-black"
            }`}
          >
            <a
              href="https://instagram.com/offcourse.studio"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-accent"
            >
              <InstagramIcon />
            </a>
            <a
              href="mailto:hello@offcourse.studio"
              aria-label="Email"
              className="hover:text-accent"
            >
              <EmailIcon />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile nav — solid bar so links stay readable */}
      <nav
        className={`flex h-10 items-center justify-between gap-2 overflow-x-auto border-t px-4 md:hidden ${
          isHome
            ? "border-white/20 bg-black/40 text-white backdrop-blur-sm"
            : "border-black/10 bg-white"
        }`}
        aria-label="Primary mobile"
      >
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              active={active}
              className={`whitespace-nowrap text-[9px] ${
                isHome && !active ? "!text-white" : ""
              }`}
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  );
}
