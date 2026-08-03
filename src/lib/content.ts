/**
 * Editable site copy — keep narrative strings here, not scattered in JSX.
 * Mark temporary lines with // editable
 */

export const STUDIO = {
  name: "OFF_COURSE",
  email: "hello@offcourse.studio",
  instagram: "https://instagram.com/offcourse.studio",
  instagramHandle: "@offcourse.studio",
  // editable
  tagline: "Concrete & Code",
  // editable
  positioning:
    "An independent studio for physical expression and digital discovery.",
  // editable
  worldwide: "Worldwide",
} as const;

export const WORLDS = {
  lost: {
    label: "GET LOST",
    href: "/get-lost",
    // editable
    statement: "Ideas become physical.",
    // editable
    purpose: "Expression.",
    // editable
    blurb:
      "Murals, illustration, identity and installations — work that leaves the screen and meets a place.",
  },
  found: {
    label: "GET FOUND",
    href: "/get-found",
    // editable
    statement: "Ideas become accessible.",
    // editable
    purpose: "Discovery.",
    // editable
    blurb:
      "Websites, systems and tools where good work can be found, maintained and shared.",
  },
} as const;

export const NAV = {
  links: [
    { href: "/about", label: "About", index: "01" },
    { href: "/archive", label: "Archive", index: "02" },
    { href: "/contact", label: "Contact", index: "03" },
  ],
  menuExtras: [
    { href: "/get-lost", label: "GET LOST", meta: "Expression", index: "04" },
    { href: "/get-found", label: "GET FOUND", meta: "Discovery", index: "05" },
  ],
} as const;

export const HOME = {
  // editable — radio LCD script beats
  radio: {
    boot: "OFF_COURSE",
    tuning: "TUNING",
    static: "···· ····",
    seek: "SEEKING",
    lockLost: "GET LOST",
    lockFound: "GET FOUND",
    signalFound: "SIGNAL FOUND",
    settled: "TUNE IN",
  },
  // editable
  continueLabel: "Continue along the route",
} as const;
