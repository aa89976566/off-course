# OFF_COURSE

**GO OFF COURSE.**
Sometimes getting lost is how brands get found.

## Core idea

GET LOST / GET FOUND is not just navigation — it is the studio slogan.

| Path | Meaning |
|------|---------|
| `/get-lost` | Physical interventions |
| `/get-found` | Systems after discovery |
| `/logbook` | Chronological record of detours |
| `/about` | Studio |
| `/start` | Enquiry |

## Stack

Next.js 14 · TypeScript · Tailwind · Framer Motion · Archivo Black / Space Grotesk

shadcn/ui is initialized with external registries for [Aceternity UI](https://ui.aceternity.com) and [React Bits](https://www.reactbits.dev).

```bash
npm install
npm run dev
```

### Adding UI components

```bash
# Aceternity UI
npx shadcn@latest add @aceternity/3d-marquee

# React Bits (TypeScript + Tailwind variants use *-TS-TW)
npx shadcn@latest add @react-bits/BlurText-TS-TW

# Browse / search
npx shadcn@latest list @aceternity
npx shadcn@latest search @react-bits -q "text"
```

Registries live in `components.json` under `@aceternity` and `@react-bits`.
