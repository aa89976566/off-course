import { ManifestoStrip } from "@/components/ManifestoStrip";
import { SplitHero } from "@/components/SplitHero";

export default function HomePage() {
  return (
    <>
      {/* Full-bleed visual home — Walala pattern; no page padding */}
      <div className="-mt-[90px] md:-mt-[60px]">
        <SplitHero />
      </div>
      <ManifestoStrip />
    </>
  );
}
