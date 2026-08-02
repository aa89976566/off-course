# Off Course — Information Architecture (Phase 2)

Status: Approved with revisions (no standalone Work; Bridge as metadata)

---

## 1. Site map

```
/
├── get-lost/
│   └── [slug]/          # Lost case study
├── get-found/
│   └── [slug]/          # Found case study
├── about/
└── contact/
```

Primary navigation (only):

| Label       | URL           | Role                                      |
|-------------|---------------|-------------------------------------------|
| Index       | `/`           | Declaration + dual-world entry + featured |
| GET LOST    | `/get-lost`   | Expression world                          |
| GET FOUND   | `/get-found`  | Discovery world                           |
| About       | `/about`      | Studio stance & method                    |
| Contact     | `/contact`    | Single clear invitation                   |

**Not in nav / not a page:** Work, Portfolio, Bridge (as category).

---

## 2. Strategic rules

1. **Projects live inside worlds**  
   Murals, identity, illustration live under GET LOST.  
   Websites, CMS, systems live under GET FOUND.  
   No duplicated portfolio index.

2. **One primary world per project**  
   The case URL and section always belong to Lost *or* Found.

3. **Bridge = attribute**  
   Shown in project metadata / badge when meaningful.  
   Never a third navigation lane.

4. **Independence is valid**  
   A mural does not need a website.  
   A CMS does not need a mural.  
   Bridge only when value is real.

5. **Homepage features, worlds contain**  
   Index shows 2–3 featured projects per world.  
   Full archives and cases live on world pages.

---

## 3. Page responsibilities

### 3.1 Index `/`

**One job:** Establish Off Course, open both worlds, invite curiosity.

**Emotion to remember:** Calm confidence — concrete and code, worldwide.

| Module | Content | Notes |
|--------|---------|--------|
| Entrance | `_off__course` · Concrete & Code · Worldwide | Oversized type, minimal chrome |
| Positioning | Short studio line | Independent culture, not SaaS |
| World door — Lost | Manifesto line + enter GET LOST | Expression / physical |
| World door — Found | Manifesto line + enter GET FOUND | Discovery / accessible |
| Featured Lost | 2–3 projects | Links into `/get-lost/[slug]` |
| Featured Found | 2–3 projects | Links into `/get-found/[slug]` |
| Close | Soft invite to Contact / About | One CTA weight only |

**Must not:** Feature grids, pricing, testimonials wall, service mega-menu.

---

### 3.2 GET LOST `/get-lost`

**One job:** Make the artistic side felt as a world of expression.

**Emotion:** Curiosity, material presence, wandering.

| Module | Content |
|--------|---------|
| Manifesto | Ideas become physical. Purpose = expression. |
| Services (index, not cards) | Murals · Illustration · Brand Identity · Physical Installations · Creative Direction · Experimental Visual Work |
| Featured / archive projects | Full Lost cases (primary world = Lost) |
| Process | How expression moves from idea → wall / object / identity |
| Related / continue | Link to GET FOUND only as invitation, not requirement |

**Bridge handling:** If a Lost project later became Found, badge: `Bridge to Found` + optional link to the Found case. Story stays on Lost URL.

---

### 3.3 GET FOUND `/get-found`

**One job:** Make the digital side felt as a world of discovery.

**Emotion:** Clarity, access, good work can be found.

| Module | Content |
|--------|---------|
| Manifesto | Ideas become accessible. Purpose = discovery. |
| Services (index) | Websites · Systems · Applications · CMS · Automation · AI · Internal Tools |
| Featured / archive projects | Full Found cases (primary world = Found) |
| Process | How discovery systems are shaped |
| Related / continue | Link to GET LOST as counterpart world |

**Bridge handling:** If originated in Lost, badge: `Originated from Lost` / `Lost → Found`. Primary world remains Found.

---

### 3.4 Project case `/get-lost/[slug]` or `/get-found/[slug]`

**One job:** Tell one project’s story inside its primary world.

**Emotion:** Specific to the project (answered before build).

#### Project header (metadata, not nav)

| Field | Example |
|-------|---------|
| Code | `FOUND 001` / `LOST 003` |
| Title | Artist Website |
| Type | Artist Portfolio |
| World | GET FOUND |
| Bridge | optional — `Bridge Project` · `Lost → Found` |
| Location | London |
| Year | 2026 |
| Built with | Next.js · Notion · GSAP (Found) / materials for Lost |

#### Case body modules

| Module | Required | Content |
|--------|----------|---------|
| Story | Yes | Why it exists; client/context |
| Approach | Yes | How Off Course responded |
| Outcome | Yes | What changed / what to remember |
| Visual proof | Yes | Distinct surfaces, not duplicate shots |
| Bridge | Optional | Only if attribute is true — explain *why* the bridge created value |
| Next project | Yes | Adjacent case in the **same** primary world |

**Must not:** Third “Bridge” section in global IA; forcing Lost+Found packaging.

---

### 3.5 About `/about`

**One job:** State who we are and how we think.

| Module | Content |
|--------|---------|
| Stance | Independent creative studio · magazine-like |
| Two worlds | Lost / Found definition + independence rule |
| Method | Editorial before interface; story before technology |
| People / places | Human, international, calm — sparse |
| Link out | Into both worlds + Contact |

---

### 3.6 Contact `/contact`

**One job:** One clear path to start.

| Module | Content |
|--------|---------|
| Invitation | Short, human |
| Channel | Email / form — one primary |
| Context cues | Optional: Lost enquiry vs Found enquiry as soft preference, not required funnel |
| Locations | If relevant — editorial, not map widget spam |

---

## 4. Content modules (reusable)

### World page stack

```
Manifesto
→ Services (taxonomy list)
→ Featured Projects
→ Process
→ Related (other world invite)
```

### Case stack

```
Header (code, title, world, bridge?, meta)
→ Story
→ Approach
→ Outcome
→ Visual proof
→ Bridge note? (optional)
→ Next project (same world)
```

### Featured teaser (homepage / world)

```
Code (FOUND 001)
→ Title
→ One-line proposition
→ Primary world
→ Bridge badge? (optional)
→ Image world (one dominant frame)
```

---

## 5. URL structure

| Resource | Pattern | Example |
|----------|---------|---------|
| Home | `/` | `/` |
| Lost world | `/get-lost` | `/get-lost` |
| Lost case | `/get-lost/[slug]` | `/get-lost/shoreditch-facade` |
| Found world | `/get-found` | `/get-found` |
| Found case | `/get-found/[slug]` | `/get-found/jieshin-tseng` |
| About | `/about` | `/about` |
| Contact | `/contact` | `/contact` |

### Slug rules

- Lowercase kebab-case
- Stable; do not encode world in slug (`jieshin-tseng`, not `found-jieshin`)
- World is determined by path prefix

### Project codes

- Lost: `LOST 001`, `LOST 002`, …
- Found: `FOUND 001`, `FOUND 002`, …
- Codes are editorial labels in UI; routing uses slug

### Bridge (data model, not route)

```ts
primaryWorld: "lost" | "found"
bridge?: {
  enabled: true
  direction: "lost-to-found" | "found-to-lost" | "bidirectional"
  note?: string          // why the bridge mattered
  relatedSlug?: string   // optional counterpart case
}
```

No `/bridge` routes. No `/work` routes.

---

## 6. Homepage featured policy

- Up to **3** Lost + **3** Found teasers
- Selection is editorial (not “latest by default” unless chosen)
- Each teaser links to case inside its world
- Bridge badge may appear on teaser; never creates a Bridge lane

---

## 7. What we explicitly reject in IA

- Standalone `/work` or `/projects` portfolio index that duplicates worlds  
- Bridge as third nav item or third archive  
- Forcing every Lost project to become Found  
- SaaS IA: Features → Pricing → FAQ  
- Service pages that replace world pages  

---

## 8. Phase gate

Phase 2 complete when this document is accepted.

Next: **Phase 3 — Design system** (type, colour, space, motion tokens for Off Course — original, not a fromanother replica).
