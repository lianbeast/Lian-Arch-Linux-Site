## Context
User provided branding assets (GIF, PNGs, MP4) located in `/home/arch/Pictures/LOGOz/Lian-Beast/`. Goal: integrate these assets into site for visual branding – hero background/video, logo, and decorative images – while preserving existing design system and accessibility.

## Approach
1. **Asset preparation**
   - Create `public/branding/` folder (Git‑tracked).
   - Copy assets from source path to that folder (user runs `cp /home/arch/Pictures/LOGOz/Lian-Beast/* public/branding/`).
   - Ensure video is MP4 (already) and GIF/PNG sizes acceptable; optionally run `rtk gain` to compress.
2. **Hero section** (`src/components/sections/Hero.jsx`)
   - Add optional `<video>` element as background, `autoPlay muted loop playsInline aria-hidden="true" className="hero-video"`.
   - Use provided MP4 (`vidu-video-3405830355831122.mp4`).
   - Fallback to static image `ChatGPT Image Aug 2, 2026, 01_55_44 PM.png` for reduced‑motion users.
   - Add media query `@media (prefers-reduced-motion: reduce) { .hero-video { display:none; } .hero-image { display:block; } }`.
3. **Logo**
   - Insert `<img src="/branding/ChatGPT Image Aug 2, 2026, 01_55_44 PM.gif" alt="Lian Beast logo" className="site-logo"/>` into site header (e.g., `src/components/ui/Header.jsx` or directly in `index.html`).
   - Style `.site-logo` in `src/index.css` (max‑width: 120px; height:auto; responsive).
4. **Decorative images**
   - Use PNGs (`ChatGPT Image Aug 2, 2026, 01_57_54 PM.png`, `ChatGPT Image Aug 2, 2026, 01_59_42 PM.png`) in relevant sections (Features, About) as icons or background accents.
   - Add `<img src="/branding/ChatGPT Image Aug 2, 2026, 01_57_54 PM.png" alt="" className="decorative"/>` with `alt=""` for decorative purpose.
5. **CSS updates** (`src/index.css`)
   - `.hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-1; }`
   - `.hero-image { display:none; }` (shown when video hidden).
   - `.site-logo { max-width:120px; margin:0.5rem; }`
   - Ensure text overlay on hero retains contrast (use semi‑transparent overlay or `text-shadow`).
6. **Accessibility**
   - All images get meaningful `alt` text; decorative PNGs get empty `alt`.
   - Video marked `aria-hidden="true"` and respects reduced‑motion.
   - Verify contrast ratios ≥4.5:1 for hero text.
7. **Verification**
   - Run `npm run lint` – no new ESLint warnings.
   - Run `npm run build` – ensure assets are copied (`public/branding/*` ends up in `dist/branding/`).
   - Deploy via existing GitHub Pages workflow; after push, check live preview for proper hero video and logo.

## Next steps
- User copies assets to `public/branding/`.
- Apply code changes in the files listed above.
- Run lint and build locally.
- Commit and push to trigger GitHub Pages deployment.
