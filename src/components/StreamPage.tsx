import { ProjectGrid } from "@/components/ProjectGrid";
import {
  STREAM_META,
  getProjectsByStream,
  type ProjectStream,
} from "@/lib/projects";

type StreamPageProps = {
  stream: ProjectStream;
};

export function StreamPage({ stream }: StreamPageProps) {
  const meta = STREAM_META[stream];
  const projects = getProjectsByStream(stream);

  return (
    <div>
      <header className="px-4 pb-12 pt-14 md:px-6 md:pb-16 md:pt-20">
        <h1 className="font-display text-4xl tracking-nav text-ink md:text-6xl">
          {meta.title}
        </h1>
        <p className="mt-6 max-w-md font-sans text-base leading-relaxed text-ink md:text-lg">
          {meta.line}
        </p>
      </header>
      <ProjectGrid projects={projects} stream={stream} />
    </div>
  );
}
