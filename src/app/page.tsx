import { SplitHero } from "@/components/SplitHero";
import { StudioIntro } from "@/components/StudioIntro";

export default function HomePage() {
  return (
    <>
      {/* Home hero is full-bleed under fixed header — override layout padding */}
      <div className="-mt-24 md:-mt-16">
        <SplitHero />
      </div>
      <StudioIntro />
    </>
  );
}
