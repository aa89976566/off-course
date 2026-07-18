type ProjectTickerProps = {
  title: string;
  accent: string;
};

export function ProjectTicker({ title, accent }: ProjectTickerProps) {
  const repeat = Array.from({ length: 8 }, () => title).join(" — ");

  return (
    <div
      className="relative overflow-hidden whitespace-nowrap border-y border-ink/10 py-1.5"
      style={{ backgroundColor: accent }}
    >
      <div className="ticker-track flex w-max">
        <span className="pr-8 font-display text-[10px] tracking-nav text-paper md:text-xs">
          {repeat} —{" "}
        </span>
        <span className="pr-8 font-display text-[10px] tracking-nav text-paper md:text-xs">
          {repeat} —{" "}
        </span>
      </div>
    </div>
  );
}
