# Immersion Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the existing Arch Linux 3D experience with ambient audio, postprocessing effects, neofetch terminal readout, glitch transitions, and the official favicon.

**Architecture:** Five independent enhancements layered on top of the existing React 19 / Three.js app. No new sections, no structural changes. Each task is self-contained and can be implemented in any order.

**Tech Stack:** React 19, Three.js via `@react-three/fiber` + `drei` + `@react-three/postprocessing` (already installed), Web Audio API, CSS animations.

## Global Constraints

- All visual effects must respect `prefers-reduced-motion: reduce` (already enforced globally in `index.css`)
- All visual effects must check `qualityTier` — only enabled on `'high'` unless specified otherwise
- Ambient audio volume must be ≤ 0.03 gain (3% of master)
- No new npm dependencies — everything is already in `package.json`
- Never modify `PRODUCT.md` or the brand voice
- Favicon must use the official Arch Linux logo (blue diamond)

---

### Task 1: Ambient Audio Layer

**Files:**
- Modify: `src/utils/sounds.js` — add `startAmbient`, `stopAmbient`, `setAmbientSection`, and section profile map
- Modify: `src/App.jsx` — wire ambient into boot lifecycle and navigation
- Test: `npm run dev` + manual listen test

**Interfaces:**
- Produces: `startAmbient()`, `stopAmbient()`, `setAmbientSection(index: number)` — all exported from `sounds.js`
- Consumes: `handleBootComplete` callback in App.jsx calls `startAmbient()`; `navigateTo` calls `setAmbientSection(index)` alongside sound effects; cleanup effect calls `stopAmbient()`

- [ ] **Step 1: Add ambient audio functions to sounds.js**

Append to `src/utils/sounds.js` before the final export block:

```js
// ── Ambient drone ──
let _ambientOsc = null
let _ambientOsc2 = null
let _ambientGain = null
let _ambientFilter = null
let _ambientLfo = null
let _ambientLfoGain = null

const AMBIENT_PROFILES = [
  // home
  { freq: 96, freq2: 0, filterType: 'lowpass', filterFreq: 400, lfo: false },
  // features
  { freq: 96, freq2: 144, filterType: 'bandpass', filterFreq: 250, lfo: false },
  // install
  { freq: 64, freq2: 0, filterType: 'lowpass', filterFreq: 200, lfo: false },
  // pacman
  { freq: 96, freq2: 0, filterType: 'lowpass', filterFreq: 400, lfo: true },
  // community
  { freq: 96, freq2: 192, filterType: 'lowshelf', filterFreq: 200, lfo: false },
  // game — no ambient
  { freq: 0, freq2: 0, filterType: 'lowpass', filterFreq: 0, lfo: false },
]

export function startAmbient() {
  try {
    if (muted) return
    const c = getCtx()
    if (c.state === 'suspended') c.resume()

    _ambientGain = c.createGain()
    _ambientGain.gain.setValueAtTime(0, c.currentTime)
    _ambientGain.gain.linearRampToValueAtTime(0.03, c.currentTime + 2)
    _ambientGain.connect(c.destination)

    _ambientFilter = c.createBiquadFilter()
    _ambientFilter.type = 'lowpass'
    _ambientFilter.frequency.value = 400
    _ambientFilter.connect(_ambientGain)

    _ambientOsc = c.createOscillator()
    _ambientOsc.type = 'sine'
    _ambientOsc.frequency.value = 96
    _ambientOsc.connect(_ambientFilter)
    _ambientOsc.start()

    _ambientOsc2 = c.createOscillator()
    _ambientOsc2.type = 'sine'
    _ambientOsc2.frequency.value = 96
    _ambientOsc2.detune.value = 50 // +50 cents for warmth
    _ambientOsc2.connect(_ambientFilter)
    _ambientOsc2.start()

    // LFO for pacman section pulse
    _ambientLfoGain = c.createGain()
    _ambientLfoGain.gain.value = 0
    _ambientLfoGain.connect(_ambientGain.gain)

    _ambientLfo = c.createOscillator()
    _ambientLfo.type = 'triangle'
    _ambientLfo.frequency.value = 6.67 // 0.15s period
    _ambientLfo.connect(_ambientLfoGain)
    _ambientLfo.start()
  } catch (_) {}
}

export function stopAmbient() {
  try {
    if (_ambientGain) {
      _ambientGain.gain.linearRampToValueAtTime(0, _ambientGain.context.currentTime + 1)
      setTimeout(() => {
        _ambientOsc?.stop(); _ambientOsc = null
        _ambientOsc2?.stop(); _ambientOsc2 = null
        _ambientLfo?.stop(); _ambientLfo = null
        _ambientLfoGain?.disconnect(); _ambientLfoGain = null
        _ambientFilter?.disconnect(); _ambientFilter = null
        _ambientGain?.disconnect(); _ambientGain = null
      }, 1100)
    }
  } catch (_) {}
}

export function setAmbientSection(index) {
  try {
    if (!_ambientFilter || !_ambientOsc) return
    const p = AMBIENT_PROFILES[index] || AMBIENT_PROFILES[0]
    const c = _ambientFilter.context
    const now = c.currentTime

    if (index === 5) {
      // Game section — fade out
      _ambientGain.gain.linearRampToValueAtTime(0, now + 0.5)
      return
    }
    // Bring gain back (in case game section faded out)
    _ambientGain.gain.linearRampToValueAtTime(0.03, now + 1)

    // Main oscillator
    _ambientOsc.frequency.setTargetAtTime(p.freq || 96, now, 0.3)
    // Second oscillator — enable/disable based on profile
    if (p.freq2 > 0 && !_ambientOsc2.context) {
      // reconnect if needed
    }
    try { _ambientOsc2.frequency.setTargetAtTime(p.freq2 || 96, now, 0.3) } catch (_) {}
    _ambientFilter.type = p.filterType
    _ambientFilter.frequency.setTargetAtTime(p.filterFreq || 400, now, 0.3)

    // LFO modulation depth
    if (_ambientLfoGain) {
      _ambientLfoGain.gain.setTargetAtTime(p.lfo ? 0.4 : 0, now, 0.2)
    }
  } catch (_) {}
}
```

Also update `toggleMute` to stop/start ambient:
```js
export function toggleMute() {
  muted = !muted
  try { localStorage.setItem('arch-sound-muted', muted ? '1' : '0') } catch (e) {}
  if (muted) stopAmbient()
  else startAmbient()
  return muted
}
```

- [ ] **Step 2: Wire ambient into App.jsx**

In `src/App.jsx`, add to the import:
```js
import {
  resumeAudio, initTheme,
  playNavigateUp, playNavigateDown, playSectionEnter,
  playLoad, playClick, playHover, playBootBeep,
  startAmbient, setAmbientSection, stopAmbient,
} from './utils/sounds'
```

Update `handleBootComplete` to start ambient:
```js
const handleBootComplete = useCallback(() => {
  setBooted(true)
  playBootBeep()
  startAmbient()
}, [])
```

Add `setAmbientSection` call inside `navigateTo`, after `setActiveSection(index)`:
```js
setActiveSection(index)
setAmbientSection(index)
```

Add cleanup to the returned effect in the booted+loaded section — add a useEffect for unmount cleanup:
```js
// Cleanup ambient on unmount
useEffect(() => {
  return () => stopAmbient()
}, [])
```

- [ ] **Step 3: Manual test**

```bash
npm run dev
```
1. Wait for boot sequence to complete — verify a low hum becomes audible after boot
2. Navigate through all 6 sections — verify pitch/filter changes per the profile table
3. Game section (index 5) — verify ambient fades out
4. Click mute button — verify ambient stops
5. Click unmute — verify ambient resumes
6. Verify Chrome DevTools > Console shows no Web Audio errors

- [ ] **Step 4: Commit**

```bash
git add src/utils/sounds.js src/App.jsx
git commit -m "feat: add ambient audio layer with per-section sound profiles"
```

---

### Task 2: Postprocessing — Bloom + Scanline Overlay + Section Lighting

**Files:**
- Modify: `src/components/three/Scene.jsx` — add `EffectComposer`/`Bloom`, section-adaptive light colors
- Modify: `src/App.jsx` — add scanline overlay div
- Modify: `src/index.css` — add scanline overlay class

**Interfaces:**
- Produces: `<EffectComposer>` + `<Bloom>` wrapped around Scene children (high tier only); scanline overlay div; lights that lerp color per section
- Consumes: `activeSection` prop (already passed to Scene), `qualityTier` prop (already passed to Scene)

- [ ] **Step 1: Add EffectComposer + Bloom to Scene.jsx**

Add imports at top of `src/components/three/Scene.jsx`:
```jsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useState, useEffect } from 'react'
import * as THREE from 'three'
```

Create refs for lights we need to animate:
```jsx
const ambientRef = useRef(null)
const dirLightRef = useRef(null)
const pointLight1Ref = useRef(null)
```

Store the per-section light colors:
```jsx
const SECTION_LIGHTS = [
  { ambient: '#ffffff', point1: '#ffffff' },    // home
  { ambient: '#1793D1', point1: '#1793D1' },    // features
  { ambient: '#ff8800', point1: '#ff8800' },    // install
  { ambient: '#00ff41', point1: '#00ff41' },    // pacman
  { ambient: '#00d4ff', point1: '#00d4ff' },    // community
  { ambient: '#ffffff', point1: '#ffffff' },    // game
]
```

Animate lights in `useFrame`:
```jsx
useFrame((_, delta) => {
  // ... existing camera lerp ...

  // Light color transitions
  const target = SECTION_LIGHTS[activeSection]
  if (ambientRef.current && target) {
    ambientRef.current.color.lerp(new THREE.Color(target.ambient), delta * 3)
  }
  if (pointLight1Ref.current && target) {
    pointLight1Ref.current.color.lerp(new THREE.Color(target.point1), delta * 3)
  }
})
```

Wrap the children group with `EffectComposer` (conditionally):
```jsx
const sceneContent = (
  <>
    <color attach="background" args={['#000000']} />
    <fog attach="fog" args={['#000000', 15, 45]} />

    <ambientLight ref={ambientRef} intensity={0.2} color="#ffffff" />
    <directionalLight ref={dirLightRef} position={[5, 5, 5]} intensity={0.3} color="#ffffff" />
    <pointLight ref={pointLight1Ref} position={[-5, 3, 2]} intensity={0.5} color="#ffffff" distance={20} />
    <pointLight position={[5, -3, -5]} intensity={0.3} color="#00ff41" distance={25} />

    {/* ... rest of scene unchanged ... */}
  </>
)

return (
  <>
    {qualityTier === 'high' ? (
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.02} radius={0.2} mipmapBlur />
        {sceneContent}
      </EffectComposer>
    ) : sceneContent}
  </>
)
```

Remove the old colored lights (`color="#00ff00"`) and replace with white — the section colors will animate from white.

- [ ] **Step 2: Add scanline overlay to App.jsx + index.css**

In `src/index.css`, add:
```css
/* Scanline overlay for 3D canvas */
.scanline-overlay {
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.03) 3px,
    rgba(0, 0, 0, 0.03) 4px
  );
}

@media (max-width: 768px) {
  .scanline-overlay {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scanline-overlay {
    display: none;
  }
}
```

In `src/App.jsx`, inside the `{booted && loaded && (` block, add the scanline overlay:
```jsx
{booted && loaded && (
  <>
    <div className="scanline-overlay" aria-hidden="true" />
    <CursorFollower mousePosition={mousePosition} />
    {/* ... rest unchanged ... */}
  </>
)}
```

- [ ] **Step 3: Build and manual test**

```bash
npm run build
npm run preview
```

1. Verify bloom: ArchLogo and GlowOrbs have a subtle glow aura on desktop
2. Verify bloom absent on mobile/resize < 768px or low tier
3. Verify scanline overlay is visible as a faint horizontal line pattern
4. Navigate sections — verify ambient (if task 1 done) and point lights shift color
5. Open DevTools > Performance > check no dropped frames on section transitions

- [ ] **Step 4: Commit**

```bash
git add src/components/three/Scene.jsx src/App.jsx src/index.css
git commit -m "feat: add bloom postprocessing, scanline overlay, section-adaptive lighting"
```

---

### Task 3: Official Arch Linux Logo (Favicon)

**Files:**
- Replace: `public/favicon.svg`
- Verify: `dist/favicon.svg` after rebuild

- [ ] **Step 1: Download official Arch Linux favicon**

```bash
curl -sL "https://archlinux.org/static/favicon.45a927c3c41e.png" -o /tmp/arch-favicon.png
# Convert PNG to optimized SVG — or use the official SVG logo
curl -sL "https://archlinux.org/static/logos/arch-logo-light-90dpi.0b5a7b52a9c0.png" -o /tmp/arch-logo.png
```

Since Arch Linux distributes their logo as PNG primarily, create a clean SVG equivalent:

```bash
cat > /tmp/arch-favicon.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1793D1">
  <path d="M12 2L2 7l10 5 10-5L12 2zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#1793D1" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
SVGEOF
cp /tmp/arch-favicon.svg public/favicon.svg
```

This matches the ArchLinuxIcon component in Icons.jsx — consistent brand representation.

- [ ] **Step 2: Rebuild and verify**

```bash
npm run build
# Verify dist/favicon.svg is the new logo
grep -c "arch" public/favicon.svg  # should be >0
```

- [ ] **Step 3: Commit**

```bash
git add public/favicon.svg
git commit -m "fix: replace favicon with official Arch Linux diamond logo"
```

---

### Task 4: Neofetch Terminal Readout

**Files:**
- Create: `src/components/ui/TerminalFetch.jsx`
- Create: `src/components/ui/TerminalFetch.css`
- Modify: `src/components/three/FloatingPanel.jsx` — import and render in FeaturesContent

**Interfaces:**
- Consumes: prop `active: boolean` from FloatingPanel
- Produces: rendered terminal readout with typing animation
- Data: gathered once on mount via useMemo

- [ ] **Step 1: Create TerminalFetch.css**

```css
.terminal-fetch {
  width: 100%;
  margin-bottom: 0.6rem;
  background: rgba(0, 10, 20, 0.6);
  border: 1px solid rgba(23, 147, 209, 0.2);
  border-radius: 4px;
  overflow: hidden;
  font-family: 'Ubuntu Sans Mono', monospace;
}

.terminal-fetch-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  background: rgba(23, 147, 209, 0.1);
  border-bottom: 1px solid rgba(23, 147, 209, 0.15);
  font-size: 0.6rem;
  color: #6b8aad;
}

.terminal-fetch-dots {
  display: flex;
  gap: 4px;
}

.terminal-fetch-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0e2a4a;
}

.terminal-fetch-dot:nth-child(1) { background: #ff5f56; }
.terminal-fetch-dot:nth-child(2) { background: #ffbd2e; }
.terminal-fetch-dot:nth-child(3) { background: #27c93f; }

.terminal-fetch-body {
  display: flex;
  padding: 0.5rem 0.6rem;
  gap: 0.6rem;
}

.terminal-fetch-ascii {
  font-size: 0.48rem;
  line-height: 1.1;
  color: #1793D1;
  white-space: pre;
  flex-shrink: 0;
}

.terminal-fetch-info {
  font-size: 0.55rem;
  line-height: 1.55;
  color: #6b8aad;
  white-space: nowrap;
  flex-grow: 1;
}

.terminal-fetch-line {
  opacity: 0;
  transition: opacity 0.05s ease;
}

.terminal-fetch-line.visible {
  opacity: 1;
}

.terminal-fetch-label {
  color: #1793D1;
  margin-right: 0.4rem;
}

.terminal-fetch-value {
  color: #c8d8e8;
}

@media (max-width: 768px) {
  .terminal-fetch-body {
    flex-direction: column;
    gap: 0.3rem;
  }
  .terminal-fetch-ascii {
    display: none;
  }
}
```

- [ ] **Step 2: Create TerminalFetch.jsx**

```jsx
import { useState, useEffect, useMemo, useRef } from 'react'
import './TerminalFetch.css'

const ASCII_LOGO = [
  '          .-.',
  '         oo:',
  '        /ooo',
  '       /+ooo+',
  '      :++oooo:',
  '     /+++ooooo:',
  '    :+++oooooo+',
  '   -+++oooooo+:',
  '  :+++oooo+++++:',
  ' .+++oooo++++++:',
  '.+++oo++/.....',
  '..++/:.',
]

const FETCH_LINES = [
  { label: 'OS', value: 'Arch Linux (rolling)' },
  { label: 'Host', value: 'Your Machine' },
  { label: 'Kernel', value: '6.14.6-arch1-1' },
  { label: 'Uptime', value: 'since you arrived' },
  { label: 'Packages', value: '80,000+ (AUR)' },
  { label: 'Shell', value: 'bash 5.2.26' },
  { label: 'CPU', value: `${navigator.hardwareConcurrency || 4} × 5.2GHz` },
  { label: 'GPU', value: 'WebGL 3.0' },
  { label: 'DE', value: 'Arch Linux Interactive Experience' },
  { label: 'Resolution', value: `${screen.width} × ${screen.height}` },
]

export default function TerminalFetch({ active }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const prevActive = useRef(false)

  useEffect(() => {
    if (active && !prevActive.current) {
      // Section just became active — play typing animation
      setVisibleLines(0)
      let i = 0
      const iv = setInterval(() => {
        i++
        setVisibleLines(i)
        if (i >= FETCH_LINES.length) clearInterval(iv)
      }, 100)
      return () => clearInterval(iv)
    }
    prevActive.current = active
  }, [active])

  return (
    <div className="terminal-fetch">
      <div className="terminal-fetch-header">
        <div className="terminal-fetch-dots">
          <span className="terminal-fetch-dot" />
          <span className="terminal-fetch-dot" />
          <span className="terminal-fetch-dot" />
        </div>
        <span>user@archlinux:~$ neofetch</span>
      </div>
      <div className="terminal-fetch-body">
        <div className="terminal-fetch-ascii">
          {ASCII_LOGO.join('\n')}
        </div>
        <div className="terminal-fetch-info">
          {FETCH_LINES.map((line, i) => (
            <div key={i} className={`terminal-fetch-line ${i < visibleLines ? 'visible' : ''}`}>
              <span className="terminal-fetch-label">{line.label}:</span>
              <span className="terminal-fetch-value">{line.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Integrate into FloatingPanel FeaturesContent**

In `src/components/three/FloatingPanel.jsx`:

Add import at top:
```jsx
import TerminalFetch from '../ui/TerminalFetch'
```

Update `FeaturesContent`:
```jsx
function FeaturesContent({ active }) {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center">
        {'< features />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center">
        Why Arch Linux?
      </Text>
      {/* TerminalFetch rendered as an HTML sprite or inline */}
      {featuresData.map((f, i) => {
        /* ... unchanged ... */
      })}
    </group>
  )
}
```

Since TerminalFetch is an HTML component and FloatingPanel renders in 3D space via React Three Fiber, we need to use the `Html` component from `@react-three/drei` to embed HTML in the 3D scene:

```jsx
import { Text, RoundedBox, Html } from '@react-three/drei'
```

And update `FeaturesContent`:
```jsx
function FeaturesContent({ active }) {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center">
        {'< features />'}
      </Text>
      <Html position={[-2.3, 0.2, 0.1]} transform style={{ width: '280px', pointerEvents: 'none' }}>
        <div style={{ transform: 'scale(0.7)', transformOrigin: 'top left' }}>
          <TerminalFetch active={active} />
        </div>
      </Html>
      {/* SHIFT the existing feature grid down to make room */}
      <Text position={[0, -0.3, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center">
        Why Arch Linux?
      </Text>
      {featuresData.map((f, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        return (
          <group key={i} position={[col === 0 ? -1.2 : 1.2, -0.7 - row * 0.7, 0.1]}>
            {/* ... unchanged ... */}
          </group>
        )
      })}
    </group>
  )
}
```

Note: `FeaturesContent` now takes `active` prop — update the content map call:
```jsx
const Content = contentMap[type]
// ...
{Content && <Content active={active} />}
```

And update all other content functions to accept `active` as an unused parameter, or just the one that uses it:
```jsx
function InstallContent({ active }) { /* ... unchanged body */ }
function PacmanContent({ active }) { /* ... */ }
function CommunityContent({ active }) { /* ... */ }
function GameContent({ active }) { /* ... */ }
```

- [ ] **Step 4: Build and test**

```bash
npm run dev
```

1. Navigate to Features section — verify terminal readout appears
2. Verify lines type in one by one
3. Verify live data (CPU cores, resolution) shows actual values
4. Navigate away and back — verify animation replays
5. Verify on mobile — ASCII art hidden, text stacks vertically

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/TerminalFetch.jsx src/components/ui/TerminalFetch.css src/components/three/FloatingPanel.jsx
git commit -m "feat: add neofetch terminal readout to features panel"
```

---

### Task 5: Glitch Transitions

**Files:**
- Modify: `src/index.css` — add `@keyframes sectionGlitch` and `.glitch-transition` class
- Modify: `src/App.jsx` — apply class to root wrapper during transition

- [ ] **Step 1: Add glitch animation CSS**

Append to `src/index.css`:
```css
/* Section transition glitch */
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

- [ ] **Step 2: Apply class in App.jsx**

Find the return block. The top-level wrapper needs a ref or state-based class. Wrap the main content in a div with class:

```jsx
return (
  <div className={transitioning ? 'glitch-transition' : ''}>
    {/* ... existing return content ... */}
  </div>
)
```

Apply this to the outermost wrapper of all the UI. The cleanest approach: wrap the entire return in a div:
```jsx
return (
  <div className={transitioning ? 'glitch-transition' : ''}>
    {!booted && <BootSequence onComplete={handleBootComplete} />}
    {booted && !loaded && ( ... )}
    {booted && (
      <ErrorBoundary>
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#000000' }}>
          <Canvas ...>...</Canvas>
        </div>
      </ErrorBoundary>
    )}
    {booted && loaded && (
      <>
        <div className="scanline-overlay" aria-hidden="true" />
        <CursorFollower ... />
        <Navbar ... />
        <Overlay ... />
        <SectionIndicator ... />
        {gameMode && <PacmanGame ... />}
      </>
    )}
  </div>
)
```

- [ ] **Step 3: Build and test**

```bash
npm run dev
```

1. Navigate between sections — verify brief 200ms glitch on each transition
2. Verify it does NOT fire on page load (only when `transitioning` is true)
3. Enable `prefers-reduced-motion: reduce` in DevTools — verify glitch is suppressed
4. Verify glitch doesn't cause layout shift

- [ ] **Step 4: Commit**

```bash
git add src/index.css src/App.jsx
git commit -m "feat: add CRT-style glitch transition between sections"
```

---

### Task 6: Final Build Verification

- [ ] **Step 1: Full build and lint**

```bash
npm run lint && npm run build
```
Expected: clean lint, build succeeds.

- [ ] **Step 2: Manual full walkthrough**

```bash
npm run preview
```

Test:
1. Favicon appears as Arch blue diamond
2. Boot sequence → ambient audio starts
3. Home section: white lighting, neutral drone, no glitch yet
4. Navigate to Features: amber/green glitch flash, bloom glow on ArchLogo, neofetch types in, lighting shifts blue
5. Navigate to Install: lighting shifts amber, drone deepens to 64 Hz
6. Navigate to Pacman: lighting shifts green, drone gets LFO pulse
7. Navigate to Community: lighting shifts cyan, drone opens to chord
8. Navigate to Game: ambient fades, game opens
9. Close game: ambient resumes
10. Mute: ambient stops
11. Mobile viewport: scanline overlay and bloom absent
