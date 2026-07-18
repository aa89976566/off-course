# OFF_COURSE

London studio website — murals + digital systems.

**Tagline:** Making things on purpose, off the beaten path.

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

Replace placeholder imagery in `/public/murals` and `/public/digital` with real photography/screenshots, then update metadata in `/data/projects.json`.

Before launch, swap:

- Domain / email (`hello@offcourse.studio`)
- Instagram handle (`@offcourse.studio`)
- 3–6 real mural projects
- 3–6 real digital case studies

## Design rules

- UI chrome is black & white only
- All saturated color comes from real project imagery
- Accent (`--accent` in `globals.css`) is for hover/active states only
