# Code Review — Arch Linux landing page

**Date:** 2026-10-08
**Reviewed revision:** `main` @ `05267581` — fetched live from GitHub, not the local worktree.
**Method:** full read of every source file at that revision.

> This supersedes the earlier `CODE-REVIEW.md`, which was written against a **stale local
> worktree** (missing the Oct 4 "Modern Tool" / "Debian aesthetic" commits). Findings below
> reflect the code that actually ships.

---

## Verdict

Still a strong codebase: two runtime deps, a hand-written Canvas-2D backdrop with no WebGL,
CSS-only motion, per-section error boundaries, and a real honest-data discipline. But the
last round of refine/adapt commits introduced **two genuine regressions** (one accessibility,
one doc/code contradiction) and left a **large duplicated CSS block** behind. Nothing is
catastrophic. Items 1.1 and 2.1 are the ones to fix now.

---

## Priority summary

| # | Type | Finding | Location | Impact | Effort |
|---|------|---------|----------|--------|--------|
| 1.1 | A11y regression | Terminal log floods screen readers; contradicts `PRODUCT.md` | `Terminal.jsx` | **High** | XS |
| 2.1 | Maintainability | ~80 lines of duplicated motion CSS | `src/index.css` | Med | S |
| 4.1 | SEO / asset | `og:image` is a GIF though `demo.png` now exists | `index.html` | Med-High | S |
| 1.3 | Doc drift | `PRODUCT.md` colour tokens no longer match the code | `PRODUCT.md` | Med | XS |
| 3.1 | Perf / polish | Progress-bar transition fights the per-frame write | `src/index.css` | Med | XS |
| 2.2 | Maintainability | Section header duplicated across 10 files | `sections/*.jsx` | Med | M |
| 4.2 | Feature / UX | Search has no cache; blanks results while loading | `PackageSearch.jsx` | Med | M |
| 4.3 | Tooling | Playwright + axe installed but never run | `package.json`, `.github/` | Med | S |
| 1.2 | Correctness | `theme-color` meta is stale (`#0b0c0e` vs `#050507`) | `index.html:14` | Low-Med | XS |
| 1.4 | Doc drift | README says backdrop is "SVG contours"; it is Canvas 2D | `README.md` | Low | XS |
| 2.3 | Maintainability | `App.jsx` holds 4 components + 2 hooks | `src/App.jsx` | Low-Med | M |
| 2.4 | Cleanup | Dead tokens (`--color-cmd-*`, `--z-hud`) | `src/index.css` | Low | XS |
| 3.3 | Repo hygiene | `scroll-world/`, `.utim_tmp/` committed | repo root | Low | XS |
| 4.4 | SEO | JSON-LD is a generic `WebPage` | `index.html` | Low | XS |

Effort: XS < 15 min · S < 1 h · M < half a day.

---

## 1. Bugs & correctness

### 1.1 Terminal live region regressed — announcement flood (a11y) — **High**

**Location:** `src/components/sections/Terminal.jsx` — the output region and the scripted
animation.

```jsx
<div role="log" aria-live="polite" aria-atomic="true" aria-label="Terminal output">
```

**Reasoning:** two problems, both introduced by moving away from the previous design.
- `aria-atomic="true"` on a **growing** log means every appended line re-announces the
  *entire* log contents. After 40 lines, one new line reads back all 40.
- The log is **no longer silenced during the scripted `pacman -Syu`**. The earlier version
  used `aria-live={animating ? 'off' : 'polite'}`, precisely so the ~130 animated updates
  produced *one* summary instead of a flood. That gate is gone.

`PRODUCT.md` still claims the opposite: *"It goes quiet while a scripted command plays and
announces one summary instead — the animated upgrade would otherwise fire roughly 130
announcements in four seconds."* So the code contradicts the contract, and the contract
describes the correct behaviour.

**Fix:** remove `aria-atomic="true"` from the log, and restore the animation gate:
`aria-live={animating ? 'off' : 'polite'}`. The separate assertive `role="status"` summary
region is fine and should stay.

**Expected outcome:** a scripted upgrade announces one summary; ordinary output is announced
once per line, not re-read in full.

---

### 1.2 `theme-color` meta is stale — Low-Med

**Location:** `index.html:14` — `<meta name="theme-color" content="#0b0c0e" />`

**Reasoning:** `--bg` is now `#050507` (the "deeper ground" change), but the browser-chrome
colour still declares the old `#0b0c0e`. On mobile the address-bar tint will not match the
page.

**Fix:** `content="#050507"`.

**Expected outcome:** browser chrome matches the ground.

---

### 1.3 `PRODUCT.md` colour tokens drifted — Med (doc)

**Location:** `PRODUCT.md` → "Stack & Constraints" colour line.

**Reasoning:** it states `--bg #0b0c0e`, `--ink #e7e8ea`, and `--ink-3` at "5.04:1". The code
now has `--bg #050507`, `--ink #f0f1f2`, `--ink-3 #8c929c`, plus a new `--ink-muted` role and
a third font (Agave). `PRODUCT.md`'s own first paragraph says it "must match the shipped
code" — right now it does not.

**Fix:** update the colour line to the current tokens and note `--ink-muted` (decorative-only,
may fail contrast) vs `--ink-3` (readable floor).

**Expected outcome:** the contract is honest again.

---

### 1.4 README opening line contradicts the rest of the file — Low (doc)

**Location:** `README.md`, first paragraph: *"The backdrop is hand-computed SVG contours."*

**Reasoning:** the backdrop is Canvas 2D with a hand-written projection — which the same
README says correctly further down. The intro line is a leftover from the abandoned SVG
`ArchContours` version.

**Fix:** "The backdrop is a hand-written Canvas-2D projection."

**Expected outcome:** no self-contradiction in the first thing a visitor reads.

---

## 2. Code quality / maintainability

### 2.1 `index.css` carries a duplicated motion block (~80 lines) — Med

**Location:** `src/index.css`. The hero entrance and the scroll-driven blocks are each
declared **twice** — once in their named sections, and again in an appended block near the
bottom under `/* Default: functional motion always on */` + `@media (prefers-reduced-motion:
no-preference)`.

Duplicated verbatim:
- `@keyframes hero-rise`
- `.hero-code > *` + the 18 `nth-child` delays + `.hero-notes > *` + `.hero-cue`
- `@supports (animation-timeline: scroll())` → `.backdrop-canvas/.backdrop-atmosphere`
- `@supports (animation-timeline: view())` → the `.sec-head::before`… rule-draw block
- `.progress-bar { transition: transform 90ms linear; }`
- `.term-cursor { animation: blink … }`

**Reasoning:** identical today, so there is no *visual* bug — but it is dead weight and a
drift hazard: editing one copy leaves the other silently in the cascade, and a future change
to one will "work" while the other disagrees. It looks like a merge that appended the new
gated block without removing the old one.

**Fix:** keep exactly one definition of each — delete the earlier copies (or the later block)
and leave the motion tiers in one clearly-commented place.

**Expected outcome:** one source of truth for motion; ~80 fewer lines.

---

### 2.2 Section header duplicated across 10 files — Med

**Location:** every `src/components/sections/*.jsx` — identical
`<header className="sec-head"><p className="sec-name">…</p><h2 id="…-title" class="sec-title">…</h2><p class="sec-lead">…</p></header>`.

**Reasoning:** ten hand-maintained copies of one structure. The running index is CSS-driven
(`.sec-name::before`), so an extraction needs no index prop.

**Fix:** add `src/components/ui/SectionHead.jsx` taking `{ name, title, id, lead }`, and use
it in all ten sections.

**Expected outcome:** one header contract; adding a section is less error-prone; no visual change.

---

### 2.3 `App.jsx` holds four components and two hooks — Low-Med

**Location:** `src/App.jsx` (~360 lines): `Tweaks`, `ScrollProgress`, `Navbar`, `BackToTop`,
`useReveal`, `useActiveSection`.

**Fix (optional):** extract to `src/components/ui/` and `src/hooks/`; `App` becomes pure
composition.

**Expected outcome:** single-responsibility files; testable observers. Low priority.

---

### 2.4 Dead tokens — Low

**Location:** `src/index.css` → `:root`.

- `--color-cmd-bg|fg|prompt|input|output|success|error|warn` (8 tokens) appear declared but
  never referenced — the terminal styles use `--ink-*` / `--signal` / `--brand-ink`.
- `--z-hud: 9999` is declared but `.hud` uses `var(--z-nav)`.

**Fix:** grep to confirm, then delete (or wire `--z-hud` into `.hud` if the HUD was meant to
sit above the nav).

**Expected outcome:** no dead tokens.

---

### 2.5 Playwright + `@axe-core/playwright` are installed but never run — Low

**Location:** `package.json` devDeps; `.github/workflows/deploy.yml`.

**Reasoning:** the deps were added, but there is no `test` script and no test files, and the
only workflow deploys. Either they are dead weight or an a11y check was intended and never
wired.

**Fix:** either add `scripts.test:a11y` running axe against the built page and call it from CI
(see 4.3), or drop the deps.

**Expected outcome:** the tooling earns its place.

---

### 2.6 Agave Bold may be unused — Low

**Location:** `index.html` `@font-face` for `Agave` weight 700
(`Agave-Bold-zeroslashed-parenbulged.woff2`).

**Reasoning:** no `--font-agave` rule sets `font-weight: 700`, so the bold face may never be
requested — the same dead-weight pattern the README calls out for Space Grotesk Bold.

**Fix:** verify; if unused, remove the face and the file.

---

## 3. Performance

### 3.1 Progress-bar transition fights the per-frame write — Med

**Location:** `src/index.css` — `.progress-bar { transition: transform 90ms linear; }`
(declared **twice**, see 2.1), against `App.jsx` `ScrollProgress` writing
`bar.style.transform = scaleX(p)` every rAF.

**Reasoning:** the rAF already updates once per frame; the 90 ms transition re-smooths an
already frame-accurate value, so the bar trails the scroll.

**Fix:** remove the transition (keep `transform-origin` + `scaleX(0)`), or drop the rAF if the
transition was the intended smoothing.

**Expected outcome:** the bar tracks scroll exactly.

---

### 3.2 Backdrop `isInputPending` guard is Chrome-only — Info

**Location:** `src/components/ui/Backdrop.jsx`, `tick()`.

**Reasoning:** `navigator.scheduling?.isInputPending?.()` yields the main thread during input,
which is good — but it is a no-op on Safari/Firefox. The code comment mentions
`scheduler.yield()` as "the modern way"; it is not actually used. No action required (the
optional-chaining guard degrades cleanly), just know the benefit is Chromium-only today.

---

### 3.3 Repo weight — Low

**Location:** repo root `scroll-world/` (`videos/`, `stills/`, `assets/`), `.utim_tmp/`,
`public/assets/brandkit/`.

**Reasoning:** committed media (`scroll-world/videos`) bloats every clone and has nothing to
do with the built site. `.utim_tmp/` looks like a stray temp directory.

**Fix:** `.gitignore` them, or move them out of the repo.

---

## 4. Feature recommendations

### 4.1 Point `og:image` at the static PNG — Med-High

**Location:** `index.html` `og:image` / `twitter:image`.

**Reasoning:** `public/demo.png` now exists, but both tags still reference `demo.gif`. Twitter/X
frequently ignores animated images for `summary_large_image`, and there are no
`og:image:width/height/type` hints, so crawlers guess the aspect ratio.

**Fix:** point `og:image` at `demo.png`, add `og:image:width="1200" og:image:height="630"
og:image:type="image/png"`, and keep the GIF for the README.

**Expected outcome:** a correct, non-animated, correctly-sized social card.

*(Also verify the README's claim that `demo.gif` still shows the old cyan-on-black hero — the
`c4d072cc` commit says the GIF was regenerated, so the README may itself be stale here.)*

---

### 4.2 Search: cache results, and don't blank while loading — Med

**Location:** `src/components/sections/PackageSearch.jsx`.

**Reasoning:** re-typing a query re-hits the third-party proxy; and every keystroke flips
`view` to `LOADING`, wiping the previous results (flicker).

**Fix:** a bounded module-level `Map` cache keyed by the trimmed query; and while a new query
is pending, keep the last result set rendered (dimmed, `aria-busy`) instead of clearing it.

**Expected outcome:** fewer proxy calls, no flicker.

---

### 4.3 Wire an axe/Playwright a11y check into CI — Med

**Location:** `.github/workflows/deploy.yml`.

**Reasoning:** the deps are already installed (2.5), the site is explicitly a11y-conscious, and
finding 1.1 is exactly the kind of regression an automated axe pass would catch.

**Fix:** add a job that builds the site, serves it, and runs `@axe-core/playwright` against the
page; fail on violations.

**Expected outcome:** a11y regressions are caught on push, not by reading code.

---

### 4.4 JSON-LD `SoftwareApplication` — Low

**Location:** `index.html` JSON-LD.

**Reasoning:** a generic `WebPage` node says little; this page is about a piece of software.

**Fix:** add/replace with a `SoftwareApplication` node (`applicationCategory:
OperatingSystem`, `operatingSystem: Linux`, free `Offer`). Keep it truthful — no invented
ratings or download counts.

---

## Considered and *not* a bug (so you don't chase it)

- **Font `url()` build warnings.** Expected, and the README documents this correctly —
  `@font-face` lives in an inline `<style>` pointing at `public/` via `%BASE_URL%`, resolved
  at runtime. Cosmetic.
- **Backdrop per-frame `sin` cost.** ~28×64 vertices × 3 sines/frame, `Math.pow` hoisted per
  row, detail tiers scale it down on small screens. Within budget.
- **Anchor links under the sticky nav.** Masked by the large `.sec` top padding
  (`clamp(5rem,11vh,9rem)`), so the nav only covers empty space. A blind `scroll-padding-top`
  would add an unwanted gap. Not a bug today.
- **Terminal bar DOM writes vs React reconciliation.** Verified safe: the bar line's React
  output is derived from `l.progress`, which stays `0` in state (the animation writes the DOM
  directly), so re-renders produce an identical string and React never clobbers the direct
  write. The inline callback ref churns the `Map` per render but stays correct.
