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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper">
      <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
        <Logo className="text-lg md:text-xl" blink />

        <nav className="hidden md:block" aria-label="Primary">
          <ul className="flex items-center gap-5 lg:gap-7">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
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
      </div>

      <nav
        className="flex h-11 items-center justify-between gap-2 overflow-x-auto border-t border-ink/10 px-4 md:hidden"
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
