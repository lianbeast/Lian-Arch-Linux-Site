<div align="center">

# 🖥️ Arch Linux — Interactive 3D Experience

**You. The machine. Nothing between.**

A scroll-narrative, single-page experience for Arch Linux — not a brochure, but a place to boot into. A pseudo-UEFI boot sequence. A living 3D scene. Procedural audio. A playable PAC-MAN. It's the site *as* the product: atmosphere around an argument.

[![React 19](https://img.shields.io/badge/React-19-00d4ff?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r184-1793D1?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![ESLint](https://img.shields.io/badge/ESLint-clean-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org)
[![Live demo](https://img.shields.io/badge/Live%20demo-lianbeast.github.io-00ff41?style=flat-square&logo=githubpages&logoColor=white)](https://lianbeast.github.io/Lian-Arch-Linux-Site/)

**▶ [Open the live site](https://lianbeast.github.io/Lian-Arch-Linux-Site/)** — deployed automatically to GitHub Pages on every push to `main`.

</div>

---

## ✨ Features

- **Boot sequence** — BIOS → kernel log → ASCII art → welcome flash → glitch, with a **Skip** button and full `prefers-reduced-motion` support
- **3D scroll narrative** — six scenes (`home`, `features`, `install`, `pacman`, `community`, `game`) with camera choreography, starfield + shooting stars, character-driven matrix rain, glowing orbs, data streams, and a pulse grid floor
- **Playable PAC-MAN** — arrow-key gameplay, ghost AI (Blinky / Pinky / Inky / Clyde), power pellets, frightened mode, and a persistent high score
- **Procedural audio** — every sound is synthesized live with the Web Audio API: an ambient drone that re-tunes per section, UI chirps, and three sound themes (**hacker / retro / minimal**) with a mute toggle (persisted in `localStorage`)
- **Custom cursor follower** — a trailing dot + ring that echoes the scene's neon palette
- **Adaptive performance** — quality tiers (`low / medium / high`) picked from your hardware, adaptive device-pixel-ratio caps, and rendering paused while the tab is hidden

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (HMR) → http://localhost:5173
npm run dev
```

Production build:

```bash
npm run build     # → dist/
npm run preview   # serve the production build locally
```

## 🎮 Controls

| Input | Action |
|-------|--------|
| Scroll / `ArrowDown` / `Space` / `PageDown` | Next section |
| `ArrowUp` / `PageUp` | Previous section |
| `1`–`6` | Jump directly to a section |
| `Escape` | Return to Home — or close the game |
| Arrow keys (in game) | Move PAC-MAN |

## 📁 Project Structure

```
src/
├── App.jsx                 # Root: boot, hash navigation, quality tiers, error boundary
├── main.jsx                # Entry point
├── index.css               # Global styles + design tokens
├── components/
│   ├── three/              # 3D scene: ArchLogo, Starfield, MatrixRain, GridFloor, …
│   ├── ui/                 # 2D overlay: Navbar, Overlay, BootSequence, CursorFollower, …
│   └── games/              # PacmanGame (canvas 2D, lazy-loaded)
└── utils/
    ├── sounds.js           # Procedural audio engine + 3 themes
    └── constants.js        # Section definitions
```

## 🧱 Stack

| Layer | Tech |
|-------|------|
| UI | React 19 |
| Build | Vite 8 (Rolldown) |
| 3D | Three.js via `@react-three/fiber` + `drei` + `@react-three/postprocessing` |
| Audio | Web Audio API (procedural — zero audio assets) |
| Lint | ESLint 10 (flat config, `react-hooks`) |

## ♿ Accessibility

- Skip-to-content link, semantic landmarks, and a screen-reader-visible `<h1>`
- `prefers-reduced-motion` disables animations and skips the boot typing sequence
- Section changes are announced through a persistent live region; `document.title` tracks the active section
- Full keyboard navigation, and the game modal moves focus in and restores it on close

## ⚡ Performance

- Code-split bundles — app code (~46 kB) is separated from the 3D vendor chunk, which gets cached independently
- The PAC-MAN game is lazy-loaded and only fetched when you reach the game section
- Per-tier particle counts and adaptive DPR keep low-end hardware smooth
