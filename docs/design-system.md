# Off Course — Design System

Status: Locked for Iteration 2  
Applies to: Index · GET LOST · GET FOUND · Archive · Cases · About · Contact · Menu

---

## 1. Principles

Editorial before interface.  
Typography before decoration.  
Whitespace before components.  
One purpose per viewport.  
Journey language is secondary metadata — never a game HUD.

---

## 2. Typography roles (maximum five)

| Role | Class | Use |
|------|-------|-----|
| Display | `.ed-display` | World / page titles |
| Section title | `.ed-section` | Chapter headings |
| Project title | `.case-study__title` / spread titles | Case & teaser names |
| Body | `.ed-body` | Short narrative (max ~34rem) |
| Meta | `.ed-meta` | Codes, journey words, labels |

Fonts: Archivo Black (display) · Space Grotesk (body/meta).  
Do not invent intermediate heading styles.

---

## 3. Surfaces

| Token | Value | Use |
|-------|-------|-----|
| `--ed-paper` | warm off-white | Default page |
| `--ed-paper-2` | warmer grey-paper | Alternate chapter |
| `--ed-ink` | deep warm ink | Text |
| `--ed-mute` | warm mute | Meta / body soft |
| `--ed-line` | low-contrast rule | Separators |
| `--ed-deep` | intentional dark | Rare chapter / bleed captions |

Dark sections are chapter changes — never a default all-black card wall.

---

## 4. Spacing

- Section padding: `clamp(2.5rem, 8vh, 5–8rem)` vertical · `clamp(1.25rem, 5vw, 4rem)` horizontal  
- Body measure: ~34rem  
- Image margins: flush for bleeds; inset for details  
- Mobile: stack; never force desktop two-columns below ~768–900px  

---

## 5. Motion

| Moment | Behaviour |
|--------|-----------|
| Enter | Soft opacity / short settle — ease `[0.16,1,0.3,1]` or CSS ease |
| Radio | Noise → seek → lock (narrative) |
| Menu | Simple fade; no bounce |
| Route | Instant or calm; never elastic |
| Reduced motion | Skip radio search; show settled state |

Prohibited: bounce, elastic, perpetual parallax, floating cards on hover.

---

## 6. Navigation

**Permanent quiet header:** Brand · About · Archive · Contact · Grid  

**Not in permanent header:** GET LOST · GET FOUND  

**Menu overlay:** Editorial index; typography primary; worlds may appear as discovered destinations (04 / 05).  

**Case:** ← world · next on route  

**Home fallbacks:** text links under radio  

---

## 7. Journey metadata (optional, sparse)

signal · frequency · tuning · static · route · coordinates · distance · destination · arrival · mileage · off-map  

Rules: one journey word per focus; never fuel gauges / maps / HUD chrome.

| World | Lean toward |
|-------|-------------|
| GET LOST | distance · route · off-map · place |
| GET FOUND | signal · frequency · lock · access |

---

## 8. World differentiation

**GET LOST** — physical scale, walls, texture, paint, place, process, imperfect crops, material details.  
**GET FOUND** — clarity, structure, access, systems, screens (after story), content architecture.

Shared: Off Course type, paper surfaces, quiet nav, case footer pattern.

---

## 9. Explicit prohibitions

- Large floating pill navigation  
- All-black rounded card walls  
- Generic SaaS cards / glassmorphism / neon / decorative gradients  
- Duplicate navigation systems  
- Forced Journey copy in every section  
- Identical composition for every project  
- Device mockups as the opening of a physical or artist case  
- Invented awards, metrics, clients, or outcomes  

---

## 10. Content integrity

Missing narrative fields must remain `null` or labelled “content pending” in structured data.  
Never fill gaps with marketing claims.
