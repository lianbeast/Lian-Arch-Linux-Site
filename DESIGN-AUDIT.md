# Design Audit — Why This Reads as AI-Generated

> **Historical. This audit describes a site that no longer exists.**
>
> It was written before the rewrite, and every defect in it has since been fixed.
> Keep it as a record of what was wrong and why. Do not work from the "fix, in
> priority order" section at the bottom — all of it landed.
>
> | Then | Now |
> |---|---|
> | `BootHero` shipped, `SpecHero` unreachable | `SpecHero` is the hero; the other five variants are deleted |
> | `ArchMesh` / three.js WebGL hero | Gone. `Backdrop.jsx` is Canvas 2D; `three` is out of the lockfile |
> | Five font families, 13 `@font-face` blocks | Two: Space Grotesk + JetBrains Mono |
> | Seven competing hues | One accent (brand blue), plus one terminal green |
> | Eight identical glass card classes | No cards, no `backdrop-filter`, no glow. Rules instead |
> | `.section-tag` eyebrow on all eleven sections | Replaced by `.sec-name`, a mono word on a rule |
> | Marquee, float, ping, sheen, nav aurora | All removed |
> | Two skip links, two `<h1>`s | One of each |
> | `--z-skip-link` typo | Fixed; the token is `--z-skip` |
> | `6 architectures` vs 4 shipped | Both say 4 |
> | Hardcoded kernel versions in the hero | `pkgver=rolling` |
> | CTA `# pacman -S freedom` | The button says `Download` |
>
> For how the site behaves now, read `PRODUCT.md` (the design contract) and
> `README.md`. For the review that prompted this round of fixes, see
> `WEBSITE-REVIEW.md`.

> Scope: the shipped site (`src/`, `index.html`, `public/`), audited against its own
> stated intent (`PRODUCT.md`, `README.md`, `opendesign/…/brand/*`).
> Method: static read of all 21 JSX files, the 2,381-line stylesheet, and the docs.
> The shell is broken on this machine (every command dies with a Cygwin `FAST_CWD`
> error), so nothing was rendered or screenshotted — every finding below is
> traceable to a file and a line.

---

## Verdict

The site is not badly built. It is **over-built and under-directed**.

Every individual decision is defensible. The problem is that all of them were made
at once, at full volume, with no single point of view holding them together. That
is the signature of generated output: high local competence, zero global taste.
A human designer with a point of view says *no* eleven times. This site says *yes*
eleven times, then adds a twelfth thing nobody asked for.

The most damning evidence is not visual. It is that **the documentation, the
README, and the code describe three different websites**, and the site's own
design doc forbids the exact patterns the site ships.

---

## 1. Root cause: five sources of truth, none of them believed

`PRODUCT.md` is written as "source of truth." It is contradicted by the code on
nearly every specific it names.

| Stated (docs) | Shipped (code) |
|---|---|
| `PRODUCT.md`: "Backdrop is a fixed 2D canvas (`BgCanvas`), 30 particles" | **`BgCanvas` does not exist.** Zero references in `src/`. The particle backdrop described in three separate documents was never built. |
| `README.md` stack table: "Backdrop — Canvas 2D (**no 3D, no WebGL**)" | The hero renders `ArchMesh.jsx`: React Three Fiber + `three`, a WebGL wireframe mountain. The exact opposite. |
| `PRODUCT.md` anti-references: "A WebGL/Three.js demo that exists to show off a shader and then has nothing to say" | That is precisely what the hero is: a 0.35-opacity wireframe with no argument attached. The site's #1 listed anti-pattern is the front door. |
| `PRODUCT.md`: fonts = "Michroma / Rajdhani / JetBrains Mono" | Shipped: Space Grotesk + Inter + JetBrains Mono + Rajdhani + Michroma. **Five families**, 13 `@font-face` blocks. |
| `PRODUCT.md`: nine sections, listed | Eleven shipped (`packages` and `faq` were added without updating the doc). |
| `README.md`: "Dark **Debian**-style document surface" | Debian. On an Arch site. Copy-paste residue from a different project. |
| `PRODUCT.md`: "Motion is atmosphere, **not ornament**" | `.hero-icon` runs `animation: float 6s infinite` — a decorative bob with no job. Plus marquee, nav aurora, sliding glow line, ping, meter-grow, winner-pulse, button sheen. |
| `brand/style-notes.md`: "Accent `#22d3ee` **used sparingly**" | Cyan on every bar, chip, hover border, focus ring, timeline gradient and button gradient — plus purple in the nav aurora, amber in the race hero, green in the terminal. |
| `brand/style-notes.md`: "Hero variants — all **6 production-ready**" | **Five are unreachable.** `TopoHero`, `SpecHero`, `RaceHero`, `TilingHero`, `GardenHero` are never imported. ~500 lines of JSX and ~600 lines of CSS are dead. |
| `docs/superpowers/specs/…-immersion-enhancements-design.md` | Describes `FloatingPanel.jsx`, `Scene.jsx`, `sounds.js`, a boot sequence, a game section, glitch transitions. **None of these files exist.** It is a spec for a different site. |
| `PRODUCT.md` About stats: "6 Architectures" | `Architectures.jsx` lists **4**. The site contradicts itself one scroll apart. |
| Kernel version | `7.2.2-arch1-1` (boot hero) vs `6.10.5-arch1-1` (terminal) vs `6.14.6-arch1-1` (spec doc). Three kernels on one page. |
| `index.html:158`: `z-index: var(--z-skip-link, 9000)` | The token is `--z-skip`. Silently falls back — a typo nobody caught because nothing rendered wrong enough to notice. |
| Skip link + `<h1>` | `index.html` has a skip link to `#root` **and** an `sr-only` `<h1>`; `App.jsx` adds a second skip link to `#main-content`, and `BootHero` adds a second `<h1>`. Two skip links, two h1s, duplicated landmarks. |

**Why this matters more than any visual detail:** it proves the site was assembled
by generation, not by authorship. Authors delete. Authors notice that the doc and
the code disagree and fix one of them. Generated artifacts accumulate — every new
iteration is additive because removing something requires holding a point of view.
`docs/superpowers/` is a fossil layer of a site that no longer exists. `branding_plan.md`
plans to integrate "Lian Beast" logo/GIF/MP4 assets that were never added to
`public/` (it contains only fonts and a favicon). Nobody reconciled any of it.

---

## 2. The ten tells — why it reads as "AI slop"

### 1. An eyebrow on every single section
`.section-tag` appears in all eleven sections: `About`, `Features`, `History`,
`Interactive`, `Platforms`, `Download`, `Packages`, `FAQ`, `Use cases`,
`Community`. Uppercase, letterspaced, tiny, with a `::before` dash
(`index.css:529–547`).

`PRODUCT.md` names this as an anti-reference in its own words: *"brochure sites
(alternating image/text cards, **eyebrow kickers on every section**, friendly icons)."*
The site does it eleven times. This is the single most recognizable
landing-page-template pattern in existence, and the project explicitly banned it.

### 2. One section header, copy-pasted eleven times
Every section is `tag → title → lead`, in the same order, at the same sizes, with
the same 60px gradient underline bolted to every title via `.section-title::after`
(`index.css:561–570`). Scroll the page and you are reading the same five-line
component eleven times with different strings in it. Monotony at this scale is not
consistency — it is the absence of layout decisions.

### 3. Everything is the same glass card
`.card`, `.arch-card`, `.version-card`, `.usecase-card`, `.pkg-card`, `.faq-item`,
`.feature-row`, `.rank-card`. Eight class names, one component: `--bg-card` +
1px border + `--radius-lg` + `backdrop-filter: blur()` + hover
`translateY(-3px|−4px)` + border → `--border-active`. A grid of rounded glass
rectangles is the default safe layout, which is exactly why it reads as
un-designed.

### 4. Gradient and glow as the default, not the exception
`linear-gradient(90deg, --primary, --accent)` appears on the scroll bar, nav
active pill, nav glow line, timeline spine, meter fills, latency bars, primary
button and every section-title underline. `box-shadow: 0 0 Npx var(--primary-glow)`
sits on the terminal, active cards, hero icon and nav. `text-shadow: 0 0 14px`
fires on `.field-val:hover`.

Glow is seasoning. Here it is the meal. When everything glows, nothing is
highlighted — you have spent the entire budget of emphasis before the reader
arrives at the thing that matters.

### 5. Uppercase + wide tracking as a reflex
`.section-tag` 0.14em, `.marquee-word` 0.12em, `.stat-label` 0.12em,
`.nav-brand` 0.1em, `.pkg-repo` 0.08em, `.btn` 0.06em, and every hero kicker at
**0.3em**. Nearly every non-body string is uppercased and letterspaced. This is
the "techy label" tic — it signals *engineered* without saying anything.

### 6. Palette sprawl
Counted in `index.css`: `#1793D1` (Arch blue), `#22d3ee` (cyan), `rgba(120,82,255,…)`
(purple, nav aurora only), `#7ec699` (green), `#e5c07b` (amber, race hero),
`#a5f3c4` (terminal mint), plus three muted traffic-light colors. Seven hues
competing on a page whose own style guide says one accent, used sparingly. The
purple appears exactly once — in the nav aurora — which is the tell that it was
added because the gradient looked thin, not because the brand has a purple.

### 7. Motion that carries no meaning
`float` (hero icon bobbing forever), `marquee` (keywords scrolling for no reason),
`nav-aurora` (a drifting gradient behind a blur), `nav-glow-slide`, `ping`,
`timeline-pulse`, `meter-grow`, `winner-flash`, and the button's `::after` sheen
sweep. `PRODUCT.md` says motion must "answer to a moment in the narrative." None
of these do. They exist because premium sites have motion.

### 8. Glassmorphism over an opaque ground
`backdrop-filter: blur(20px) saturate(180%)` on the nav, `blur(12px)` on cards,
`blur(24px)` on the mobile menu — all sitting on `#0a0a0f`, an effectively opaque
background. Blurring an opaque backdrop produces a slightly more expensive
opaque backdrop. It is cost with no visual return.

### 9. Duplicated scaffolding nobody reviewed
Two skip links, two `<h1>`s, an undefined CSS variable that falls back silently,
and a `.section` class whose `padding` is overridden by a later `.fields` /
`.podium` / `.cuttings` block. This is the fingerprint of code written without
ever looking at the rendered page.

### 10. Fake data presented as fact
`ACPI: Core revision 20260827`, three conflicting kernel versions, fabricated
mirror latencies to one decimal place, `80,000+` repeated five times across the
site, `1,000+ contributors`, `55k+ articles`. `brand/voice-and-tone.md` states the
rule outright: *"Numbers get verified or cut — this audience fact-checks."*
The audience this site is aimed at will notice immediately, and that is the one
audience you cannot afford to bluff.

---

## 3. The buried gold: the best idea on the site is in the dead code

Here is the finding that should reorganize the whole project.

`BootHero` — the shipped default — is the **weakest** of the six hero variants.
It buries the actual message ("Arch Linux, and here is what it is") beneath four
lines of fake kernel noise. A first-time visitor reads `Btrfs (nvme0n1p2): mounted
filesystem zstd compressed` *before* they learn what the page is. The concept is
fine; the hierarchy is inverted.

`SpecHero` — unreachable, never imported — is the strongest idea on the site:

```
# The Arch Way, in plain text
Arch Linux
pkgname=your-machine
pkgver=2026.09.08
arch=('x86_64')
depends=('you')
```

> **"You are the dependency."**

That is the whole thesis of the brand — *sovereignty, the user as the load-bearing
component* — expressed as a structural metaphor instead of a claim. It cannot be
pasted into another product's site. It is the only thing here with no template DNA.

**The site is currently shipping its worst hero and hiding its best one in a file
nobody imports.** Fixing that single swap is worth more than every other
recommendation in this document combined.

---

## 4. What is genuinely good — do not break it

An honest audit cuts both ways. These are real assets:

- **The copy has a voice.** "You. The machine. Nothing between." / "The community
  will not judge you for asking. They will judge you for not reading the wiki
  first." / "Arch is not a product. It is a base." That is a human writer with an
  opinion. Most AI sites sound like a press release; this one sounds like a person.
- **The terminal is a real, well-built interactive.** `Terminal.jsx` has ghost
  autocomplete, tab-completion, arrow-key history, a line-by-line animated
  `pacman -Syu` with growing progress bars, and a static fallback for reduced
  motion. It is the most genuinely "crafted" thing on the site.
- **`ArchMesh` has a concept.** The Arch "A" rendered as terrain, two peaks as the
  logo's legs with the pass between them. That is a real idea, not a stock shader.
  It deserves to survive — just not as a background texture.
- **Reduced-motion handling is thorough and real.** Not a token
  `prefers-reduced-motion` block — it genuinely short-circuits the mesh, the
  terminal animation, the marquee, and the reveals. Keep this discipline.
- **`PackageSearch` hits the live Arch API.** Fragile (it routes through
  `r.jina.ai` because archlinux.org sends no CORS header) but it makes the page
  *actually live*, which is a far better identity than "we have a particle
  background."

---

## 5. The fix, in priority order

### Phase 0 — Delete (do this first, it is free)
1. Remove the five unused hero components and their ~600 lines of CSS
   (`index.css:823–1442`, roughly: topo, spec, fields, race, podium, tiling,
   garden blocks). **Except** — extract `SpecHero` and promote it (Phase 1).
2. Remove `@anthropic-ai/claude-code` from `devDependencies`. It is unrelated to
   this project and adds hundreds of megabytes.
3. Remove `docs/superpowers/` — it documents an architecture that does not exist.
   Or move it to an `archive/` folder if the history matters to you.
4. Fix the `--z-skip-link` typo, and delete one of the two skip links and one of
   the two `<h1>`s.
5. Reconcile the docs. `PRODUCT.md` and `README.md` must describe the site that
   exists. Delete the `BgCanvas` paragraph or build it. Delete the "no WebGL"
   anti-reference or delete `ArchMesh`. **Pick one and mean it.**

### Phase 1 — Commit to one point of view
Promote `SpecHero` to default. The PKGBUILD-as-constitution is your thesis and it
should be the first thing anyone sees. Kill `BootHero`. This immediately fixes the
"buried headline" problem and gives the site a structural identity no competitor
landing page has.

If you keep `ArchMesh`, attach it to the spec concept — the wireframe mountain as
the *terrain the PKGBUILD describes*, in the margin, not as a full-bleed backdrop.

### Phase 2 — Break the template rhythm
This is the highest-leverage visual change.

- **Kill `.section-tag` on 8 of 11 sections.** If a section needs a label, make it
  carry information: a real command (`$ pacman -Qe`), a section index (`03 / 08`),
  or nothing at all. Never a decorative uppercase word.
- **Delete `.section-title::after`.** The gradient underline is on every single
  title. Removing it globally costs nothing and removes one full layer of template
  DNA.
- **Give sections different skeletons.** Right now every section is
  `header → grid`. Make them structurally distinct:
  - `About` → one wide manifesto paragraph, no cards. It is an argument, not a feature list.
  - `Features` → keep the row-list (it already breaks the grid — good).
  - `UseCases` → a table or an editorial two-column list, not six identical cards.
  - `Architectures` → four items do not need a card each; run them as a single line of text.
  - `History` → the timeline is the one place a vertical spine earns its keep. Leave it.
- **Collapse eight card classes into one or two**, and make them differ by
  *structure* rather than by name. If two cards look identical, they are the same
  component and should be one.

### Phase 3 — Typography: cut five families to two
- **Keep:** Space Grotesk (display) + JetBrains Mono (everything technical).
- **Cut:** Rajdhani and Michroma. They are "sci-fi label" fonts — they are what
  makes `.section-tag` and `.stat-value` look like a template. Inter can stay only
  if you commit to real body copy; otherwise go mono-dominant.
- **Consider the bolder move:** make this a mono-dominant site. JetBrains Mono for
  headings, body and UI, Space Grotesk reserved for the hero only. An Arch site
  that speaks entirely in the terminal font would look like nothing else on the
  internet, and it is *on-brand* — the distro's own voice doc says "speaks like a
  good man page."
- **Build a real type scale with contrast.** You have `clamp(2.5rem,5vw,4rem)` for
  every section title and `clamp(3rem,8vw,6rem)` for the hero, then everything else
  clusters at 0.75–1.125rem. There is no mid-range, so nothing has rhythm. Add
  genuine steps and use size to build hierarchy instead of glow.
- **Vary the measure.** `--max-width: 1200px` governs everything. Editorial sites
  change measure per section — a wide feature grid, a narrow manifesto, a
  full-bleed terminal.

### Phase 4 — Color discipline
Cut to four roles and enforce them:

| Role | Value | Rule |
|---|---|---|
| Ground | `#0a0a0f` | One dark base. No gradient section backgrounds. |
| Ink | `#e2e8f0` / `#94a3b8` | Two text weights, that is all. |
| Brand | `#1793D1` | The one accent. Links, active states, the primary CTA. |
| Signal | `#7ec699` | Terminal success output only. Never decorative. |

- Delete the cyan, the purple, the amber, and the muted traffic-light dots.
- Delete every gradient that is not a single, deliberate focal moment. No gradient
  text, no gradient underlines, no gradient buttons.
- **Glow on exactly one element.** Pick the terminal. Everything else flat.
- Focus rings may use a second hue for accessibility — that is functional, not
  decorative, and it is the one exception worth keeping.

### Phase 5 — Copy
- **Verify or cut every number.** `6 architectures` → `4` (match the section).
  Cut `1,000+ contributors` and `55k+ articles` unless you can source them. Keep
  `80,000+` if you cite where it comes from.
- **Fix the CTA.** `# pacman -S freedom` is a good joke in the wrong place — it is
  the primary button and it does not say what happens. `voice-and-tone.md` sets the
  rule: *"A button says what happens."* Move the joke into the terminal as an easter
  egg. Label the button `Download` or `Read the install guide`.
- **Break the sentence rhythm.** Every section lead is *claim, comma, punchy
  fragment*: "No marketing pivots. No acquisitions." / "Straight answers. The wiki
  has the long ones." / "Four load-bearing pieces, designed to compose…". Once a
  reader notices the formula, every section sounds like the same voice reading
  from the same template. Vary sentence length and structure deliberately.
- **Reconcile the kernel versions.** One version, everywhere.
- **Lead with the claim.** Whatever hero you ship, the reader must learn what this
  is in the first line, not the fifth.

### Phase 6 — The signature
Human-designed sites have one decision that could not be lifted into another
project. You already have it: **the PKGBUILD hero**. Push it further:

- Let the page *be* the spec sheet. Sections are fields. The nav is the field list.
- Or make the terminal the site's spine — sections are commands you run.
- Or lean on `PackageSearch` and make "this page is live, this data is real" the
  identity. That is a far stronger differentiator than a particle backdrop.

Pick **one** and let everything else get quieter around it.

---

## 6. Worked example: one section, before → after

**Now (`About`, and 10 others):**
```
[ ABOUT ]                          ← eyebrow, uppercase, 0.14em, ::before dash
A distro that gets out of your way ← 4rem display, gradient underline
Arch is not a product. It is a base. You decide what goes on top.
┌──────────┐ ┌──────────┐ ┌──────────┐   ← three identical glass cards
│ [icon]   │ │ [icon]   │ │ [icon]   │
│ title    │ │ title    │ │ title    │
└──────────┘ └──────────┘ └──────────┘
┌────────────────────────────────────┐   ← stats bar, 4 glow numbers
│ 80,000+  │  6  │ 1,000+ │   20+    │
└────────────────────────────────────┘
```

**After:**
```
$ cat /etc/arch-release           ← the label is now a real command
                                  ← no eyebrow, no dash, no underline

Arch is not a product. It is a base.
You decide what goes on top.

                                   ← one wide paragraph, set narrow,
                                   ← no cards, no icons, no grid.
                                   ← the argument stands alone.

rolling release  ·  pacman + AUR  ·  the wiki      ← one line of text,
                                                       not three cards
```

Same content. Half the elements. It now reads like a person wrote it, because a
person decided which parts were worth emphasis instead of emphasizing all of them.

---

## 7. Quick wins, ordered by impact per hour

| # | Change | Effort | Impact |
|---|---|---|---|
| 1 | Ship `SpecHero`, delete `BootHero` | Low | Very high |
| 2 | Delete `.section-tag` from 8 sections + delete `.section-title::after` | Very low | High |
| 3 | Cut Rajdhani + Michroma; drop to 2 families | Low | High |
| 4 | Kill all gradients/glow except one focal element | Low | High |
| 5 | Delete the 5 dead heroes + ~600 lines of dead CSS | Low | Medium (legibility of the codebase) |
| 6 | Reconcile `PRODUCT.md` / `README.md` with reality | Low | Medium (stops future drift) |
| 7 | Fix the CTA label; verify or cut every number | Very low | Medium |
| 8 | Break the card-grid monotony in `About` / `UseCases` / `Architectures` | Medium | High |
| 9 | Rebuild the type scale with real size contrast | Medium | High |
| 10 | Fix duplicate skip links / h1s / `--z-skip-link` typo | Very low | Low (but it is the tell that nobody looked) |

---

## The one-line version

**You have a real idea — "you are the dependency" — buried in a file you never
import, wrapped in five fonts, seven colors, eight card components and a
particle background that does not exist. Delete 40% of the site, ship the hero
you already wrote, and let one idea be loud instead of all of them.**
