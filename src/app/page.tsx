import { HomeCanvas } from "@/components/HomeCanvas";
import { HomeEditorial } from "@/components/HomeEditorial";

export default function HomePage() {
  return (
    <div className="home-page -mt-[var(--headerHeight)]">
      <HomeCanvas />
      <HomeEditorial />
    </div>
  );
}
