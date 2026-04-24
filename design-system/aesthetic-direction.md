# Kopf Logistics Group — Aesthetic Direction

**Commitment:** Editorial / Industrial Heritage.
Not a SaaS landing page. Not a "dark-mode-with-orange-buttons" template. This is a **50-year family-owned trucking company** — the site should feel like a *field manual meets editorial magazine*, with the seriousness of infrastructure and the warmth of a family business.

## Tone pillars

1. **Heritage, not nostalgia.** 1966 → today. Use chapter-style numbering (§01, §02…) and large all-caps display type. Reference: Freight magazine spreads, AGCO / Kenworth print catalogs, *Monocle* editorial density.
2. **Industrial, not corporate.** Heavy horizontal rules, tire-tread motifs, route-line decoratives, tabular/monospaced figures for stats (574.349.5600, 70/30, 300+ years). Never rounded fluffy pill buttons; use rectangular hard-edged CTAs with subtle 2px borders.
3. **Human scale.** Kenny Kopf, Leroy Kopf, Vickie, Howard Smith, Jeanie Northcutt — these names matter. Lean into portraits, signatures (leroy_sig.png), scripture pulls (Luke 9:13), and location plaques.
4. **Functional elegance.** Serious about shipping. Dense enough to feel substantive, spacious enough to read.

## Type system

- **Display (headings):** `Anton` — extreme condensed industrial sans. Uppercase only. `font-feature-settings: "ss01"`.
- **Body:** `Inter` — tight tracking (-0.01em) on body, -0.02em on H3+.
- **Mono (data / stats / phone / zips):** `JetBrains Mono` — tabular nums for phone numbers, years, percentages.
- **Accent (pull-quotes, script):** `Playfair Display Italic` sparing — only for Luke 9:13 quote and Leroy's letter signature line.

Scale (rem): 0.75 · 0.875 · 1 · 1.125 · 1.25 · 1.5 · 2 · 2.75 · 4 · 6 · 8

## Color tokens

| Token | Hex | Role |
|---|---|---|
| `--kopf-ink` | `#0F0B08` | Primary background (deep warm charcoal) |
| `--kopf-bone` | `#F5EFE6` | Primary text on dark; alt background |
| `--kopf-orange` | `#EA580C` | Brand accent — CTAs, rules, underlines |
| `--kopf-orange-deep` | `#B8410B` | Hover / pressed |
| `--kopf-steel` | `#2B2420` | Card / section surfaces (warm steel) |
| `--kopf-rust` | `#C2410C` | Secondary accent on orange-saturated sections |
| `--kopf-concrete` | `#8A8075` | Muted text, rules, eyebrows |
| `--kopf-navy` | `#0A1628` | Rare — used for contrast in TMS / tech band only |

Contrast: bone-on-ink 15.8:1 (AAA). orange-on-ink 5.9:1 (AA normal, AAA large).

## Spatial composition rules

- **12-column grid, 8px base.** Most sections use columns 2–12 or 3–11 (asymmetric). Never dead-center container everything.
- **Brand bar:** every section begins with a tiny `§NN /` indicator + all-caps eyebrow in orange mono. This is the magazine-chapter feel.
- **Heavy horizontal rules** (1px bone with 4px orange accent block overlay on left) separate major sections.
- **Stat rows:** large mono display numbers (e.g. `50` `70/30` `300+`) with hairline labels below. Tabular, not pill-shaped.
- **Image treatment:** duotone black + orange overlay on full-bleed hero images; raw/untreated on content images. Trucks get full bleed.

## Motion

- **Hero entrance:** staggered reveal — headline slides up 24px + fades (260ms, staggered 40ms per word), eyebrow fades first (120ms delay).
- **Section reveals:** on scroll, sections' left-side `§NN` chapter mark types in character-by-character (char delay 30ms), headline underline extends left-to-right (320ms).
- **CTA hover:** 2px border shifts from bone → orange, 180ms. Background fill sweeps left-to-right on click.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables all slides; fade-only, 120ms.

## Anti-patterns (explicitly reject)

- ❌ Purple gradients, glassmorphism cards floating on nothing, rounded-3xl blobs
- ❌ Inter/Arial-only headings (too generic); emoji for service icons
- ❌ Hero with left-aligned text + right-aligned mockup (every SaaS site)
- ❌ Gradient text on "kopf logistics" — brand type must feel stamped, not dreamy
- ❌ Dark-mode-as-aesthetic without editorial purpose — darkness here is industrial (like a forge shop), not neon/tech
- ❌ "Trusted by 1,000+ companies" social-proof bar — this is a family business, we lead with the family, not logos

## Distinctive marks

- `§NN` chapter numbering in every section (01–11 on home)
- Orange horizontal accent block on section rules
- Tire-tread SVG divider between hero and first section
- Route-line decorative paths across About + Contact pages
- 3-terminal compass graphic (Elkhart IN · Athens GA · Seaford DE) as a signature mark across pages
- Leroy's actual signature image used as a signoff mark in footer

## Page-level accents

- **Home:** tire-tread divider after hero, route-path SVG connecting the 4 audience bands
- **About:** timeline ruler from 1966 to today with key milestones (cross-country driver → brokerage 2011)
- **Contact:** 3-terminal card grid with real maps for each, not just Elkhart
- **Carriers / Drivers:** §NN numbered requirement lists like an ops manual

## Fonts load plan

Google Fonts → `next/font/google` in layout.tsx with subset latin, display: swap, font-display: optional for the script accent font. Preload Anton + Inter; lazy-load JetBrains Mono and Playfair.
