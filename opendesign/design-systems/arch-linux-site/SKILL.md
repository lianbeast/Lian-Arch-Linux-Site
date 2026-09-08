---
name: arch-linux-site
description: Design system for the Arch Linux marketing site — dark terminal-native aesthetic, Arch blue #1793D1, Space Grotesk/Inter/JetBrains Mono/Rajdhani/Michroma, wireframe-3D imagery. Use when building mockups, prototypes, or redesigns for this project.
---

# Arch Linux Site — Design System Skill

## Apply this system when
Building any HTML artifact for the arch-linux-site project: mockups, prototypes, landing pages, decks about the site.

## How to load
```html
<link rel="stylesheet" href="design-systems/arch-linux-site/tokens/colors_and_type.css">
```
All token names match production `src/index.css` — `--primary`, `--font-mono`, `--space-section`, etc.

## Non-negotiables
1. **Dark only.** Ground is `--bg-deep`/`--bg-void`. Never light backgrounds.
2. **One accent gesture.** `--accent` #22d3ee is a seasoning, never a theme. `--primary` #1793D1 carries brand.
3. **No gradient backgrounds on content.** Glow allowed (radial, low alpha, one per viewport). Grid texture in nav only.
4. **Mono type is content, not decoration.** JetBrains Mono for anything the machine would actually say: commands, package names, versions, checksums.
5. **Reduced motion respected.** Every animation needs a `prefers-reduced-motion` kill.
6. **No photography, no emoji, no icon fonts.** Inline stroke SVG, wireframe 3D, ASCII, terminal output — generated imagery only.
7. **Voice:** terminal-native, second person, no sales. "You build it. You own it."

## Signature
The Arch "A" read as terrain — wireframe mountain, low-poly, primary-blue lines with a faint cyan ridge. Also: pacman-style ASCII/terminal output treated as design material.

## Type roles
- Display: **Space Grotesk** 600/700
- Body: **Inter** 400/600
- Machine: **JetBrains Mono** (variable)
- Eyebrow/labels: **Rajdhani** 600 uppercase
- Stat numerals: **Michroma** small sizes

Max three families visible per viewport region.

## Component DNA
- Cards: 60% alpha bg, 1px hairline border, 16px radius, top-edge ::before primary line brightening on hover, hover lift -4px.
- Primary button: solid primary, white text, sheen sweep on hover.
- Secondary button: transparent, hairline, hover border-active.
- Focus-visible always: 2px accent outline, 3px offset.
