# Product

> Source of truth for design and engineering decisions on this site. Edit when the project's intent, audience, or principles shift — not for one-off changes.

## Register
**Brand.** Premise-driven, scroll-narrative marketing surface. No app shell, no forms, no dashboard chrome. The site IS the product — first impression, atmosphere, conviction.

## Users
**Curious developers** — competent, technically literate, allergic to marketing varnish. Browsing to evaluate whether Arch Linux is for them, or already converted and just looking. Sketch the user as someone who installs from the wiki and reads mailing lists for fun.

## Product Purpose
Convince a developer in 60 seconds that Arch Linux is the Linux for someone who already knows what Linux is. Sell sovereignty, not features — the rest of the site is a footnote to that thesis.

## Brand Personality
**Diabolic. Sovereign. Uncompromising.**
Not "edgy for fun." The voice of a system that knows what it is and refuses to soften itself to be liked. Trust the reader. Talk like a senior engineer in a channel they didn't invite you to. Decorate only with conviction, never with reassurance.

## Anti-references
- **An "awkward WebGL demo."** A site that exists to show off a shader or a Three.js scene, then has nothing to say. 3D here is atmosphere around an argument, not the argument.
- SaaS landing templates (gradient hero, big stats row, "trusted by 10,000+ teams").
- Brochure sites (alternating image/text cards, eyebrow kickers on every section, friendly icons).
- Any surface a competent dev would describe as "trying too hard."

## Design Principles
Derived from the success metric: **the visitor walks away wowed and shares it.**

1. **The argument comes first.** Every section earns its place by carrying a claim. Visuals exist to make the claim land, not to fill the page.
2. **Light, motion, and sound are atmosphere, not ornament.** Scene-bound, never decorative. Everything that moves or glows answers to a moment in the narrative.
3. **Authority through restraint.** No filter, no padding, no analogies aimed at non-technical readers. Talk to the curious dev on their level.
4. **Section choreography.** Each section is a beat with its own mood (intro → features → install → pacman → community). Transitions are deliberate scene changes, not crossfades.
5. **Type carries the voice.** Display type does the heavy lifting; body copy is small, dense, monospace where it counts. Headlines are sentences, not tags.

## Accessibility & Inclusion
**Out of scope for this demo.** Per project owner, a11y work (contrast checks beyond what's already there, full keyboard/ARIA coverage, AAA contrast, captions, etc.) is deferred. Skip-link, reduced-motion guard, and semantic landmarks already in `index.html` remain as a baseline; do not expand them.

## References
- **archlinux.org** — the current real site. Borrow its self-possession and dark, mechanical voice. The point isn't to clone it; it's to be in conversation with it.

## Stack & Constraints (carry-over)
- React 19 + Vite; Three.js via `@react-three/fiber`.
- 3D Canvas is fixed background, UI overlays it.
- Audio + cursor follower + boot sequence are part of the brand, not optional polish.
- `single-font:35` (single display family) and `dark-glow:38` (deep-navy + neon accent) are committed brand tokens — flagged by detectors as expected; suppressed at project config level.
