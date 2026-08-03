import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/three/Scene'
import Overlay from './components/ui/Overlay'
import Navbar from './components/ui/Navbar'
import SectionIndicator from './components/ui/SectionIndicator'
import BootSequence from './components/ui/BootSequence'
import CursorFollower from './components/ui/CursorFollower'
const PacmanGame = lazy(() => import('./components/games/PacmanGame'))
import {
  resumeAudio, initTheme,
  playNavigateUp, playNavigateDown, playSectionEnter,
  playLoad, playBootBeep,
  startDrone, setDroneProfile,
} from './utils/sounds'
import { SECTIONS as sections } from './utils/constants'

function getSectionFromHash() {
  const hash = window.location.hash.replace('#', '')
  const idx = sections.indexOf(hash)
  return idx >= 0 ? idx : 0
}

function getQualityTier() {
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return 'low'
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return 'low'
  if (window.matchMedia('(pointer: coarse)').matches) return 'medium'
  if (window.innerWidth < 480) return 'medium'
  return 'high'
}

// React error boundary — class component (catches render-phase errors only)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error.message || 'Unknown render error'
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#000000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#00ff00', fontFamily: 'monospace', padding: 20, textAlign: 'center'
        }}>
          <div>
            <p style={{ fontSize: 24, marginBottom: 16 }}>MATRIX ERROR</p>
            <p style={{ color: '#006600', fontSize: 14 }}>{msg}</p>
            <p style={{ color: '#006600', fontSize: 12, marginTop: 16 }}>
              System compromised. Reboot required.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// WebGL support check — called once before rendering 3D
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
    return !!gl
  } catch { return false }
}

// Adaptive DPR: cap at 1.5× on high-DPI desktop, 1.0× on mobile/low-end
function getAdaptiveDpr() {
  const dpr = window.devicePixelRatio || 1
  if (window.matchMedia('(pointer: coarse)').matches) return Math.min(dpr, 1.2)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return Math.min(dpr, 1.0)
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return Math.min(dpr, 1.0)
  return Math.min(dpr, 1.5)
}

export default function App() {
  const [booted, setBooted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const webglAvailable = useMemo(() => hasWebGL(), [])
  const [activeSection, setActiveSection] = useState(() => getSectionFromHash())
  const [transitioning, setTransitioning] = useState(false)
  const [visible, setVisible] = useState(true)
  const [gameMode, setGameMode] = useState(false)
  const dpr = useMemo(() => getAdaptiveDpr(), [])
  const qualityTier = useMemo(() => getQualityTier(), [])

  useEffect(() => { initTheme() }, [])

  // Per-section document title
  useEffect(() => {
    const name = sections[activeSection]
    document.title = name === 'home'
      ? 'Arch Linux — Interactive 3D Experience'
      : `${name[0].toUpperCase()}${name.slice(1)} — Arch Linux`
  }, [activeSection])

  // Listen for URL hash changes → section navigation
  useEffect(() => {
    const onHashChange = () => {
      const idx = getSectionFromHash()
      if (idx !== activeSection && !transitioning) {
        setTransitioning(true)
        setActiveSection(idx)
        setTimeout(() => setTransitioning(false), 800)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [activeSection, transitioning])

  // Track visibility for performance (skip expensive work when hidden, but keep frame loop alive)
  useEffect(() => {
    const handleVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const navigateTo = useCallback((index) => {
    if (index >= 0 && index < sections.length && !transitioning) {
      setTransitioning(true)
      if (index > activeSection) playNavigateDown()
      else if (index < activeSection) playNavigateUp()
      else playSectionEnter()
      setActiveSection(index)
      setDroneProfile(sections[index])
      // Update URL hash without triggering hashchange listener (use replace)
      window.location.replace(`#${sections[index]}`)
      setTimeout(() => setTransitioning(false), 800)
    }
  }, [transitioning, activeSection])

  const handleLaunchGame = useCallback(() => setGameMode(true), [])
  const handleCloseGame = useCallback(() => setGameMode(false), [])

  const handleBootComplete = useCallback(() => {
    setBooted(true)
    playBootBeep()
    startDrone('home')
  }, [])

  useEffect(() => {
    if (!booted || loaded) return
    const t = setTimeout(() => { setLoaded(true); playLoad() }, 1500)
    return () => clearTimeout(t)
  }, [booted, loaded])

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      resumeAudio()
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
    window.addEventListener('click', unlock)
    window.addEventListener('touchstart', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  // Keyboard navigation — paused during game mode
  useEffect(() => {
    const handleKey = (e) => {
      if (gameMode || transitioning || !booted) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); navigateTo(activeSection + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); navigateTo(activeSection - 1)
      } else if (e.key === 'Escape') {
        navigateTo(0)
      } else if (e.key >= '1' && e.key <= '6') {
        navigateTo(parseInt(e.key) - 1)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeSection, transitioning, booted, navigateTo, gameMode])

  // Scroll navigation — paused during game mode
  useEffect(() => {
    let lastScroll = 0
    const handleWheel = (e) => {
      const now = Date.now()
      if (now - lastScroll < 1000 || gameMode || transitioning || !booted) return
      lastScroll = now
      if (e.deltaY > 30) navigateTo(activeSection + 1)
      else if (e.deltaY < -30) navigateTo(activeSection - 1)
    }
    let touchStartY = 0
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const handleTouchEnd = (e) => {
      if (gameMode || transitioning || !booted) return
      const diff = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(diff) > 50) navigateTo(activeSection + (diff > 0 ? 1 : -1))
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [activeSection, transitioning, booted, navigateTo, gameMode])

  return (
    <div className={transitioning ? 'glitch-transition' : ''}>
      {!booted && <BootSequence onComplete={handleBootComplete} />}
      {booted && !webglAvailable && (
        <>
        <div style={{
          position: 'fixed', inset: 0, background: '#050a12', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Ubuntu Sans Mono', monospace", padding: 20,
        }}>
          <div style={{ maxWidth: 500, textAlign: 'center' }}>
            <p style={{ color: '#1793D1', fontSize: 14, marginBottom: 16 }}>
              WebGL not available
            </p>
            <p style={{ color: '#6b8aad', fontSize: 12, lineHeight: 1.7 }}>
              This experience requires WebGL 3.0 support.<br />
              Try a modern browser like Firefox, Chrome, or Edge.
            </p>
          </div>
        </div>
        <Navbar activeSection={activeSection} onNavigate={navigateTo} />
        <Overlay activeSection={activeSection} onLaunchGame={handleLaunchGame} />
        <SectionIndicator activeSection={activeSection} onNavigate={navigateTo} />
        </>
      )}
      {booted && webglAvailable && !loaded && (
        <div className="init-loading">
          <span className="init-loading-text">INITIALIZING 3D ENVIRONMENT</span>
          <span className="init-loading-bar">
            <span className="init-loading-fill" />
          </span>
        </div>
      )}
      {booted && webglAvailable && (
        <ErrorBoundary>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#000000' }}>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 200 }}
              dpr={dpr}
              frameloop={visible ? 'always' : 'never'}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                failIfMajorPerformanceCaveat: false,
                stencil: false,
                depth: true,
              }}
              style={{ position: 'fixed', inset: 0, zIndex: 2, background: '#000000' }}
            >
              <Scene activeSection={activeSection} qualityTier={qualityTier} />
            </Canvas>
          </div>
        </ErrorBoundary>
      )}
      {booted && loaded && (
        <>
          <div className="scanline-overlay" aria-hidden="true" />
          <CursorFollower />
          <Navbar activeSection={activeSection} onNavigate={navigateTo} />
          <Overlay activeSection={activeSection} onLaunchGame={handleLaunchGame} />
          <SectionIndicator activeSection={activeSection} onNavigate={navigateTo} />
          {gameMode && (
            <Suspense fallback={<div className="game-loading">LOADING GAME…</div>}>
              <PacmanGame onClose={handleCloseGame} />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}