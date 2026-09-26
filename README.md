# Arch Linux — scroll landing page

**A man page you can scroll.**

A single-page landing surface for Arch Linux. The hero is a PKGBUILD. The backdrop
is hand-computed SVG contours. Everything else is type, rules and spacing.

**[Open the live site](https://lianbeast.github.io/Lian-Arch-Linux-Site/)** — deployed
to GitHub Pages on every push to `main`.

---

## What this is

An unofficial fan page, not affiliated with the Arch Linux project.

The design thesis is in `PRODUCT.md`: this is a technical document rather than a
landing page, and most layout decisions follow from that. Concretely:

- **The hero is a build recipe.** The headline sits on line 3 of a PKGBUILD and the
  last line is `depends=('you')` — the whole brand thesis as a dependency instead
  of a claim.
- **Rules, not cards.** Section structure comes from hairlines. There is no card
  component, no glassmorphism, and no glow anywhere on the site.
- **Two fonts, four colours.** Space Grotesk for display and body; JetBrains Mono
  for every label, meta string and code fragment. `--bg`, `--ink`, `--brand`,
  `--signal`, and nothing else.
- **No GPU work.** The backdrop is eight SVG paths computed from a two-peak ridge
  function (`src/components/ui/ArchContours.jsx`). No WebGL, no three.js.

## Demo

<div align="center">
  <img src="public/demo.gif" width="560" alt="The interactive terminal running pacman -Syu, neofetch and pacman -Ss firefox">
</div>

Click the terminal window, type a command, or hit a quick-command chip. `Tab`
completes a command, the arrow keys walk history, and `pacman -Syu` animates a
full upgrade. Every response is generated locally — nothing is fetched.

## Features

| Feature | Notes |
|---|---|
| PKGBUILD hero | Headline and thesis in one artifact. `SpecHero.jsx` |
| SVG contour backdrop | Pure SVG, no GPU, nothing to animate |
| Interactive terminal | Ghost autocomplete, tab completion, arrow-key history, animated `pacman -Syu`. Fully local — no network |
| Live package search | Queries the official Arch index. See **Configuration** below |
| Sticky nav + active tracking | `IntersectionObserver`, debounced with `requestAnimationFrame` |
| Scroll progress | A hairline bar. That is the whole feature |
| Reveal on scroll | Progressive enhancement — content renders visible if the API is missing |
| Backdrop | Canvas 2D, hand-projected — no WebGL, no 3D library |
| Animated backdrop | Fixed site-wide 3D landscape. One rAF loop, paused when the tab is hidden, static frame under reduced motion |
| Scroll-driven motion | Native CSS `animation-timeline`: section rules draw themselves in, the backdrop recedes as you read. Zero JS, compositor thread |
| Error boundaries | One per section, so a broken subtree degrades instead of blanking the page |
| Reduced motion | Handled globally in `index.css`, plus a static terminal fallback |

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # → dist/
npm run preview    # serve the build locally
npm run lint
```

## Configuration

The package search needs a CORS proxy: `archlinux.org` sends no
`Access-Control-Allow-Origin` header, so a browser cannot call its API directly.

Copy `.env.example` to `.env.local` and set `VITE_PKG_API` to point at a proxy you
control — a Cloudflare Worker or a small serverless function is enough. Leaving it
blank falls back to the built-in default.

> **Known limitation.** The default proxy is a third-party service. That is the
> only external runtime dependency on this site, and the only piece that can fail
> for reasons outside this project. The search degrades to a link to
> archlinux.org rather than an empty box, but if this site matters, replace it.

## Project structure

```
src/
├── App.jsx                     # Nav, scroll progress, reveal + active-section observers
├── main.jsx                    # Entry: StrictMode + root error boundary
├── index.css                   # The entire design system
├── components/
│   ├── sections/               # One file per section
│   │   ├── SpecHero.jsx        # The PKGBUILD hero
│   │   ├── About.jsx           # Manifesto + facts line
│   │   ├── History.jsx         # Timeline
│   │   ├── Features.jsx        # Command rows
│   │   ├── Terminal.jsx        # Interactive shell
│   │   ├── PackageSearch.jsx   # Live Arch index search
│   │   ├── Download.jsx        # Images + USB commands
│   │   ├── Architectures.jsx   # Platform line
│   │   ├── UseCases.jsx        # Table
│   │   ├── Faq.jsx             # Native <details>
│   │   ├── Community.jsx       # Where to go
│   │   └── Footer.jsx
│   └── ui/
│       ├── ArchContours.jsx    # SVG backdrop
│       ├── ErrorBoundary.jsx
│       └── Icons.jsx           # The Arch mark, and only that
└── utils/
    └── constants.js            # Section order — single source of truth
```

## Stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build | Vite 8 (Rolldown) |
| Backdrop | Inline SVG (no canvas, no WebGL) |
| Layout | CSS Grid; component breakpoints via `@container`, not `@media` |
| Fonts | Space Grotesk + JetBrains Mono, self-hosted |
| Lint | ESLint 10, flat config |
| Runtime deps | `react`, `react-dom` — that is all |

## Maintenance

**First run after a fresh clone of the rewrite:** execute the cleanup script. It
removes the five unused hero variants, the three.js backdrop, eleven orphaned font
files and two stale planning documents that are no longer referenced by anything.
They do not reach the bundle, but they do reach the reader.

```bash
bash scripts/cleanup-dead-code.sh
npm install     # also drops three, @react-three/*, @anthropic-ai/claude-code
```

Then rebuild the lockfile and confirm the dependency tree is down to two runtime
packages:

```bash
npm ls --depth=0
```

**`demo.gif` must live in `public/`.** The Open Graph and Twitter card tags
reference it by absolute URL, which requires a stable, unhashed path. If it sits
in the repo root, Vite fingerprints it into `dist/assets/demo-<hash>.gif` and the
social preview image 404s. `public/` files are copied verbatim, so the path stays
predictable.

**The backdrop is drawn live, not played back.** `Backdrop.jsx` renders a fixed,
site-wide landscape on a 2D canvas — a flowing wireframe terrain, drifting nodes,
and the Arch "A" as a translucent slab — using a hand-written projection. No
WebGL, no three.js, no shader; the dependency count is unchanged.

Two earlier versions were abandoned, and both are worth recording:

- A **generated video clip** — a pre-rendered clip cannot rotate continuously. It
  has to loop, and every loop shows a seam.
- A **hero-scoped rotating ridge** — correct in itself, but the requirement was a
  background for the whole site, not for one section.

`scripts/cleanup-dead-code.sh` removes both, along with the clip. Until you run
it they still ship in `dist/`, because everything in `public/` is copied verbatim
whether or not anything references it.

Reduced motion and touch devices get a **single static frame** — the full
atmosphere with nothing moving. The scene recedes to 45% once you are a viewport
into the document. Geometry and every tuning knob are in
[`docs/backdrop.md`](docs/backdrop.md).

**Scroll-driven animations need a modern engine.** `animation-timeline` is in
Chrome/Edge 115+ and Safari 26+, and not yet in Firefox. Everything scroll-driven
is wrapped in `@supports` with the **finished** state as the base style, so
unsupported browsers render the complete static design — no half-drawn rules, no
missing content. Nothing to configure; it is a progressive enhancement by
construction. If the rules ever look wrong on a real viewport, the tuning knob is
`animation-range` in the scroll-driven block of `src/index.css`.

**When editing `PRODUCT.md`:** it is the design contract, and it must describe the
site that actually ships. If you change the fonts, the palette, the section list
or the type stack, update it in the same commit.

**`opendesign/` is a historical archive, not documentation.** It holds the six
original hero mockups and a UI-kit snapshot built on the *previous* design system
(cyan on black, glow, five font families). It is excluded from lint and from the
build, and it describes a site that no longer exists. Keep it as design history if
that is useful to you, or delete it — but do not read it as a description of
current behaviour.

## Deployment

Pushes to `main` deploy to GitHub Pages. `vite.config.js` sets `base: './'` and
`index.html` resolves assets through `%BASE_URL%`, so the build works from a
project subpath without further configuration.

### Build output you can ignore

```
./fonts/SpaceGrotesk-Regular.woff2 referenced in ./fonts/SpaceGrotesk-Regular.woff2
didn't resolve at build time, it will remain unchanged to be resolved at runtime
```

One of these per font, on every build. It is expected, not a defect.

`%BASE_URL%` expands to `./`, so the `@font-face` URL becomes
`./fonts/SpaceGrotesk-Regular.woff2`. Vite sees a relative `url()` it cannot
resolve from the HTML file and says so — but the file is in `public/`, so it is
copied to `dist/fonts/` verbatim and the browser resolves `./fonts/...` against
the document URL at runtime. That is the correct result; Vite is just narrating.

**To silence it properly**, move the fonts out of `public/` and into
`src/assets/fonts/`, then declare `@font-face` in `src/index.css` with relative
URLs. Vite will fingerprint them and rewrite the URLs. The trade-off is that
fingerprinted filenames cannot be referenced from the `<link rel="preload">` tags
in `index.html`, so you lose the above-the-fold font preload — which is why the
current setup keeps them in `public/` instead.

