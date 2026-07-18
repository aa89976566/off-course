type ProjectTickerProps = {
  title: string;
  accent: string;
};

export function ProjectTicker({ title, accent }: ProjectTickerProps) {
  const unit = `${title} — `;
  const strip = unit.repeat(6);

  return (
    <div
      className="relative w-full min-w-0 overflow-hidden border-b border-ink/10 py-1.5"
      style={{ backgroundColor: accent }}
      aria-hidden="true"
    >
      <div className="ticker-track flex w-max will-change-transform">
        <span className="shrink-0 pr-4 font-display text-[10px] tracking-nav text-paper md:text-xs">
          {strip}
        </span>
        <span className="shrink-0 pr-4 font-display text-[10px] tracking-nav text-paper md:text-xs">
          {strip}
        </span>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
