"use client";

import type { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="site-main flex-1 pt-[var(--headerHeight)]"
      tabIndex={-1}
    >
      {children}
    </main>
  );
}
