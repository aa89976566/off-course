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
      <header className="px-5 pb-10 pt-12 md:px-8 md:pb-12 md:pt-16">
        <h1 className="font-display text-4xl tracking-[0.08em] text-black md:text-6xl">
          {meta.title}
        </h1>
        <p className="mt-4 max-w-lg font-sans text-base text-black md:text-[16px]">
          {meta.line}
        </p>
      </header>
      <ProjectGrid projects={projects} stream={stream} />
    </div>
  );
}
