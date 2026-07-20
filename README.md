# Muhtasim Khan — 3D Artist Portfolio

Live at **https://intoovert.me** (GitHub Pages via `INTOOVERT.github.io`).

A high-end, interactive personal portfolio for 3D art, digital art and interactive/visual work.
Built so the work can be shown **without exposing downloadable 3D model files** — pieces are
presented as 360° turntable videos, rendered clips, and on-demand Sketchfab embeds.

## Stack

- **Vite + React + TypeScript** — fast SPA, no SSR overhead
- **Three.js + @react-three/fiber + @react-three/drei** — the landing CRT monitor and the
  flow/shield shader background
- **GSAP + ScrollTrigger** — pinned horizontal portfolio scroller
- **Lenis** — smooth scrolling, synced to ScrollTrigger
- **Tailwind CSS** — styling, light/dark theme

## Sections

1. **Hero** — the actual retro computer model from edh.dev (Edward Hinrichsen's MIT-licensed
   `retro-computer-website`), with the screen contents replaced by the hand-drawn portrait
   rendered through a custom CRT shader (scanlines, barrel distortion, chromatic aberration,
   power-on wipe). Camera dolly-in intro, bloom + vignette post-processing, pointer parallax.
   Intro copy + scroll cue. See `public/models/CREDITS.md` for the MIT attribution.
2. **Work** — GSAP-pinned **horizontal scroll** of portfolio pieces. Videos autoplay (muted,
   looped) when their panel is active or on hover; Sketchfab pieces show a preview that jumps
   to the live section.
3. **Live 3D** — lazy-loaded Sketchfab embeds over a flowing shader background (inspired by
   `cortiz2894/flow-shield-effect`). Iframes only mount when scrolled near + clicked.
4. **Skills** — marquee + interactive level cards with a pointer spotlight.
5. **About** — bio + stats, portrait shown with a CRT-style filter.
6. **Reviews** — client testimonials highlighted from Fiverr, across different countries.
7. **Contact** — CTA + ArtStation / Instagram / LinkedIn / GitHub / Email links.

A juxtopposed-style custom cursor (dot + trailing ring) runs across the whole site on
fine-pointer devices, with light/dark mode and reduced-motion fallbacks.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Media

Source assets you provided were copied into `public/media/` with clean names:

| File in public/media | Original |
| --- | --- |
| `hyperion.mp4` | hyperion-premiere-0001-1.mp4 |
| `captain-cold.mp4` | captain-cold-premiere-0001.mp4 |
| `turntable-360.mp4` | 0001.mp4 |
| `alat.mp4` | alat0001-12.mp4 |
| `aold.mp4` | aold0001-12.mp4 |
| `portrait.png` | P01_pixel___2019345024.png |

Sketchfab embeds use the two model URLs from your `.txt` files (Caretaker Bot & Mini Boss Robot).

## Things to personalise (search for these)

- `src/data/socials.ts` — Instagram / LinkedIn / GitHub / email are **placeholders**
  (ArtStation is set to `artstation.com/intoovert`).
- `src/data/reviews.ts` — review text is representative; Fiverr blocks scraping, so paste your
  exact review quotes here when convenient.
- `src/data/projects.ts` — a couple of clip titles (`Turntable Study`, `ALAT`, `AOLD`) are
  placeholders — rename to the real project names.
- `src/components/about/About.tsx` — one bracketed personal line to fill in.

## Notes / decisions

- The **flower FBX pack** was intentionally **not used** — loading FBX + textures at runtime
  added weight and visual clutter without improving the design, which goes against the
  "performance first / don't make it heavier" guidance. It's easy to add later as a subtle
  background element if desired.
- Heavy work (Three.js, R3F, GSAP) is code-split into separate chunks; Sketchfab iframes and
  videos load on demand; everything respects `prefers-reduced-motion`.
