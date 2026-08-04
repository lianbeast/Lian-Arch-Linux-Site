const AudioCtx = window.AudioContext || window.webkitAudioContext
let ctx = null
let currentTheme = 'hacker'
let muted = false

const THEMES = ['hacker', 'retro', 'minimal']

// ponytail: export getCtx so PacmanGame shares singleton instead of leaking new AudioContexts
export function getCtx() {
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

// ── Ambient Drone ──
let droneOsc = null
let droneGain = null
let droneFilter = null
let droneActive = false
let currentDroneName = 'home'

// Per-section drone profiles: pitch (Hz), filter freq (Hz), filter type, gain
const DRONE_PROFILES = {
  home:      { freq: 55,   filterFreq: 200,  filterType: 'lowpass', gain: 0.02 },
  features:  { freq: 82.5, filterFreq: 300,  filterType: 'lowpass', gain: 0.025 },
  install:   { freq: 110,  filterFreq: 500,  filterType: 'bandpass', gain: 0.03 },
  pacman:    { freq: 165,  filterFreq: 800,  filterType: 'bandpass', gain: 0.035 },
  community: { freq: 110,  filterFreq: 400,  filterType: 'lowpass', gain: 0.025 },
  game:      { freq: 220,  filterFreq: 1200, filterType: 'bandpass', gain: 0.04 },
}

export function resumeAudio() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
}

export function startDrone(name = 'home') {
  if (muted) return
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  if (droneActive) return

  const prof = DRONE_PROFILES[name] || DRONE_PROFILES.home

  droneGain = c.createGain()
  droneGain.gain.value = 0
  droneGain.gain.linearRampToValueAtTime(prof.gain, c.currentTime + 2)
  droneGain.connect(c.destination)

  droneFilter = c.createBiquadFilter()
  droneFilter.type = prof.filterType
  droneFilter.frequency.value = prof.filterFreq
  droneFilter.Q.value = prof.filterType === 'bandpass' ? 2 : 1
  droneFilter.connect(droneGain)

  droneOsc = c.createOscillator()
  droneOsc.type = 'sawtooth'
  droneOsc.frequency.value = prof.freq
  droneOsc.connect(droneFilter)
  droneOsc.start()

  droneActive = true
  currentDroneName = name
}

export function stopDrone() {
  if (!droneActive) return
  if (droneGain) {
    droneGain.gain.linearRampToValueAtTime(0, droneGain.context.currentTime + 1)
    setTimeout(() => {
      if (droneOsc) { droneOsc.stop(); droneOsc.disconnect(); droneOsc = null }
      if (droneFilter) { droneFilter.disconnect(); droneFilter = null }
      if (droneGain) { droneGain.disconnect(); droneGain = null }
      droneActive = false
    }, 1100)
  }
}

export function setDroneProfile(name) {
  if (!droneActive || !droneOsc || !droneFilter || !droneGain) return
  if (name === currentDroneName) return

  const prof = DRONE_PROFILES[name] || DRONE_PROFILES.home
  const c = getCtx()
  const now = c.currentTime

  droneOsc.frequency.exponentialRampToValueAtTime(prof.freq, now + 0.5)
  droneFilter.frequency.exponentialRampToValueAtTime(prof.filterFreq, now + 0.5)
  droneFilter.type = prof.filterType
  droneFilter.Q.value = prof.filterType === 'bandpass' ? 2 : 1
  droneGain.gain.exponentialRampToValueAtTime(prof.gain, now + 0.5)

  currentDroneName = name
}

export function isMuted() {
  return muted
}

export function toggleMute() {
  muted = !muted
  try { localStorage.setItem('arch-sound-muted', muted ? '1' : '0') } catch { /* ignore */ }
  if (muted) stopDrone()
  else startDrone(currentDroneName)
  return muted
}

export function setMuted(val) {
  muted = val
  try { localStorage.setItem('arch-sound-muted', muted ? '1' : '0') } catch { /* ignore */ }
}

export function getTheme() {
  return currentTheme
}

export function setTheme(t) {
  currentTheme = t
  try { localStorage.setItem('arch-sound-theme', t) } catch { /* ignore */ }
}

export function cycleTheme() {
  const idx = (THEMES.indexOf(currentTheme) + 1) % THEMES.length
  setTheme(THEMES[idx])
  return currentTheme
}

export function initTheme() {
  try {
    const saved = localStorage.getItem('arch-sound-theme')
    if (saved && THEMES.includes(saved)) currentTheme = saved
  } catch { /* ignore */ }
  try {
    const mutedSaved = localStorage.getItem('arch-sound-muted')
    if (mutedSaved === '1') muted = true
  } catch { /* ignore */ }
}

// Guard used internally by all play* exports
function guard() {
  if (muted) return true // skip
  const c = getCtx()
  if (c.state === 'suspended') return true // skip silently
  return false
}

// --- Low-level tone ---
function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch { /* ignore */ }
}

// Noise burst for click/mechanical sounds
function playNoise(duration, volume = 0.08) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') return
    const bufSize = c.sampleRate * duration
    const buf = c.createBuffer(1, bufSize, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const src = c.createBufferSource()
    src.buffer = buf
    const gain = c.createGain()
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    const filter = c.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 3000
    src.connect(filter)
    filter.connect(gain)
    gain.connect(c.destination)
    src.start(c.currentTime)
  } catch { /* ignore */ }
}

// Sweep (for boot beep)
function playSweep(startFreq, endFreq, duration, type = 'sine', volume = 0.15) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') return
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(startFreq, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + duration)
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch { /* ignore */ }
}

// --- Theme: Hacker ---
const hacker = {
  bootBeep() {
    playSweep(120, 40, 0.3, 'sawtooth', 0.12)
    setTimeout(() => playNoise(0.15, 0.06), 200)
  },
  typingKey() {
    playNoise(0.025, 0.04)
  },
  navigateUp() {
    playTone(880, 0.12, 'sine', 0.2)
    setTimeout(() => playTone(1100, 0.08, 'sine', 0.15), 40)
  },
  navigateDown() {
    playTone(660, 0.12, 'sine', 0.2)
    setTimeout(() => playTone(440, 0.08, 'sine', 0.15), 40)
  },
  click() {
    playTone(1200, 0.06, 'square', 0.12)
    playNoise(0.03, 0.05)
  },
  hover() {
    playTone(1000, 0.04, 'sine', 0.08)
  },
  sectionEnter() {
    playSweep(200, 800, 0.3, 'sine', 0.1)
    setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 150)
    setTimeout(() => playTone(900, 0.15, 'sine', 0.06), 300)
  },
  loadComplete() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.12), i * 100))
  },
  themeSwitch() {
    playTone(440, 0.08, 'square', 0.1)
    setTimeout(() => playTone(880, 0.08, 'square', 0.1), 60)
  },
}

// --- Theme: Retro ---
const retro = {
  bootBeep() {
    playTone(440, 0.1, 'square', 0.15)
    setTimeout(() => playTone(880, 0.1, 'square', 0.12), 120)
    setTimeout(() => playTone(1320, 0.15, 'square', 0.1), 240)
  },
  typingKey() {
    playTone(800 + Math.random() * 400, 0.02, 'square', 0.03)
  },
  navigateUp() {
    const notes = [440, 554, 659]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.08, 'square', 0.12), i * 50))
  },
  navigateDown() {
    const notes = [659, 554, 440]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.08, 'square', 0.12), i * 50))
  },
  click() {
    playTone(988, 0.06, 'square', 0.12)
    setTimeout(() => playTone(1319, 0.08, 'square', 0.1), 40)
  },
  hover() {
    playTone(1200, 0.03, 'square', 0.05)
  },
  sectionEnter() {
    const notes = [523, 659, 784, 1047, 1319]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.1, 'square', 0.1), i * 60))
  },
  loadComplete() {
    const notes = [262, 330, 392, 523, 659, 784]
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.12, 'triangle', 0.12), i * 80))
  },
  themeSwitch() {
    playTone(660, 0.06, 'triangle', 0.1)
    setTimeout(() => playTone(990, 0.06, 'triangle', 0.1), 50)
    setTimeout(() => playTone(1320, 0.1, 'triangle', 0.08), 100)
  },
}

// --- Theme: Minimal ---
const minimal = {
  bootBeep() {
    playTone(440, 0.15, 'sine', 0.1)
  },
  typingKey() {},
  navigateUp() {
    playTone(660, 0.1, 'sine', 0.1)
  },
  navigateDown() {
    playTone(440, 0.1, 'sine', 0.1)
  },
  click() {
    playTone(880, 0.05, 'sine', 0.08)
  },
  hover() {},
  sectionEnter() {
    playTone(523, 0.2, 'sine', 0.08)
  },
  loadComplete() {
    playTone(523, 0.3, 'sine', 0.1)
  },
  themeSwitch() {
    playTone(440, 0.1, 'sine', 0.08)
    setTimeout(() => playTone(660, 0.1, 'sine', 0.08), 80)
  },
}

const themeMap = { hacker, retro, minimal }

function current() {
  return themeMap[currentTheme] || hacker
}

export function playBootBeep() { if (guard()) return; current().bootBeep() }
export function playTypingKey() { if (guard()) return; current().typingKey() }
export function playNavigateUp() { if (guard()) return; current().navigateUp() }
export function playNavigateDown() { if (guard()) return; current().navigateDown() }
export function playClick() { if (guard()) return; current().click() }
export function playHover() { if (guard()) return; current().hover() }
export function playSectionEnter() { if (guard()) return; current().sectionEnter() }
export function playLoad() { if (guard()) return; current().loadComplete() }
export function playThemeSwitch() { if (guard()) return; current().themeSwitch() }
