"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const flush =
    pathname === "/get-found" ||
    pathname === "/get-found/" ||
    pathname.startsWith("/get-found/");

  return (
    <main className={`flex-1 ${flush ? "pt-0" : "pt-[50px]"}`}>{children}</main>
  );
}
