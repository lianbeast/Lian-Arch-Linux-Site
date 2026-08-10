<div align="center">

# 🖥️ Arch Linux — Scroll Landing Page

**You. The machine. Nothing between.**

A single-page scroll landing page for Arch Linux. Dark Debi­an-style document surface, a particle backdrop, a live scroll-progress bar, section reveal-on-scroll, sticky nav with active-section tracking, and an in-page interactive terminal that answers real pacman commands. One argument per section — nothing more.

[![React 19](https://img.shields.io/badge/React-19-00d4ff?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![ESLint](https://img.shields.io/badge/ESLint-clean-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org)
[![Live demo](https://img.shields.io/badge/Live%20demo-lianbeast.github.io-00ff41?style=flat-square&logo=githubpages&logoColor=white)](https://lianbeast.github.io/Lian-Arch-Linux-Site/)

**▶ [Open the live site](https://lianbeast.github.io/Lian-Arch-Linux-Site/)** — deployed automatically to GitHub Pages on every push to `main`.

</div>

---

## ✨ Features

- **Scroll landing** — nine sections (`home`, `about`, `history`, `features`, `terminal`, `architectures`, `download`, `usecases`, `community`) plus a footer, one claim each
- **Particle backdrop** — lightweight 2D-canvas cyan dust (30 particles, DPR-capped, pauses when the tab is hidden)
- **Sticky nav + active tracking** — an `IntersectionObserver` highlights the section you're reading; click to smooth-scroll
- **Scroll-progress bar** — a thin top bar fills as you go down the page
- **Reveal-on-scroll** — `IntersectionObserver` fades sections in once they enter the viewport (skipped under `prefers-reduced-motion` via CSS)
- **Interactive terminal** — an in-page shell that answers `pacman -Syu`, `pacman -Q`, `yay -Ss`, `cat /etc/os-release`, `uname -a`, and `clear`; input is parsed locally, nothing leaves the browser
- **Self-hosted fonts** — Michroma (display), Rajdhani (UI), and JetBrains Mono (terminal) bundled in `public/fonts/` — zero CDN, no tofu

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

## 📁 Project Structure

```
src/
├── App.jsx                 # Root: nav, scroll progress, active section, reveal observer
├── main.jsx                # Entry point
├── index.css               # Global styles + design tokens
├── components/
│   ├── sections/           # Each landing section (Hero, About, Terminal, …)
│   └── ui/                # BgCanvas (particle backdrop), Icons (inline SVGs)
└── utils/
    └── constants.js        # Section list
```

## 🧱 Stack

| Layer | Tech |
|-------|------|
| UI | React 19 |
| Build | Vite 8 (Rolldown) |
| Backdrop | Canvas 2D (no 3D, no WebGL) |
| Lint | ESLint 10 (flat config, `react-hooks`) |

## ⚡ Notes

- `index.html` uses `%BASE_URL%` for fonts and favicon so the GitHub Pages subpath deploy resolves correctly
- Reduced motion: the particle backdrop short-circuits when `prefers-reduced-motion: reduce` matches
