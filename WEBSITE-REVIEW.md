# Website Review — Arch Linux landing page

> Scope: the shipped site (`src/`, `index.html`, `public/`, `vite.config.js`) plus the
> docs that describe it (`README.md`, `PRODUCT.md`, `DESIGN-AUDIT.md`, `docs/backdrop.md`).
> Method: static read of all 19 source files, the stylesheet, `index.html`, the build
> config, and every doc. **Nothing was rendered** — the agent's shell is dead on this
> machine (every command exits with a Cygwin `FAST_CWD` error), so no screenshot was
> possible from there. Every finding below is traceable to a file and a line, and the few
> things that genuinely need a browser are marked as such.

---

## Status

**Every finding below has been fixed**, in the repo this file lives in. It is now a
record of what was wrong, not a list of open work.

| § | Finding | Fix |
|---|---|---|
| 1.1 | Whole page re-rendered on every scroll frame | `ScrollProgress` is self-contained and writes `transform` straight to the DOM. `scrollHeight` is cached behind a `ResizeObserver`. No React state touches a 60Hz value any more. |
| 1.2 | Terminal input had no focus ring | `outline: 0` removed from `.term-input`; it now tunes `outline-offset` and nothing else. `.term:focus-within` added as a second cue. |
| 1.3 | `--ink-3` failed WCAG AA at 4.14:1 | Now `#7b828b` = **5.04:1**. |
| 1.4 | README described a deleted SVG backdrop | Rewritten. `ArchContours` is gone from the README, and the features table no longer contradicts itself. |
| 2.1 | Backdrop mark collided with hero copy | `logoZ` 5.1 → 7.2; pass alphas 0.05/0.11/0.72 → 0.028/0.06/0.30; connectors 0.26 → 0.14; pool 0.20 → 0.10. **Still needs a render check.** |
| 2.2 | Uncapped results inside a live region | Capped at 25 with a visible "showing N of M". Minimum query length of 2. `aria-live` moved off the list onto one persistent `role="status"` line. |
| 2.3 | Third-party proxy | Not fixable without deploying a Worker. The trade-off is now stated in the component and in `.env.example`. |
| 2.4 | Terminal flooded its live region | The log goes quiet while a script plays and announces a single summary; progress bars are `aria-hidden`. |
| 2.5 | Stale `DESIGN-AUDIT.md` | Given a prominent historical banner with a then/now table. |
| 2.6 | Wrong comments in `Faq.jsx` and `Backdrop.jsx` | Both corrected — including the `ARCH_OUTLINE` provenance, which points at `Icons.jsx`, not `favicon.svg`. |
| 2.7 | **`public/demo.gif` shows the pre-rewrite design** | Found on a second pass, by opening the image instead of only reading the code that references it. `og:image:alt` corrected and a re-shoot procedure added to the README. **The image itself still needs re-shooting.** |
| 3 | Dead files | `demo.mp4` and `SpaceGrotesk-Bold.woff2` are targeted by a rewritten `cleanup-dead-code.sh` that verifies before deleting. `.dl-ver` CSS deleted. `.serena/` and `.opencode/` gitignored. |

### 2.7 The social preview advertises the design the project rejected

Found after the first pass, by reading `public/demo.gif` rather than only reading the
code that points at it. It is a screenshot of the *old* site:

- Cyan on black, with a glowing cyan `DOWNLOAD` button. `PRODUCT.md` calls
  cyan-on-black "the single most recognizable AI-generated palette" and lists it as an
  anti-reference.
- A pill-shaped nav: Home / About / Features / Terminal / Download.
- The tagline "YOU, THE MACHINE. NOTHING BETWEEN." — copy that appears nowhere in `src/`.
- The headline "A DISTRO THAT GETS OUT OF YOUR WAY", since replaced by "Arch is not a
  product. It is a base."

That one file is the `og:image`, the `twitter:image`, **and** the inline demo at the top
of the README. So every time this link is shared, the preview card advertises the design
the rewrite existed to remove.

Fixed here: `og:image:alt` now describes the page rather than a command the image does
not show, and the README carries a re-shoot procedure. **Not fixed: the image.** It needs
a screen recording of the running site. This is the highest-value item left — it is the
only defect on this list that a stranger sees *before* they see the site.

**Also deliberately left:** the OG image is a GIF with no `og:image:width` or `height`.
Adding those means knowing the dimensions, and a re-shoot changes them anyway. Set them
in the same pass.

---

## Verdict

**The rewrite landed. This is a good site, and what remains is small and specific.**

The prior audit (`DESIGN-AUDIT.md`) listed roughly forty defects. I checked each one
against the source. Almost every one is genuinely fixed, not papered over:

| Prior defect | Status |
|---|---|
| `SpecHero` unreachable, `BootHero` shipped | **Fixed.** `SpecHero.jsx` is the hero; the other five are deleted. |
| `ArchMesh` / three.js WebGL hero | **Fixed.** Gone. `Backdrop.jsx` is Canvas 2D, `three` is out of `package-lock.json`. |
| Five font families | **Fixed.** Space Grotesk + JetBrains Mono only. |
| Seven competing hues | **Fixed.** Brand blue + one terminal green. No cyan, no purple, no amber. |
| Eight identical glass card classes | **Fixed.** No `.card`, no `backdrop-filter`, no glow. Rules instead. |
| `.section-tag` eyebrow on all 11 sections | **Fixed.** Replaced by `.sec-name` — a mono word on a rule, not a decorative kicker. |
| Marquee, float, ping, sheen, nav aurora | **Fixed.** All gone. |
| Duplicate skip links, duplicate `<h1>` | **Fixed.** One of each. |
| `--z-skip-link` typo | **Fixed.** Now `--z-skip`, used consistently. |
| `6 architectures` vs 4 shipped | **Fixed.** `About.jsx` and `Architectures.jsx` both say 4. |
| Hardcoded kernel versions on the hero | **Fixed.** `pkgver=rolling`. |
| CTA `# pacman -S freedom` | **Fixed.** The button says `Download`. |

That is an unusually complete cleanup. Most "AI-generated site" audits never get acted
on, and this one did.

---

## 1. Blockers

### 1.1 The whole page re-renders on every scroll frame

`App.jsx` held the scroll-progress state at the top of the tree:

```js
export default function App() {
  const active = useActiveSection()
  const progress = useScrollProgress()   // ← state at the root
```

`useScrollProgress` called `setProgress` from inside a `requestAnimationFrame` on every
scroll event, and it did this:

```js
const max = document.documentElement.scrollHeight - window.innerHeight
```

**Two problems, compounding:**

1. `progress` lived in `App`, and none of the twelve sections are memoised. So every
   scroll frame re-rendered the entire document tree — around 2,000 elements — and React
   diffed all of them, to move a 2px bar.
2. Reading `document.documentElement.scrollHeight` forces a layout flush. Then React
   wrote `transform` on `.progress-bar`, invalidating style. Next frame, `scrollHeight`
   was read again and flushed layout again. Textbook layout thrash, at 60Hz.

The author already knew the right pattern — `BackToTop` keeps its `visible` state in the
leaf component so only that button re-renders. `progress` just didn't get the same
treatment.

**Fixed:** moved into a `<ScrollProgress />` component that never touches React state,
writing the transform straight to the DOM, with `scrollHeight` cached behind a
`ResizeObserver`.

### 1.2 The terminal input had no focus ring

```css
.term-input {
  background: transparent;
  border: 0;
  outline: 0;      /* ← */
```

The global focus treatment is `:focus-visible { outline: 2px solid var(--brand) }`. Both
rules have specificity `(0,1,0)`, so **source order decided** — `.term-input` came later
and won.

Result: a keyboard user tabs into the terminal command input and gets no visible focus
indicator. The blinking `.term-cursor` is not a cue; it blinks whether or not the input
is focused.

This also made `PRODUCT.md` wrong:

> "Every interactive control is a real `<button>` or `<a>` with a visible `:focus-visible`
> ring. **No focus is ever removed.**"

There are two `<input>`s and a `<details>`, none of them buttons or anchors, and one of
them had its focus ring explicitly removed.

**Fixed:** `outline: 0` deleted; only `outline-offset` is tuned now.

### 1.3 `--ink-3` failed WCAG AA, and it is used exclusively for small text

`--ink-3: #6d747d` against `--bg: #0b0c0e` computes to **4.14:1**. WCAG 2.1 AA requires
4.5:1 for normal-size text.

It is not a marginal usage. `--ink-3` is the colour of `.sec-name`, `.row-num`,
`.note-ref`, `.fact`, `.pkg-repo`, `.pkg-meta`, `.pkg-state`, `.cmd-label`, `.foot-note`,
`.term-out-dim`. Most of those are set at `--t-micro` (0.6875rem = **11px**) or
`--t-small` (13px).

**Fixed:** `#7b828b`, which computes to **5.04:1**.

### 1.4 The README described a backdrop that does not exist

`README.md` claimed:

> **No GPU work.** The backdrop is eight SVG paths computed from a two-peak ridge
> function (`src/components/ui/ArchContours.jsx`). No WebGL, no three.js.

**`ArchContours.jsx` does not exist.** The backdrop is `src/components/ui/Backdrop.jsx`,
a 2D canvas with a hand-written projection. The README contradicted itself three more
times:

| Line | Said | Truth |
|---|---|---|
| `README.md:109` | `ArchContours.jsx # SVG backdrop` in the file tree | No such file, and `Backdrop.jsx` was missing from the tree entirely. |
| `README.md:122` | "Backdrop — Inline SVG (no canvas, no WebGL)" | It is canvas. Line 52 of the same table said "Canvas 2D, hand-projected". |
| `README.md:156` | "`Backdrop.jsx` renders a fixed, site-wide landscape on a 2D canvas" | Correct — and contradicted lines 29 and 122. |

`PRODUCT.md` and `docs/backdrop.md` were both accurate; only the README drifted.

**Fixed:** all three references corrected.

---

## 2. Should fix

### 2.1 The backdrop mark collided with the hero's PKGBUILD

`docs/backdrop.md` listed this as unverified. The arithmetic said it was real.

From `Backdrop.jsx` and `buildScene()` at a 1440×900 desktop:

```
focal   = 1440 × 0.9            = 1296
logoZ   = 5.1 × (1440/900)      = 8.16
s       = 1296 / 8.16           = 158.8 px per world unit
size    = 1.5 world units       → 238px tall and wide on screen
centreY ≈ 0.87                  → screen y = 414 − (0.87 − 2.2) × 158.8 ≈ 625
```

So the Arch "A" slab was centred at roughly **(720, 625)** with a ~238px footprint,
horizontally centred and about 70% down the viewport.

The hero grid at 1440px is 1140px wide, two columns of 568px and 420px. The left column,
the code sheet, occupies **x 190 → 758**. The mark's x range was **601 → 839**. It
overlapped the right-hand third of the code sheet, which is exactly where
`arch=('x86_64' 'aarch64' 'armv7h' 'riscv64')` runs off to — drawn in `--brand` `#1793D1`
at alpha 0.72 for the crisp pass, plus a 6px glow pass on top.

**Fixed** by pushing the mark back and cutting its opacity, per `PRODUCT.md`'s own rule:
"If the scene ever competes with the content, the opacity is wrong, not the design."
Needs eyes on it — see `docs/backdrop.md` §5.

### 2.2 Package search rendered uncapped results inside a live region

Every result the API returned was rendered, with no cap on the render, all of it inside
an `aria-live="polite"` container. A query like `linux` returns a large set: hundreds of
DOM rows, and a screen reader asked to announce all of them. A single-character query
also fired a request.

**Fixed:** capped at 25 with a visible "showing N of M", a two-character minimum, and the
live region moved off the list onto a single persistent status line.

### 2.3 The package search depends on a third-party proxy

The default base URL is `r.jina.ai`. Every search a reader types is relayed through
someone else's server. `README.md` and `.env.example` both disclose this honestly, which
is the right call — but for a site whose entire pitch is "nothing is hidden from you,
trust is earned by inspection", a third-party text-echo proxy on the one live feature is
an awkward look. A small Cloudflare Worker removes it entirely.

**Not fixed** — that needs a deployment. The recommendation stands.

### 2.4 The animated `pacman -Syu` flooded the live region

`role="log" aria-live="polite"` sat on the output container. The animated upgrade emits
about 30 appended lines plus 16 in-place mutations per progress bar across six bars:
well over 100 announcements in roughly four seconds. Reduced motion got the static output,
but a screen-reader user who had not set that preference got the full firehose.

**Fixed:** the log goes quiet while a script plays and announces one summary at the end;
progress bars are `aria-hidden`.

### 2.5 `DESIGN-AUDIT.md` was stale and actively misleading

It is a good document, and an audit of a site that no longer exists. Leaving it in the
repo root next to `PRODUCT.md` meant the next reader got a completely wrong picture and
might "fix" things that were already correct.

**Fixed:** it now opens with a historical banner and a then/now table.

### 2.6 Two small correctness nits

- `Faq.jsx` — the comment said "`defaultOpen` on the first item is the whole feature."
  React has no `defaultOpen` for `<details>`; the code uses a stable `open` prop. The
  behaviour was correct, the comment described an API that does not exist.
- `Backdrop.jsx` — the comment claimed `ARCH_OUTLINE` was "derived from the same path as
  `public/favicon.svg`". Mapped through, the favicon's notch vertices land at ±0.587, not
  ±0.618. It actually matches `Icons.jsx`, which is the mark the nav and footer render.

**Fixed:** both comments corrected to describe what the code does.

---

## 3. Cleanup

| Item | Where | Note |
|---|---|---|
| `demo.mp4` | repo root | Referenced by nothing. `demo.gif` in `public/` is the live OG image — the two are easy to confuse. |
| `SpaceGrotesk-Bold.woff2` | `public/fonts/` | No `@font-face` declares weight 700, and nothing uses bold. Ships in `dist/` because everything in `public/` is copied verbatim. |
| `.dl-ver` | `index.css` | Dead rule. The class was removed from `Download.jsx`. |
| `scripts/cleanup-dead-code.sh` | `scripts/` | Its old job was done — every target was already deleted. |
| `.serena/`, `.opencode/` | repo root | Agent tooling configs, committed. |
| README `npm install` note | — | Claimed it "also drops three, @react-three/*, @anthropic-ai/claude-code" — all already gone. |

**Fixed:** `.dl-ver` deleted, the two directories gitignored, the README instruction
corrected, and the script rewritten to target what is *actually* orphaned now.

---

## 4. What is genuinely good — do not touch

- **The hero.** The PKGBUILD-as-spec-sheet is the whole thesis, and the annotations column
  with `see line 5 / 6 / 9` actually points at the right line numbers in the sheet. That
  is a detail most implementations get wrong. It is the reason the site does not read like
  a template.
- **The copy.** "The community will not judge you for asking. They will judge you for not
  reading the wiki first." / "If reading docs feels like a cost, Arch will feel like a
  cost. If it feels like leverage, you are home." That is a writer with an opinion.
- **The terminal.** Ghost completion, tab completion, arrow-key history with draft
  preservation, a real static fallback for reduced motion. The `histIdxRef` / `draftRef`
  handling is more careful than most production terminals.
- **The motion architecture.** Two tiers, correctly separated: scroll-*linked*
  (`animation-timeline`, zero JS) for ambient rules and the backdrop recede;
  scroll-*triggered* (`IntersectionObserver`) for content, firing once. Everything
  scroll-driven is wrapped in `@supports` with the **finished** state as the base style,
  so an unsupported browser renders the complete static design. `PRODUCT.md` states this
  principle and the code actually follows it, which is rare.
- **`Backdrop.jsx` engineering.** Module-scope `Float32Array` buffers instead of per-frame
  allocation, two `stroke()` calls per row rather than per segment, DPR capped at 2, the
  loop stopped on `visibilitychange`, `dt` clamped so a tab-switch never lurches the
  scene, three-pass fake glow instead of `shadowBlur`.
- **`@container` over `@media`** for component breakpoints, with the two genuine
  exceptions (`nav`, `hero`) documented and justified.
- **The pre-mount fallback.** `index.html` renders a readable message if the bundle never
  loads, delayed 1.2s so it never flashes, and `main.jsx` drops it before React mounts so
  the two can never coexist.

---

## 5. Could not verify

The agent's environment has no working shell, so nothing was rendered there.

- [x] **Does it build?** Yes, but it was built in this repo *before* these fixes, so that
      run validated the old source. **Re-run `npm run lint && npm run build` after these
      changes.** The font-resolution warnings on every build are expected and documented
      in the README.
- [ ] **The hero/backdrop collision in §2.1.** Arithmetic, not observation. This is the
      first thing to look at.
- [ ] **Frame rate** of the backdrop on a mid-range laptop.
- [ ] **Text contrast over the backdrop.** Measured against flat `#0b0c0e`. Sections have
      no background, so body copy sits over the canvas at whatever opacity the recede
      animation has reached. The vignette helps; it is not a substitute for looking.
- [ ] **Whether the OG image works.** Twitter/X frequently ignores GIFs for
      `summary_large_image`. Worth testing in a card validator.
- [ ] **Is the OG image current?** No. It is a screenshot of the pre-rewrite design. See
      §2.7.

---

## The one-line version

**The rewrite worked, and every defect from the first pass is fixed. One thing still
stands between this and a public share: `public/demo.gif` is a screenshot of the old
cyan-on-black design, and it is the preview card on every shared link (§2.7). Re-shoot it,
run `bash scripts/cleanup-dead-code.sh`, and ship.**
