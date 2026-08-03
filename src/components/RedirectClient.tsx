"use client";

import { useEffect } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Client redirect for static GitHub Pages exports. */
export function RedirectClient({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  useEffect(() => {
    const target = `${BASE}${to.startsWith("/") ? to : `/${to}`}`;
    window.location.replace(target);
  }, [to]);

  return (
    <main className="flex min-h-[50svh] items-center justify-center px-6">
      <p className="text-sm text-[var(--ed-mute)]">
        Moving to{" "}
        <Link href={to} className="underline underline-offset-4">
          {label}
        </Link>
        …
      </p>
    </main>
  );
}
