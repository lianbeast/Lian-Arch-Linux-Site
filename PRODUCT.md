# Product

> Source of truth for design and engineering decisions on this site. Edit when the
> project's intent, audience, or principles shift — not for one-off changes.
>
> **This file must match the shipped code.** It previously described a 2D canvas
> backdrop, a three-family type stack and a nine-section page, none of which
> existed. When something here and something in `src/` disagree, one of them is a
> bug — fix it in the same commit.

## Register
**Brand.** Single-page scroll landing surface. No app shell, no forms, no
dashboard chrome. The site IS the product — first impression, atmosphere, conviction.

## Users
**Curious developers** — competent, technically literate, allergic to marketing
varnish. Browsing to evaluate whether Arch Linux is for them, or already converted
and just looking. Someone who installs from the wiki and reads mailing lists for fun.

## Product Purpose
Convince a developer in 60 seconds that Arch Linux is the Linux for someone who
already knows what Linux is. Sell sovereignty, not features — the rest of the page
is a footnote to that thesis.

## Brand Personality
**Diabolic. Sovereign. Uncompromising.**

Not "edgy for fun." The voice of a system that knows what it is and refuses to
soften itself to be liked. Trust the reader. Talk like a senior engineer in a
channel they did not invite you to. Decorate only with conviction, never with
reassurance.

## Design Thesis
**A man page you can scroll.**

The site is a technical document, not a landing page. That single decision
resolves most of the layout questions below: documents use rules instead of
cards, running headers instead of eyebrows, and type instead of ornament.

## Anti-references
These are things this site must not become. Every one of them was previously
violated somewhere in the build; they are listed here so it does not happen again.

- **Eyebrow kickers on every section.** A decorative uppercase label above every
  headline, carrying no information. Section labels must carry information or go.
- **A card grid as the default layout.** Eight differently-named classes that
  render the same rounded glass rectangle is one component and eleven missed
  layout decisions.
- **Glow and gradient as the default.** Emphasis applied to everything is
  emphasis applied to nothing. There is no glow on this site.
- **Cyan-on-black neon.** The single most recognizable AI-generated palette.
- **Glassmorphism over an opaque ground.** Blurring a solid background produces a
  more expensive solid background.
- **Motion as ornament.** Marquee loops, floating icons, drifting gradients and
  sheen sweeps that answer to no moment in the narrative.
- **A WebGL/Three.js demo that exists to show off a shader.** There is no GPU
  work on this page — the backdrop is Canvas 2D with a hand-written projection,
  no shader and no 3D library. It is thin monochrome line work, with a few nodes
  picked out in brand blue, and it recedes to 45% once the reader is into the
  document so the type stays the contrast anchor.
  This was an **owner-approved reversal** of an earlier all-static decision. If
  the scene ever competes with the content, the opacity is wrong, not the design.
- **SaaS landing templates.** Gradient hero, big stats row, "trusted by 10,000+ teams".
- **Unverifiable numbers.** This audience fact-checks.

## Design Principles

1. **The argument comes first.** Every section earns its place by carrying a
   claim. The reader must learn what this is before they learn anything else.
2. **Rules, not boxes.** Structure comes from hairlines and spacing. Cards are a
   last resort, not a first instinct.
3. **One idea, stated loudly.** The PKGBUILD hero carries the thesis
   (`depends=('you')`). Everything else is quieter around it.
4. **Type carries the voice.** Two families. Display type does the heavy lifting;
   mono handles every label, meta string and code fragment.
5. **Motion answers to state.** Two tiers, and they are not interchangeable:
   - **Scroll-linked** (`animation-timeline`, zero JS, compositor thread) for
     ambient and structural things. The hairline rules draw themselves in as
     each section arrives; the hero backdrop drifts and fades as it leaves.
     Continuous — it tracks scroll position rather than firing once.
   - **Scroll-triggered** (`IntersectionObserver`) for content. Arrives once and
     stays put. Re-animating content on every pass is a theme demo, not a
     document.
   - **Scroll-read** (one rAF loop, written straight to the DOM) for the progress
     bar. It is the one value that changes every frame, so it never touches
     component state — holding it at the root re-renders the entire document
     sixty times a second to move a 2px bar, and reading `scrollHeight` per frame
     forces a layout flush on top of that.

   - **Load-triggered** (one-shot CSS `@keyframes` on first paint) for the hero
     entrance — the PKGBUILD sheet and margin notes rise line by line, like a spec
     being written. It is the only motion that fires on load rather than on
     scroll, and it sits behind `prefers-reduced-motion: no-preference`, so a
     reader who asked for none gets the finished layout with nothing hidden.

   **No pinning, no horizontal hijack, no scroll-jacking.** Those are the
   techniques that make a page feel like it is fighting the reader. Everything
   scroll-driven sits behind `@supports` with the *finished* state as the base
   style, so a browser without scroll-driven animations gets the static design
   rather than a half-drawn one. `prefers-reduced-motion` is handled globally in
   one place and kills every transition on the site.
6. **Honest data or no data.** No fabricated timestamps, no invented mirror
   latencies, no hardcoded release versions, no numbers we cannot source.

7. **A running index, not an eyebrow.** Each section name carries its position in
   the document (`01 — about` … `10 — community`) via a CSS `counter()` over
   `.sec`, so the number tracks DOM order and cannot drift from the section list in
   `constants.js`. It is information, not decoration — the banned eyebrow kicker
   carries no information and goes.

## Accessibility
**In scope, and treated as a shipping requirement.** (This was previously marked
out of scope for the demo. A production surface does not get that exemption.)

Currently implemented:
- One `<h1>` on the page, in the hero. One `<main id="main-content">`. One skip link.
- Semantic landmarks: `nav`, `main`, `footer`, `section` with `aria-labelledby`.
- Native controls throughout: `<button>` for actions, `<a>` for navigation,
  `<input>` for the terminal and the package search, `<details>` for the FAQ.
- One focus treatment on `:focus-visible`, and nothing removes it. The terminal
  input previously set `outline: 0`, which matched the global rule on specificity
  and beat it on source order, leaving keyboard users with no indicator at all.
  It now tunes `outline-offset` and nothing else.
- Text clears WCAG AA against the ground. `--ink-3` is the floor and measures
  5.04:1; it used to be 4.14:1, on text that is almost all 11px.
- The terminal output is a `role="log"` live region, scoped so it does not wrap
  the input. It goes quiet while a scripted command plays and announces one
  summary instead — the animated upgrade would otherwise fire roughly 130
  announcements in four seconds. Progress bars are `aria-hidden`.
- The package search reports into a single persistent `role="status"` line, not a
  live region wrapped around the result list.
- `prefers-reduced-motion` is honoured globally, and the terminal swaps its
  animated `pacman -Syu` for static output rather than silently doing nothing.
- Reveal-on-scroll is a progressive enhancement: if `IntersectionObserver` is
  missing, content renders visible. A `<noscript>` rule does the same without JS.
- Every section is wrapped in an error boundary, so one broken subtree degrades
  to a readable message instead of a blank page.

## Stack & Constraints
- React 19 + Vite 8 (Rolldown). Two runtime dependencies: `react`, `react-dom`.
- **No WebGL, no three.js, no GPU scene.** No shader, no 3D library, and the
  runtime dependency count is `react` + `react-dom`, unchanged.
  - `Backdrop.jsx` draws a fixed, **site-wide** landscape on a 2D canvas: a
    flowing wireframe terrain receding to a horizon, with drifting nodes above it.
    Hand-written projection — Canvas 2D, not WebGL. It draws **no mark** — the
    official Arch logo is the only mark that represents the project, so the
    backdrop stays mark-free rather than carrying a hand-drawn approximation.
  - One rAF loop, stopped when the tab is hidden. Detail tiers by viewport width.
  - Reduced motion and touch devices get a **single static frame** — the full
    atmosphere with nothing moving — rather than a hidden scene.
  - It recedes to 45% once the reader is a viewport into the document, so body
    copy is never fighting moving geometry.
  - See `docs/backdrop.md`.
- **Three font families**, self-hosted in `public/fonts/`, zero CDN:
  - Space Grotesk (400/500/600) — display and body
  - JetBrains Mono (variable) — labels, meta strings, code fragments
  - Agave (regular) — terminal output only
- `index.html` references fonts via `%BASE_URL%` so the GitHub Pages subpath
  deploy resolves. Only the two faces that paint above the fold are preloaded.
- Package search calls the Arch index through a CORS proxy. The base URL is
  `VITE_PKG_API` (see `.env.example`) so it can be replaced with a proxy you
  control. It is the only external runtime dependency on the site.
- Colour tokens: `--bg` `#050507`, `--ink` `#f0f1f2`, `--brand` `#1793D1`,
  `--signal` `#7ec699` (terminal output only). `--ink-3` `#8c929c` is the readable
  floor (clears WCAG AA on `--bg`); `--ink-muted` `#6b707a` is for decorative text
  only (line numbers, labels) and may fail contrast by design. No fifth *hue* —
  the rest of `:root` is shades of these, not new colours.

## References
- **archlinux.org** — the current real site. Borrow its self-possession and dark,
  mechanical voice. The point is not to clone it; it is to be in conversation with it.
