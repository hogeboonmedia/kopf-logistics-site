# Kopf Logistics Group — Divi WordPress Homepage

A one-to-one port of the Next.js homepage into Divi shortcodes, ready to import.

## Files in this folder

| File | What it is | Where it goes |
|---|---|---|
| `kopf-homepage-divi-layout.json` | The full homepage as a Divi portable layout | Divi Builder → Portability → Import |
| `kopf-custom-css.css` | Custom styling (chapter marks, hard-edge buttons, testimonials marquee, font loading) | Divi → Theme Options → General → Custom CSS |
| `kopf-homepage-shortcodes.txt` | Raw shortcode source (for reference / diffing) | *Not imported; keep as backup* |

---

## Install in 5 steps

### 1. Prerequisites

- WordPress 6.x with **Divi Theme or Divi Builder plugin** installed and activated (any Divi 4.x version should work)
- Admin access
- That's it. The layout uses image URLs directly from `kopflogisticsgroup.com` and `pexels.com`, so no media-library uploads are required to render it. You can swap those to uploaded URLs later if you want everything self-hosted.

### 2. Paste the Custom CSS

1. WP Admin → **Divi → Theme Options → General** tab
2. Scroll to **Custom CSS** at the bottom
3. Paste the entire contents of `kopf-custom-css.css`
4. Click **Save Changes**

The CSS file includes a `@import` for the four fonts — Anton, Inter, JetBrains Mono, and Playfair Display — so they'll load automatically without needing to enable them elsewhere.

### 3. Create the homepage

1. WP Admin → **Pages → Add New**
2. Title: `Home` (or whatever)
3. Click **Use Divi Builder**
4. In the builder, click the **Portability icon** in the settings bar at the bottom (double-arrow icon — looks like ⇅ or ⇵, depending on Divi version)
5. In the modal, go to the **Import** tab
6. Click **Choose File** → select `kopf-homepage-divi-layout.json`
7. Check **"Download Backup Before Importing"** if you want a safety backup (recommended)
8. Click **Import Divi Builder Layout**

After a few seconds the whole homepage will populate with 13 sections, 17 rows, and 79 modules.

### 4. Set the page as your site's homepage

1. Publish the page you just built
2. WP Admin → **Settings → Reading**
3. **Your homepage displays** → A static page
4. **Homepage** → the page you just created
5. **Save Changes**

### 5. Verify & tweak

Visit your site. You should see:
- Dark warm-charcoal background, Anton display headings, orange `#EA580C` accents
- Chapter marks `§ 00 / § 01 / § 02…` at the start of each section
- Two auto-scrolling testimonials rows (scroll down to see the Google Reviews section)
- Both YouTube videos (KuJq8F-uSkM and 6HtH4FymnVM) embedded
- Luke 9:13 scripture pull-quote in the Higher Purpose section

If testimonials aren't scrolling: check the browser console and confirm the `@keyframes kopf-marquee-scroll` rule is present (it's in `kopf-custom-css.css`).

---

## What's in the layout

| § | Section | Divi modules used |
|---|---|---|
| 00 | **Hero** — Kopf Logistics Group / 50 Years of Excellence, 4 feature pills, 2 CTAs, truck render | Text (headline), Code (pills grid), Button ×2, Image (framed) |
| — | Tire-tread divider | Code module |
| 01 | **Why Kopf?** + YouTube video (Accelerate Your Success) | Text, Video |
| — | **Testimonials** — 8 real Google reviews in two scrolling rows + Google-branded summary bar | Text, Code (full marquee HTML) |
| 02 | **Operational Excellence** + team meeting photo + "300+ years" stat card | Text, Image, Code |
| 03 | **The Kopf Advantage** — 7 numbered benefit cards + McLeod TMS callout | Text, 8× Code (cards) |
| 04 | **Our TMS Capabilities** — 11 module list + dispatch office photo | Text, Image, Code (11-item grid) |
| 05 | **Equipment We Operate** — 10 service icon cards | Text, Code (10-card grid, black-PNG → white via filter) |
| 06 | **Our Business Solutions** + warehouse photo | Image, Text |
| 07 | **Shippers band** — loading dock photo + CTA | Image, Text, Button |
| 08 | **Independent Freight Agents band** — 70/30 commission split big-type treatment | Text, Button, Code |
| 09 | **Carriers band** — driver in cab + "Up to $2,500 Advance" treatment | Code, Text, Button |
| 10 | **Technology Made to Measure** — centered, tech background | Text, Button |
| 11 | **Get Started Today!** + 2nd YouTube video (Now Recruiting) | Video, Text, Button ×2 |
| 12 | **Our Higher Purpose** — Luke 9:13 scripture pullquote, faith narrative | Text, Divider, Code, Button |

---

## Fonts used

All loaded automatically via the `@import` at the top of `kopf-custom-css.css`:

- **Anton** (display / headings) — uppercase condensed
- **Inter** (body text)
- **JetBrains Mono** (eyebrows, CTAs, tabular numbers)
- **Playfair Display italic** (scripture pull-quote)

If you want these to appear in the Divi font picker (module-level overrides), you'll need a Google Fonts plugin or to add them to Divi's Advanced → Fonts setting. The custom CSS handles 95% of cases without that.

---

## Images used

Everything references external URLs — no uploads required for the layout to work. Image sources:

**From original Kopf site (`kopflogisticsgroup.com`):**
- `truck_full_5-1000x670-1.png` — hero truck render
- `01_TRUCKLOAD.png` through `10_OWNER-OPERATORS.png` — 10 service icons
- `operate_bg_orange.jpg` — Equipment section background
- `home_bg_tech.jpg` — Technology section background
- `home_bg_quote2.jpg` — Higher Purpose section background

**From Pexels (CC-licensed):**
- `photos/1606957` — sunset truck (hero background)
- `photos/7964413` — team meeting (Operational Excellence)
- `photos/4267526` — dispatch office (TMS Capabilities)
- `photos/4487363` — warehouse ops (Business Solutions)
- `photos/5876475` — loading dock (Shippers band)
- `photos/6720527` — driver in cab (Carriers band)

**If you want self-hosted images** instead of external URLs:
1. Upload all of the above to WP Media Library
2. In Divi Builder, open each Image / section background and pick the local upload

---

## Customizing after import

- **Colors**: The custom CSS uses CSS variables at the top (`--kopf-orange`, `--kopf-bone`, etc.). Change once, everywhere updates.
- **Phone / email**: The hero and §11 sections have hard-coded `574.349.5600` and `recruiter@kopflogisticsgroup.com` in text modules. Edit in the Visual Builder.
- **Add / remove testimonials**: Open the testimonials section in Divi, click the Code module, edit the HTML. Each `<article class="kopf-review">` is one review card. Keep counts even across both `.kopf-reviews-track` rows for a balanced marquee.
- **Light mode**: The Divi version is dark-mode-only. Adding a runtime light/dark toggle in Divi requires a child theme with a bit of JS — outside the scope of this layout but doable later if you need it.
- **Google Fonts offline**: If your site is behind a privacy-first setup (no Google Fonts CDN), self-host with a plugin like OMGF.

---

## Troubleshooting

**"Import failed, invalid JSON"**
Redownload the file; it was validated before shipping. If still failing, open `kopf-homepage-shortcodes.txt` and paste the content into a new Divi page manually via Code view.

**Testimonials not scrolling**
The marquee uses a CSS `@keyframes` rule named `kopf-marquee-scroll`. Confirm `kopf-custom-css.css` is saved to Divi → Theme Options → Custom CSS. Some caching plugins strip animations; clear your cache.

**Service icons invisible**
The 10 truck-service icons are black-on-transparent PNGs; we invert them to white via `.kopf-service-icon img { filter: brightness(0) invert(1); }`. If they're black on your background, verify the custom CSS is loading.

**Fonts look wrong**
Anton isn't installed in Divi by default. The `@import` at the top of the CSS handles this — but your browser might cache the old stylesheet. Hard refresh (Cmd+Shift+R / Ctrl+F5).

**Buttons still have rounded corners**
Divi's defaults override module-level settings. Make sure the buttons have the `kopf-btn` class in their Advanced → CSS Class field. The custom CSS forces `border-radius: 0` only when that class is present.

---

## Next steps (inner pages)

This layout only covers the homepage. If you want Divi versions of the other pages (Shippers, Carriers, Drivers, Agent, About, Contact), each would need its own JSON. Each follows the same §NN chapter-mark pattern — so after you've imported and tweaked the homepage, inner pages would take 1–2 hours each to port using the established style system.
