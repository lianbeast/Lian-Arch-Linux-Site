# Style Notes — Visual Foundations

## Color roles
| Role | Token | Use |
|---|---|---|
| Ground | `--bg-deep` / `--bg-void` | page background; void for deepest inset areas |
| Raised surface | `--bg-surface` / `--bg-elevated` | section alternation, nav, elevated cards |
| Card | `--bg-card` (60% alpha) | glass cards; hover swaps to `--bg-card-hover` (80%) |
| Brand | `--primary` #1793D1 | links, active states, primary button, wireframe mountain |
| Accent | `--accent` #22d3ee | used sparingly — hover borders, glow, key data |
| Heading fg | `--text-heading` | h1–h3 |
| Body fg | `--text-primary` | paragraphs |
| Muted | `--text-secondary` / `--text-muted` | captions, secondary copy |

Dark theme only. No light mode exists. Contrast: body text #e2e8f0 on #0a0a0f ≈ 15:1; muted #64748b reserved for non-essential.

## Type pairing
- **Space Grotesk** — display. Headlines, card titles, nav. Weight 600/700. Tight tracking on hero.
- **Inter** — body. 400/600. Comfortable 1.65 line-height.
- **JetBrains Mono** — code, terminal, package names, URLs. The credibility font.
- **Rajdhani** — eyebrows, section tags, timeline dates. SemiBold, uppercase, letterspaced.
- **Michroma** — stat numerals, future-flavored markers. Wide, techy, used at small sizes.

Five families, but never more than three visible in one viewport region. Hero: Michroma not present; eyebrows (Rajdhani) + display (Space Grotesk) + body (Inter).

## Spacing
Modular: 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6rem. Sections breathe at `--space-section` (clamp 6–10rem). Component interiors rarely exceed `--space-lg`.

## Backgrounds / atmosphere
- Flat `--bg-deep` base; sections alternate `--bg-surface`.
- Glow: radial `--primary-glow` at low alpha, one per viewport max.
- Grid texture + aurora sheen in navbar only.
- No gradient backgrounds on content sections. Ever.

## Card pattern
`.card`: `--bg-card`, 1px `--border`, radius `--radius-lg`, `::before` top-edge 1px primary line at low opacity that brightens on hover (opacity 0.6). Hover: translateY(-4px) + border-active + card-hover bg. Icon sits in `--accent-dim` rounded square.

## Buttons
- `.btn-primary`: solid `--primary`, white text, `::after` sheen sweep on hover (translateX(350%) skewX(-15deg)), active scale .98.
- `.btn-secondary`: transparent, 1px border, hover border-active + glow.
- Focus-visible: 2px outline accent offset 3px — always visible, never removed.

## Motion
- `--ease-out` cubic-bezier(0.16,1,0.3,1) default; `--ease-spring` for bouncy (pill, magnetic).
- Durations 150/250/400ms.
- Scroll reveals: opacity+translateY(24px), staggered children.
- Ambient: hero mountain slow rotation (0.06 rad/s), timeline dot pulse 2.4s, scroll progress bar.
- **`prefers-reduced-motion: reduce` kills every animation.** This is load-bearing, not optional — site's own hero renders static under reduced motion.

## Iconography
Inline SVGs only (`src/components/ui/Icons.jsx`), stroke-based, currentColor. No icon font, no emoji, no raster icons. Arch logo SVG is the only brand mark.

## Imagery
No photography. The only imagery is generated: Three.js wireframe mountain, ASCII art, terminal output. Screenshots would age; the wireframe aesthetic doesn't.

## Radii
6/10/16/24px. Cards 16, buttons 10, chips/inputs 6–10. Nothing pill-shaped except the nav active indicator.
