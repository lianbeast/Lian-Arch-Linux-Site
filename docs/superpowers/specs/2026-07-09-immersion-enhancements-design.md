# Immersion Enhancements — Design Spec

> Date: 2026-07-09
> Project: Arch Linux Interactive 3D Experience
> Brand: Diabolic. Sovereign. Uncompromising.
> Approach: Immersion First (Approach 3)

## Summary

Four focused enhancements that deepen the existing experience without adding new sections or bloat. Every change either multiplies the mood of what's already there (ambient audio, postprocessing, glitch transitions) or makes the existing content feel alive and responsive (neofetch terminal readout).

## 1. Ambient Audio Layer

### API (in `src/utils/sounds.js`)

New exports:

```js
startAmbient()     // Create oscillator chain, start at gain 0, fade in over 2s
stopAmbient()      // Fade out over 1s, then stop and disconnect
setAmbientSection(index)  // Transition to the given section's sound profile
```

Implementation: single `OscillatorNode` at a base frequency, routed through a `BiquadFilterNode` and `GainNode`. Per-section parameters change filter type, frequency, and Q — no new oscillator nodes.

### Per-Section Profiles

| Section | Index | Base Freq | Filter Type | Filter Freq | Additional |
|---------|-------|-----------|-------------|-------------|------------|
| Home | 0 | 96 Hz (sine) | lowpass | 400 Hz | — |
| Features | 1 | 96 Hz + 144 Hz (sum) | bandpass | 250 Hz | Second oscillator, detuned +50 cents for warmth |
| Install | 2 | 64 Hz | lowpass | 200 Hz | — |
| Pacman | 3 | 96 Hz | lowpass | 400 Hz | LFO on gain: 0.15s triangle wave, depth 30% |
| Community | 4 | 96 Hz + 192 Hz | lowshelf | 200 Hz | — |
| Game | 5 | — | — | — | Ambient stops during game |

### Integration (in `src/App.jsx`)

- `startAmbient()` called in `handleBootComplete` (after boot sequence ends)
- `setAmbientSection(activeSection)` called inside `navigateTo` alongside sound effects
- `stopAmbient()` in cleanup of booted effect
- Mute toggle already handled: `guard()` in sounds.js prevents playback; ambient checks same `muted` flag
- Volume: very low — `gainNode.gain.value` set to 0.03 (3% of master)

### Files Changed

- `src/utils/sounds.js` — new ambient functions + per-section profile map
- `src/App.jsx` — wire up to boot complete handler and navigateTo

## 2. Postprocessing — Bloom + Scanline Overlay

### Bloom (3D canvas only)

Uses `@react-three/postprocessing` `Bloom` effect (already a dependency via `@react-three/postprocessing` v3.0.4).

Configuration:
```js
<EffectComposer>
  <Bloom
    intensity={0.3}
    luminanceThreshold={0.9}
    luminanceSmoothing={0.02}
    radius={0.2}
    mipmapBlur
  />
</EffectComposer>
```

Only renders on high quality tier. Disabled for low/medium.

### Scanline Overlay (3D canvas only)

A thin `<div>` with a repeating linear gradient, absolutely positioned over the Canvas, pointer-events: none.

```css
background: repeating-linear-gradient(
  0deg,
  transparent 0px,
  transparent 3px,
  rgba(0, 0, 0, 0.03) 3px,
  rgba(0, 0, 0, 0.03) 4px
);
```

Low opacity (0.03) — barely visible, subconscious CRT texture. Disabled on `prefers-reduced-motion` (though static, it's a visual effect). Disabled on mobile (low/medium tier).

### Section-Adaptive Lighting (in `src/components/three/Scene.jsx`)

The existing ambient and point lights get their color tint shifted per section:

| Section | Ambient Light | Point Lights |
|---------|--------------|--------------|
| Home | 0.2 white (#ffffff) | 0.5 neutral |
| Features | 0.2 blue (#1793D1) | 0.5 blue |
| Install | 0.2 amber (#ff8800) | 0.5 amber |
| Pacman | 0.2 green (#00ff41) | 0.5 green |
| Community | 0.2 cyan (#00d4ff) | 0.5 cyan |
| Game | 0.2 white | 0.5 neutral |

Colors transition smoothly using `THREE.Color.lerp()` over 300ms on section change.

### Files Changed

- `src/components/three/Scene.jsx` — add `EffectComposer` + `Bloom`, section-adaptive light colors
- `src/App.jsx` — add scanline overlay div sibling to Canvas
- `src/index.css` — scanline keyframes and overlay class

## 3. Official Arch Linux Logo (Favicon)

Replace current `public/favicon.svg` (purple glow SVG with complex filters) with the official Arch Linux logo.

The official Arch Linux logo is available from `archlinux.org` — a dark blue rounded diamond with the Arch wordmark, or the minimalist blue diamond (favicon variant). The exact source should be fetched during implementation.

### Files Changed

- `public/favicon.svg` — replaced with official logo SVG

## 4. Neofetch Terminal Readout

### New Component: `TerminalFetch`

File: `src/components/ui/TerminalFetch.jsx` + `src/components/ui/TerminalFetch.css`

Renders inside `FeaturesContent` in `FloatingPanel.jsx`, positioned above the existing feature grid items.

### Layout

A bordered terminal window with:
1. Title bar: `[user@archlinux ~]$ neofetch` (monospace, dim)
2. ASCII art column (simplified TUX in terminal chars, or single-column Arch diamond logo in ascii)
3. System info column:

```
OS:        Arch Linux (rolling)
Host:      {navigator.userAgent data → platform info}
Kernel:    6.14.6-arch1-1
Uptime:    since you arrived
Packages:  80,000+ (AUR)
Shell:     bash 5.2.26
CPU:       {navigator.hardwareConcurrency} × 5.2GHz
GPU:       WebGL 3.0
DE:        Arch Linux Interactive Experience
```

### Data Sources

| Field | Source |
|-------|--------|
| OS | Static: "Arch Linux (rolling)" |
| Host | Static: browser platform name |
| Kernel | Static: "6.14.6-arch1-1" (matches boot sequence) |
| Uptime | Computed: `Date.now() - pageLoadTime`, formatted as "Xm Ys" |
| Packages | Static: "80,000+ (AUR)" |
| Shell | Static: "bash 5.2.26" |
| CPU | `navigator.hardwareConcurrency` + static "5.2GHz" |
| GPU | Static: "WebGL 3.0" |
| DE | Static: "Arch Linux Interactive Experience" |
| Resolution | `screen.width × screen.height` |

### Animation

When `active` prop becomes true (section enters):
- Lines type in one by one, each character appearing at ~25ms intervals
- Total animation: ~2 seconds
- Panel fades in as part of the FloatingPanel's existing scale animation

### Files Changed

- `src/components/three/FloatingPanel.jsx` — import and render `<TerminalFetch />` inside `FeaturesContent`
- New: `src/components/ui/TerminalFetch.jsx`
- New: `src/components/ui/TerminalFetch.css`

## 5. Glitch Transitions

### Mechanism

A CSS class `.glitch-transition` applied to the root `#root` element wrapper by `App.jsx` during `transitioning` state.

```css
.glitch-transition {
  animation: sectionGlitch 0.2s ease-out;
}

@keyframes sectionGlitch {
  0%   { transform: translateX(0); }
  10%  { transform: translateX(-2px) skewY(0.5deg); filter: hue-rotate(15deg); }
  20%  { transform: translateX(2px) skewY(-0.3deg); }
  30%  { transform: translateX(-1px); }
  40%  { transform: translateX(1px); filter: none; }
  50%  { transform: translateX(0); }
  100% { transform: translateX(0); }
}
```

Duration: 200ms. Already gated by the existing `transitioning` state (800ms lockout on navigation). The glitch runs for the first 200ms and exits cleanly.

### Files Changed

- `src/App.jsx` — add `.glitch-transition` class to root wrapper div during `transitioning`
- `src/index.css` — add `@keyframes sectionGlitch` and `.glitch-transition` class

## Performance / Bundle Impact

| Enhancement | KB added | Notes |
|-------------|----------|-------|
| Ambient audio | 0 | Web Audio API, no assets |
| Bloom | ~8 KB | Already in bundle via `@react-three/postprocessing` |
| Scanline overlay | 0 | Pure CSS |
| Neofetch readout | ~3 KB | Pure CSS + inline SVG |
| Glitch transitions | 0 | Pure CSS |
| Favicon replacement | ~9 KB smaller | Replacing 12 KB SVG with ~3 KB official logo |
| **Net** | **~+11 KB** | Mostly already in bundle |

## QA Checklist

- [ ] Ambient audio: starts after boot sequence, stops on mute toggle
- [ ] Ambient audio: each section has correct pitch/filter profile
- [ ] Bloom: visible on 3D canvas on high tier, absent on low/medium
- [ ] Scanlines: visible on desktop, absent on mobile
- [ ] Lighting: per-section colors transition smoothly
- [ ] Neofetch: typing animation plays once per section entry
- [ ] Neofetch: live data fields reflect actual browser info
- [ ] Glitch: fires on navigation, respects reduced-motion
- [ ] Favicon: shows official Arch logo
- [ ] All effects disabled under `prefers-reduced-motion: reduce`
