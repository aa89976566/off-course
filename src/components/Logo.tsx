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
      className={`font-display uppercase tracking-logo text-ink ${className}`}
      aria-label="OFF_COURSE"
    >
      OFF
      <span
        className={`logo-underscore ${blink ? "cursor-blink" : ""}`}
        aria-hidden="true"
      />
      COURSE
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
