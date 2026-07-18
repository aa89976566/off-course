# OFF_COURSE

London creative agency — visual + systems, organised as Work / Playground.

**Tagline:** Making things on purpose, off the beaten path.

## Information architecture

| Stream | Meaning |
|--------|---------|
| **Work** | Commissioned projects |
| **Playground** | Self-initiated experiments |

| Discipline | Meaning |
|------------|---------|
| **Visual** | Murals, storefronts, installations |
| **Systems** | Websites, booking tools, internal products |

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Framer Motion (split hero)
- Archivo Black / Space Grotesk via `next/font/google`
- Project data in `/data/projects.json`

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

Replace placeholder imagery in `/public/murals` and `/public/digital` with real photography/screenshots, then update metadata in `/data/projects.json` (`stream` + `discipline` per project).

Before launch, swap:

- Domain / email (`hello@offcourse.studio`)
- Instagram handle (`@offcourse.studio`)
- Real Work + Playground projects across Visual and Systems

## Design rules

- UI chrome is black & white only
- All saturated color comes from real project imagery
- Accent (`--accent` in `globals.css`) is for hover/active states only
