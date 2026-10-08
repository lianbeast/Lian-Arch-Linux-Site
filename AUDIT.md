# Impeccable audit — Arch Linux landing page

**Reviewed:** `main` @ `5e88a6f`
**Design context:** `PRODUCT.md` — the project's design contract. There is no `.impeccable.md`
by design (`PRODUCT.md` warns against competing sources of truth), so its audience,
personality and anti-references are the context for this audit.
**Method:** code-level audit against the five dimensions in the impeccable `audit` reference.
Measurable, verifiable checks only. Issues are documented, not fixed.

---

## Anti-patterns verdict — start here

**Pass. This does not read as AI-generated.** The classic tells are absent:

- No Inter / Roboto / Arial — Space Grotesk + JetBrains Mono + Agave, self-hosted.
- No pure `#000` / `#fff` — ground `#050507`, ink `#f0f1f2`.
- No cyan-on-black, no AI purple/blue gradient, no neon.
- No glassmorphism, no card grid, no hero-metrics row, no gradient-text headers.
- No bounce/elastic easing — `cubic-bezier(0.22,1,0.36,1)` and `(0.32,0.72,0,1)` only.
- No emoji, no marquee, no custom cursor.

**Three drifts to watch** (subtle, not slop):

1. `.sec-name` is now `text-transform: uppercase; letter-spacing: 0.2em` — visually
   *eyebrow-adjacent*. It carries the running index (`01 — about`), so it is **not** the
   banned kicker, but it sits closer to it than the original lowercase mono did.
2. Film grain (`.grain`), the HUD corner frame (`.hud`) and the hero gradient mesh
   (`.hero::before`) arrived in the Oct-4 "Debian register" pass. Intentional, but they are
   decoration, and `PRODUCT.md` asks for "conviction, never reassurance".
3. `.progress-bar` had a `transition` fighting its per-frame rAF write — **resolved this pass.**

---

## Audit health score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | `.c` hero comment line measures ≈4.1:1 — below AA |
| 2 | Performance | 4 | — |
| 3 | Responsive | 3 | Compact toggle is 40×20px (<44px) |
| 4 | Theming | 3 | Vignette `rgba()` stops hard-coded, not tokenized |
| 5 | Anti-Patterns | 4 | No AI tells |
| **Total** | | **17/20** | **Good** |

Bands: 18–20 Excellent · 14–17 Good · 10–13 Acceptable · 6–9 Poor · 0–5 Critical.

---

## Executive summary

- **Score:** 17/20 (Good)
- **Issues:** P0 0 · P1 1 · P2 3 · P3 5
- **Top issues:** (1) the hero comment line misses AA contrast; (2) the compact-mode toggle is
  under the 44px touch target; (3) its visible label isn't programmatically tied to the checkbox.
- **Next steps:** a `/normalize` pass (contrast + hard-coded values), then `/adapt` (touch
  target), then `/polish`.

---

## Detailed findings

### [P1] Hero comment line fails AA contrast
- **Location:** `src/index.css:677` — `.c { color: var(--ink-muted) }`, used by `SpecHero.jsx`
  for `# The Arch Way, in plain text`.
- **Category:** Accessibility
- **Impact:** `--ink-muted` `#6b707a` on `--bg` `#050507` measures ≈ **4.1:1**, under the 4.5:1
  AA floor for normal text. It is italic and small, so practical impact is low — but it is a
  visible sentence, not pure metadata.
- **Standard:** WCAG 2.1 AA — 1.4.3 Contrast (Minimum)
- **Recommendation:** use `--ink-3` (`#8c929c`, ≈5.9:1) for `.c`, or brighten `--ink-muted`
  past 4.5:1. Keep `--ink-muted` for genuinely decorative text (the line numbers, which are
  `aria-hidden`).
- **Suggested command:** `/normalize`

### [P2] Compact-mode toggle is under the touch-target minimum
- **Location:** `src/index.css` — `.tweaks-toggle span` is `width: 2.5rem; height: 1.25rem`
  (40×20px).
- **Category:** Responsive
- **Impact:** the switch's hit area is 20px tall, below the 44px guideline, on a fixed control
  that is always reachable on touch devices.
- **Standard:** WCAG 2.1 AA — 2.5.8 Target Size (Minimum, 24px); platform guidance 44px
- **Recommendation:** give the `<label>` a 44px min-height; let the visual track stay 20px.
- **Suggested command:** `/adapt`

### [P2] Visible "Compact" label not associated with the checkbox
- **Location:** `src/App.jsx` `Tweaks` — `<span className="tweaks-label">Compact</span>` is a
  sibling of `<label className="tweaks-toggle">`, not inside it.
- **Category:** Accessibility
- **Impact:** the input is labelled via `aria-label`, so it is not unlabelled — but the visible
  text is not programmatically associated, which breaks voice control ("click Compact") and
  some AT.
- **Standard:** WCAG 2.1 AA — 2.5.3 Label in Name
- **Recommendation:** move the visible text inside the `<label>`, or point `aria-labelledby`
  at it.
- **Suggested command:** `/harden`

### [P2] Uppercase-spaced section labels drift toward the banned eyebrow kicker
- **Location:** `src/index.css` — `.sec-name { text-transform: uppercase; letter-spacing: 0.2em }`
- **Category:** Anti-Pattern
- **Impact:** `PRODUCT.md` bans "a decorative uppercase label above every headline". These
  labels carry the running index, so they are *not* the banned kicker — but the all-caps,
  wide-tracked treatment reads as one at a glance.
- **Recommendation:** revert to lowercase mono, or drop the extra tracking. A judgement call
  against the project's own contract.
- **Suggested command:** `/quieter`

### [P3] `aria-current="true"` should be `"location"`
- **Location:** `src/App.jsx:250`; selectors `src/index.css:295,311`
- **Category:** Accessibility
- **Impact:** `true` is valid; `location` is the precise token for "current item within a set of
  navigation links". Minor AT fidelity.
- **Recommendation:** change the value and update the two CSS selectors.
- **Suggested command:** `/normalize`

### [P3] Vignette colour stops are hard-coded
- **Location:** `src/index.css:597–598` — `rgba(5, 5, 7, 0.6)` / `rgba(5, 5, 7, 0.78)`
- **Category:** Theming
- **Impact:** these duplicate `--bg`; if the ground changes again they silently drift — as they
  already did once (`#0b0c0e` → `#050507`).
- **Recommendation:** `color-mix(in srgb, var(--bg) 60%, transparent)`.
- **Suggested command:** `/normalize`

### [P3] Backdrop `cssVar` fallbacks duplicate token values
- **Location:** `src/components/ui/Backdrop.jsx:219–220` — `'#2c3138'`, `'#1793d1'`
- **Category:** Theming
- **Impact:** two more copies of `--rule-2` / `--brand`. Legitimate as fallbacks (they only
  apply if the var is missing), but a third place the value lives.
- **Recommendation:** keep, but note it; or derive from a single source.
- **Suggested command:** `/normalize`

### [P3] Dead tokens, unused devDeps, repo bloat
- **Location:** `src/index.css` (`--color-cmd-*` ×8, `--z-hud`); `package.json` (`playwright`,
  `@axe-core/playwright` installed but never run); repo root (`scroll-world/`, `.utim_tmp/`)
- **Category:** Performance / maintainability
- **Impact:** nothing ships to users, but it is dead weight and future confusion.
- **Recommendation:** delete the unused tokens; wire the a11y deps into CI or drop them;
  `.gitignore` the media dirs.
- **Suggested command:** `/distill`

### [P3] `body { overflow-x: hidden }` can mask real overflow
- **Location:** `src/index.css` — `body`
- **Category:** Responsive
- **Impact:** horizontal overflow is clipped rather than diagnosed, so a genuine mobile
  overflow bug would go unnoticed.
- **Recommendation:** keep it, but verify at 320px with it temporarily disabled.
- **Suggested command:** `/adapt`

---

## Patterns & systemic issues

- **Token discipline is strong but not absolute.** Colour, type, space, motion and z-index are
  all tokenized; the exceptions are one vignette and two fallbacks. Not systemic.
- **The Oct-4 "register" pass added a decorative layer** (grain, HUD, mesh, uppercase labels)
  that is at odds with the project's own restraint language — worth a deliberate review against
  `PRODUCT.md` rather than accidental drift.
- **Accessibility is treated as a shipping requirement** (skip link, landmarks, live-region
  discipline, reduced motion, 44px targets). The gaps above are exceptions, not the norm.

---

## Positive findings

- Two runtime dependencies; the entire backdrop is hand-written Canvas 2D with no WebGL.
- The scroll-read value is written straight to the DOM via rAF, with `scrollHeight` cached
  behind a `ResizeObserver` — no per-frame layout flush.
- Animations are restricted to `transform` / `opacity` / `filter`; scroll-driven motion is
  native CSS `animation-timeline` behind `@supports`, with the *finished* state as the base.
- The terminal live region goes quiet during the scripted upgrade and announces one summary —
  a genuinely thoughtful a11y decision (restored this pass).
- Honest-data discipline: no fabricated versions, dates or statistics.

---

## Recommended actions

1. **[P1] `/normalize`** — fix `.c` contrast; tokenize the vignette stops; `aria-current` token.
2. **[P2] `/adapt`** — 44px compact toggle; verify no overflow at 320px.
3. **[P2] `/harden`** — associate the visible "Compact" label with the checkbox.
4. **[P2] `/quieter`** — reconsider the uppercase-spaced section labels against `PRODUCT.md`.
5. **[P3] `/distill`** — drop dead tokens, unused devDeps, repo bloat.
6. **[P3] `/extract`** — shared `SectionHead` across the ten sections.
7. **`/polish`** — final pass once the above land.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/audit` after fixes to see the score improve.
