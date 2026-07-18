import Link from "next/link";

type LogoProps = {
  className?: string;
  href?: string;
  asLink?: boolean;
  blink?: boolean;
};

export function LogoMark({
  className = "",
  blink = false,
}: {
  className?: string;
  blink?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-baseline font-display uppercase tracking-logo text-ink ${className}`}
      aria-label="OFF_COURSE"
    >
      <span>OFF</span>
      <span
        className={`logo-underscore mx-[0.06em] ${blink ? "cursor-blink" : ""}`}
        aria-hidden="true"
      />
      <span>COURSE</span>
    </span>
  );
}

export function Logo({
  className = "",
  href = "/",
  asLink = true,
  blink = false,
}: LogoProps) {
  const mark = <LogoMark className={className} blink={blink} />;
  if (!asLink) return mark;
  return (
    <Link href={href} className="inline-flex items-center hover:opacity-80">
      {mark}
    </Link>
  );
}
