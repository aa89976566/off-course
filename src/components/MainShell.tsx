"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const flush =
    pathname === "/get-found" ||
    pathname === "/get-found/" ||
    pathname.startsWith("/get-found/");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (flush) {
      root.classList.add("zf-lock");
      body.classList.add("zf-lock");
    } else {
      root.classList.remove("zf-lock");
      body.classList.remove("zf-lock");
    }
    return () => {
      root.classList.remove("zf-lock");
      body.classList.remove("zf-lock");
    };
  }, [flush]);

  return (
    <main className={`flex-1 ${flush ? "pt-0" : "pt-[50px]"}`}>{children}</main>
  );
}
