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
    <div className="bg-white">
      {/* Minimal label only — projects first, like Walala */}
      <div className="px-2.5 py-3">
        <h1 className="font-display text-sm font-bold uppercase tracking-wide text-black">
          {meta.title}
        </h1>
      </div>
      <ProjectGrid projects={projects} />
    </div>
  );
}
