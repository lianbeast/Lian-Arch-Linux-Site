# Arch Linux Site Design System

Extracted from the live codebase — `src/index.css` is the single source of truth. Dark, terminal-native, Arch-blue. Not a generic dark theme: every surface treatment descends from the distro's own world (pacman output, wiki monospace, wireframe telemetry).

## Sources consulted
- `src/index.css` — full token block, component styles
- `index.html` — font preloads, OG meta
- `public/fonts/` — shipped woff2 files (copied to `assets/`)
- `src/components/` — Hero, Terminal, PackageSearch, Faq, Download, ArchMesh usage patterns
- `src/components/sections/*Hero.jsx` — all 6 hero variants (BootHero, TopoHero, SpecHero, RaceHero, TilingHero, GardenHero)
- Live site: https://lianbeast.github.io/Lian-Arch-Linux-Site/

## Index
- `tokens/colors_and_type.css` — raw + semantic vars, font faces. Import this first.
- `brand/voice-and-tone.md` — copy rules
- `brand/style-notes.md` — visual foundations: color roles, type pairing, spacing, motion, card patterns
- `assets/` — the 8 font files the site actually ships
- `ui-kit-site/` — interactive showcase + component recreations
  - `index.html` — open this: live tokens, buttons, cards, terminal, FAQ, install command, scroll progress
  - `kit.css` — production component rules, copied verbatim from `src/index.css`
  - `components/` — JSX recreations (Button, Card, Terminal, Faq, Icons), token-driven

## Quick use
```html
<link rel="stylesheet" href="design-systems/arch-linux-site/tokens/colors_and_type.css">
```
Then style against `var(--primary)`, `var(--font-mono)`, etc. — names match the production stylesheet exactly.
