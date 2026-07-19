type ProjectTickerProps = {
  title: string;
  accent: string;
};

/** Walala-style colored ticker bar under each project tile */
export function ProjectTicker({ title, accent }: ProjectTickerProps) {
  const unit = `${title} — `;
  const strip = unit.repeat(10);

  return (
    <div
      className="relative w-full min-w-0 overflow-hidden py-2"
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      <div className="ticker-track flex w-max will-change-transform">
        <span className="shrink-0 pr-6 font-display text-[11px] font-bold tracking-[0.08em] text-white md:text-xs">
          {strip}
        </span>
        <span className="shrink-0 pr-6 font-display text-[11px] font-bold tracking-[0.08em] text-white md:text-xs">
          {strip}
        </span>
      </div>
    </div>
  );
}
