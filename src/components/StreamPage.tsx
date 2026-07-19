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
      <header className="px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-20">
        <p className="mb-4 font-display text-[10px] tracking-nav text-mute">
          OFF COURSE
        </p>
        <h1 className="font-display text-4xl tracking-nav text-ink md:text-6xl">
          {meta.title}
        </h1>
        <p className="mt-6 max-w-md font-sans text-lg leading-snug text-ink md:text-xl">
          {meta.line}
        </p>
        <p className="mt-3 max-w-md font-sans text-sm text-mute md:text-base">
          {meta.sub}
        </p>
      </header>
      <ProjectGrid projects={projects} stream={stream} />
    </div>
  );
}
