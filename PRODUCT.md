# Product

> Source of truth for design and engineering decisions on this site. Edit when the project's intent, audience, or principles shift — not for one-off changes.

## Register
**Brand.** Single-page scroll landing surface. No app shell, no forms, no dashboard chrome. The site IS the product — first impression, atmosphere, conviction.

## Users
**Curious developers** — competent, technically literate, allergic to marketing varnish. Browsing to evaluate whether Arch Linux is for them, or already converted and just looking. Sketch the user as someone who installs from the wiki and reads mailing lists for fun.

## Product Purpose
Convince a developer in 60 seconds that Arch Linux is the Linux for someone who already knows what Linux is. Sell sovereignty, not features — the rest of the site is a footnote to that thesis.

## Brand Personality
**Diabolic. Sovereign. Uncompromising.**
Not "edgy for fun." The voice of a system that knows what it is and refuses to soften itself to be liked. Trust the reader. Talk like a senior engineer in a channel they didn't invite you to. Decorate only with conviction, never with reassurance.

## Anti-references
- A WebGL/Three.js demo that exists to show off a shader and then has nothing to say. The page conveys atmosphere with a lightweight 2D canvas backdrop, not a GPU scene.
- SaaS landing templates (gradient hero, big stats row, "trusted by 10,000+ teams").
- Brochure sites (alternating image/text cards, eyebrow kickers on every section, friendly icons).
- Any surface a competent dev would describe as "trying too hard."

## Design Principles
Derived from the success metric: **the visitor walks away wowed and shares it.**

1. **The argument comes first.** Every section earns its place by carrying a claim. Visuals exist to make the claim land, not to fill the page.
2. **Motion is atmosphere, not ornament.** A 2D particle backdrop, scroll-progress bar, and reveal-on-scroll signal momentum. Scene-bound, never decorative. Everything that moves answers to a moment in the narrative.
3. **Authority through restraint.** No filter, no padding, no analogies aimed at non-technical readers. Talk to the curious dev on their level.
4. **Section choreography.** Each section is a beat (intro → about → history → features → terminal → architectures → download → usecases → community). Transitions are deliberate scroll beats, not crossfades.
5. **Type carries the voice.** Display type does the heavy lifting; body copy is small, dense, monospace where it counts. Headlines are sentences, not tags.

## Accessibility & Inclusion
**Out of scope for this demo.** Per project owner, a11y work (contrast checks beyond what's already there, full keyboard/ARIA coverage, AAA contrast, captions, etc.) is deferred. Skip-link, reduced-motion guard, focus-visible styles, and semantic landmarks already in `index.html` remain as a baseline; do not expand them.

## References
- **archlinux.org** — the current real site. Borrow its self-possession and dark, mechanical voice. The point isn't to clone it; it's to be in conversation with it.

## Stack & Constraints
- React 19 + Vite (Rolldown).
- Backdrop is a fixed 2D canvas (`BgCanvas`), 30 particles, DPR-capped, pauses on tab hidden and under reduced-motion.
- Sticky nav uses `IntersectionObserver` for active-section tracking; a top scroll-progress bar fills on scroll; sections reveal-in via `IntersectionObserver`.
- In-page interactive terminal (`Terminal.jsx`) parses input locally — no network, no state leaves the browser.
- Self-hosted fonts (Michroma / Rajdhani / JetBrains Mono) bundled in `public/fonts/`; `index.html` references them via `%BASE_URL%` so the GitHub Pages subpath deploy resolves.
- `single-font:35` (single display family) and `dark-glow:38` (deep-navy + neon accent) are committed brand tokens — flagged by design detectors as expected; suppressed at project config level, not defects.
