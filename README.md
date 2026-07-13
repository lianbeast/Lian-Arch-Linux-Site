# Arch Linux — Interactive 3D Experience

An immersive scroll-narrative marketing site for Arch Linux built with React 19, Three.js, and Vite 8.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (hot-reload at localhost:5173)
npm run dev

# 3. Open in browser — Ctrl+click the URL printed in the terminal
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Production Preview

```bash
npm run build
npm run preview
```

Open the URL shown (default `http://localhost:4173`).

## Navigation

- **Scroll / Arrow keys** — move between sections
- **1–6** — jump directly to a section
- **Escape** — return to Home
- **Space / PageDown** — next section
- **PageUp** — previous section

The game (section 6) uses Arrow keys. Escape closes the game.

## Stack

- **React 19** — UI layer
- **Vite 8** — build tool
- **Three.js** (`@react-three/fiber` + `drei`) — 3D canvas
- **ESLint** — linting

## Project Structure

```
src/
├── App.jsx                — Root: boot sequence, routing, quality tiers
├── index.css              — Global styles, CSS variables
├── main.jsx               — Entry point
├── components/
│   ├── three/             — 3D scene (ArchLogo, Starfield, MatrixRain, etc.)
│   ├── ui/                — 2D overlay (Navbar, Overlay, BootSequence, etc.)
│   └── games/             — Pacman game
└── utils/
    └── sounds.js          — Audio synthesis with 3 themes
```
