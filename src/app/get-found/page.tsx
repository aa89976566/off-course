import type { Metadata } from "next";
import { FoundLanding } from "@/components/FoundLanding";

export const metadata: Metadata = {
  title: "GET FOUND",
  description:
    "Collapse the stack — websites, booking, and platforms that keep brands found.",
};

export default function GetFoundPage() {
  return <FoundLanding />;
}
