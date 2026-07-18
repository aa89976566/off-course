import type { Metadata } from "next";
import { StreamPage } from "@/components/StreamPage";

export const metadata: Metadata = {
  title: "GET FOUND",
  description: "Being found is only the beginning.",
};

export default function GetFoundPage() {
  return <StreamPage stream="found" />;
}
