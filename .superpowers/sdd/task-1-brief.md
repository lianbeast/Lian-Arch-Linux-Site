# Task 1: Ambient Audio Layer

**Files:**
- Modify: `src/utils/sounds.js` — add `startAmbient`, `stopAmbient`, `setAmbientSection`, and section profile map
- Modify: `src/App.jsx` — wire ambient into boot lifecycle and navigation

**Interfaces:**
- Produces: `startAmbient()`, `stopAmbient()`, `setAmbientSection(index: number)` — all exported from `sounds.js`
- Consumes: `handleBootComplete` callback in App.jsx calls `startAmbient()`; `navigateTo` calls `setAmbientSection(index)` alongside sound effects; cleanup effect calls `stopAmbient()`

## Per-Section Profiles

| Section | Index | Base Freq | Filter Type | Filter Freq | Additional |
|---------|-------|-----------|-------------|-------------|------------|
| Home | 0 | 96 Hz (sine) | lowpass | 400 Hz | — |
| Features | 1 | 96 Hz + 144 Hz (sum) | bandpass | 250 Hz | Second oscillator, detuned +50 cents for warmth |
| Install | 2 | 64 Hz | lowpass | 200 Hz | — |
| Pacman | 3 | 96 Hz | lowpass | 400 Hz | LFO on gain: 0.15s triangle wave, depth 30% |
| Community | 4 | 96 Hz + 192 Hz | lowshelf | 200 Hz | — |
| Game | 5 | — | — | — | Ambient stops during game |

## Ambient Audio API (in src/utils/sounds.js)

### Code to add to sounds.js

Append before the final export block:

```js
// ── Ambient drone ──
let _ambientOsc = null
let _ambientOsc2 = null
let _ambientGain = null
let _ambientFilter = null
let _ambientLfo = null
let _ambientLfoGain = null

const AMBIENT_PROFILES = [
  { freq: 96, freq2: 0, filterType: 'lowpass', filterFreq: 400, lfo: false },
  { freq: 96, freq2: 144, filterType: 'bandpass', filterFreq: 250, lfo: false },
  { freq: 64, freq2: 0, filterType: 'lowpass', filterFreq: 200, lfo: false },
  { freq: 96, freq2: 0, filterType: 'lowpass', filterFreq: 400, lfo: true },
  { freq: 96, freq2: 192, filterType: 'lowshelf', filterFreq: 200, lfo: false },
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
    _ambientOsc2.detune.value = 50
    _ambientOsc2.connect(_ambientFilter)
    _ambientOsc2.start()

    _ambientLfoGain = c.createGain()
    _ambientLfoGain.gain.value = 0
    _ambientLfoGain.connect(_ambientGain.gain)

    _ambientLfo = c.createOscillator()
    _ambientLfo.type = 'triangle'
    _ambientLfo.frequency.value = 6.67
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
      _ambientGain.gain.linearRampToValueAtTime(0, now + 0.5)
      return
    }
    _ambientGain.gain.linearRampToValueAtTime(0.03, now + 1)

    _ambientOsc.frequency.setTargetAtTime(p.freq || 96, now, 0.3)
    try { _ambientOsc2.frequency.setTargetAtTime(p.freq2 || 96, now, 0.3) } catch (_) {}
    _ambientFilter.type = p.filterType
    _ambientFilter.frequency.setTargetAtTime(p.filterFreq || 400, now, 0.3)

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

### Code to add to App.jsx

Add to import:
```js
import {
  resumeAudio, initTheme,
  playNavigateUp, playNavigateDown, playSectionEnter,
  playLoad, playClick, playHover, playBootBeep,
  startAmbient, setAmbientSection, stopAmbient,
} from './utils/sounds'
```

Update `handleBootComplete`:
```js
const handleBootComplete = useCallback(() => {
  setBooted(true)
  playBootBeep()
  startAmbient()
}, [])
```

Add `setAmbientSection(index)` inside `navigateTo`, after `setActiveSection(index)`.

Add cleanup effect:
```js
useEffect(() => {
  return () => stopAmbient()
}, [])
```

## Global Constraints

- Ambient audio volume must be ≤ 0.03 gain (3% of master)
- No new npm dependencies
