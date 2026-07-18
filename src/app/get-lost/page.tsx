import type { Metadata } from "next";
import { StreamPage } from "@/components/StreamPage";

export const metadata: Metadata = {
  title: "GET LOST",
  description: "We left the route on purpose.",
};

export default function GetLostPage() {
  return <StreamPage stream="lost" />;
}
