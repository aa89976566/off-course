"use client";

import type { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  return <main className="site-main flex-1 pt-[var(--headerHeight)]">{children}</main>;
}
