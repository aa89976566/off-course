import type { Metadata } from "next";
import { RedirectClient } from "@/components/RedirectClient";

export const metadata: Metadata = {
  title: "Contact",
};

/** Legacy Start → Contact */
export default function StartRedirectPage() {
  return <RedirectClient to="/contact/" label="Contact" />;
}
