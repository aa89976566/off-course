import { DualPaths } from "@/components/DualPaths";
import { ManifestoHero } from "@/components/ManifestoHero";

export default function HomePage() {
  return (
    <>
      <div className="-mt-[6.5rem] md:-mt-16">
        <ManifestoHero />
      </div>
      <DualPaths />
    </>
  );
}
