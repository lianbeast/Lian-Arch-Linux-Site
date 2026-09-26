# Backdrop — the animated landscape

A fixed, site-wide 3D scene behind the whole document: a flowing wireframe
terrain receding to a horizon, sparse drifting nodes, and the Arch "A" as a
translucent slab floating over the surface.

`src/components/ui/Backdrop.jsx`. Canvas 2D with a hand-written projection — no
three.js, no WebGL, no shader. Runtime dependencies stay at `react` +
`react-dom`.

---

## 1. Layer stack

Seven layers, as specified. Three are DOM, four are painted into one canvas.

| Layer | Where | What |
|---|---|---|
| 1 — base | `body` | Near-black ground, `--bg` `#0b0c0e` |
| 2 — atmosphere | `.backdrop-atmosphere` | Three low-alpha blue radial pools |
| 3 — distant terrain | canvas | Wireframe grid, fogged toward the horizon |
| 4 — midground | canvas | The same grid; near rows read as midground through fog and scale |
| 5 — nodes | canvas | Sparse drifting points, some with short vertical trails |
| 6 — focal object | canvas | The Arch "A" slab, with a pool of light beneath it |
| 7 — vignette | `.backdrop-vignette` | Darkens the top for the header, the bottom for the fold |

DOM order is bottom-to-top; the canvas clears to transparent so the atmosphere
shows through it.

### Z-order

`.backdrop` is `position: fixed; z-index: 0` and takes no pointer events.
`main`, `.nav`, `.foot`, `.progress`, `.to-top` and `.skip-link` all carry a
z-index above it. **If you add a new top-level element, give it a z-index or it
will render behind the scene.**

---

## 2. The geometry

### Depth

The near plane is derived, not hardcoded. It is the depth at which the mean
surface crosses the bottom edge of the canvas:

```
zNear = CAM_H · focal / (canvasHeight − horizonY)
```

Anything nearer than that is off-screen, so drawing it would be wasted work.
`zFar = zNear × 22`.

Rows are spaced **geometrically** between the two, so they are roughly evenly
distributed in screen space rather than all crammed against the horizon.

### Convergence

World half-width at depth `z` is `halfNear · (z / zNear)^0.85`. The exponent
below 1 is what gives the grid a gentle convergence — with a linear exponent the
columns would be dead vertical and the surface would read as a flat curtain
rather than a plane.

`halfNear` is derived from the canvas width and widened 35%, so the grid always
runs off both edges and never shows a boundary.

### Projection

```
s  = focal / z
sx = cx + panX + x · s
sy = cy + panY − (y − CAM_H) · s
```

`focal = width × 0.9`, `horizonY = height × 0.46`. The horizon therefore sits at
46% of the canvas, terrain filling the lower half and clean darkness above —
which is where the headings live.

### The surface

```js
wave(x, z, t) = sin(x·1.6 + u·1.50) · 0.30
              + sin(z·1.05 − u·1.00) · 0.34
              + sin(x·2.3 + z·1.7 + u·0.73) · 0.20      where u = t · WAVE_RATE
```

Three sines at different frequencies and drift directions, so the surface flows
rather than visibly oscillating. Range ±0.84, with the camera at `CAM_H = 2.2` —
comfortably above the crests.

### The Arch mark

`ARCH_OUTLINE` is the outline of the Arch "A", normalised to a `[-1, 1]` box with
y pointing up. It is derived from the same path as `public/favicon.svg`.

Two copies are drawn at `z ± 0.07` and joined at each vertex, which is what makes
it read as a solid rather than two overlapping drawings. The glow is three passes
of increasing width and decreasing alpha — cheaper and far more controllable than
`shadowBlur`, which costs a full blur kernel every frame.

It **oscillates** (±19° yaw) rather than rotating. A full turn would read as a
loading spinner.

---

## 3. Performance

| Concern | Handling |
|---|---|
| Frame cost | Whole grid is **two `stroke()` calls per row**, not per segment |
| Allocation | Projected coordinates live in module-scope `Float32Array`s |
| Geometry | Detail tiers by width: 16×30 under 640px, 22×44 under 1024px, 28×64 above |
| Nodes | 26 / 44 / 72 by the same tiers |
| DPR | Capped at 2 |
| Tab hidden | Loop stopped via `visibilitychange` |
| Resize | `ResizeObserver`; all size-derived values recomputed once, not per frame |
| Frame delta | Clamped to 50 ms, so a pause never lurches the scene forward |
| Pointer | Eased toward the cursor at 0.045/frame, so the camera drifts rather than snaps |

### Tuning knobs

| Constant | Effect |
|---|---|
| `WAVE_RATE` (0.30) | Master speed of the surface flow |
| `PERSP` (0.85) | Grid convergence. Lower = stronger perspective |
| `CAM_H` (2.2) | Camera height. Lower = closer to the waves |
| `HORIZON` (0.46) | Horizon position as a fraction of canvas height |
| `DEPTH_RANGE` (22) | How far the terrain reaches |
| `DRIFT` (0.55) | Node travel speed |
| `POINTER_PAN` (16) | Maximum camera pan, in px |
| `.backdrop-canvas` opacity in the recede keyframe (0.45) | How far it fades once you are into the document |

**These are reasoned, not seen.** I cannot render, so treat the first four as
starting points. The likeliest first adjustments are `HORIZON` (framing) and
`CAM_H` (how much terrain is visible).

---

## 4. Fallbacks and accessibility

| Condition | Result |
|---|---|
| `prefers-reduced-motion: reduce` | **One static frame** — full terrain, nodes and logo, nothing moving, no pointer parallax |
| `pointer: coarse` | Same static frame |
| `canvas.getContext('2d')` returns null | Layers 2 and 7 only (gradients and vignette) |
| Tab hidden | Loop stopped |

Reduced motion is handled by rendering a single frame rather than by hiding the
scene, so the atmosphere survives. The brief asked for exactly that.

### Readability

This is the part I departed from the brief on. A fixed animated scene behind a
long text document is a genuine readability risk, so **the canvas and atmosphere
fade to 45% once you are one viewport down**, via a scroll-linked animation. The
hero gets the full landscape; body copy gets a quiet one.

If text contrast is still uncomfortable, that opacity value is the knob.

---

## 5. What I could not verify

I cannot render a browser, so none of the following is confirmed:

- [ ] **Framing.** Is the horizon in the right place? Is the logo the right size and distance?
- [ ] **Whether it is subtle enough.** The brief's stated goal is "something is moving back there", not "look at this animation". Watch it for 30 seconds — if you notice it, it is too strong.
- [ ] **Text contrast** on every section, especially the terminal and the package list.
- [ ] **Frame rate** on a mid-range laptop.
- [ ] **Whether the grid reads as a plane or a curtain.** If it looks flat, lower `PERSP`.
- [ ] **Whether the logo reads as integrated or pasted on.** If pasted, it is too bright or too large — the pass alphas in `drawArch` and the `size` constant.
