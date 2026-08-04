import { useState, useCallback, useEffect } from 'react'
import { playClick, playHover, playThemeSwitch, cycleTheme, getTheme, toggleMute, isMuted } from '../../utils/sounds'
import { ArchLinuxIcon, VolumeIcon } from './Icons'
import { SECTIONS as sections } from '../../utils/constants'
import './Navbar.css'
const themeLabels = { hacker: 'Hacker', retro: 'Retro', minimal: 'Minimal' }

function SectionLinks({ activeSection, onNavigate }) {
  return sections.map((s, i) => (
    <button
      key={s}
      className={`nav-link ${activeSection === i ? 'active' : ''}`}
      onClick={() => { playClick(); onNavigate(i) }}
      onMouseEnter={playHover}
    >
      {s}
    </button>
  ))
}

export default function Navbar({ activeSection, onNavigate }) {
  const [theme, setTheme] = useState(getTheme())
  const [muted, setMuted] = useState(isMuted())
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)

  const handleThemeCycle = () => {
    const next = cycleTheme()
    setTheme(next)
    playThemeSwitch()
  }

  const handleMuteToggle = () => {
    const now = toggleMute()
    setMuted(now)
    playClick()
  }

  const handleNavigate = useCallback((i) => {
    setMenuOpen(false)
    setMenuClosing(true)
    onNavigate(i)
    setTimeout(() => setMenuClosing(false), 500)
  }, [onNavigate])

  const closeMenu = useCallback(() => {
    playClick()
    setMenuOpen(false)
    setMenuClosing(true)
    setTimeout(() => setMenuClosing(false), 500)
  }, [])

  const toggleMenu = () => {
    playClick()
    if (menuOpen) {
      setMenuOpen(false)
      setMenuClosing(true)
      setTimeout(() => setMenuClosing(false), 500)
    } else {
      setMenuClosing(false)
      setMenuOpen(true)
    }
  }

  // Close menu when resizing above 480px (e.g. phone rotation to landscape)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 481px)')
    const handler = (e) => { if (e.matches) setMenuOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <nav className="nav-3d">
      <div className="nav-brand">
        <span className="nav-logo">
          <ArchLinuxIcon size={20} color="var(--blue)" />
        </span>
        <span className="nav-title">Arch Linux</span>
      </div>

      {/* Desktop/tablet nav links (hidden at ≤480px) */}
      <div className="nav-links">
        <SectionLinks activeSection={activeSection} onNavigate={onNavigate} />
        <button
          className={`nav-sound-btn ${muted ? 'muted' : ''}`}
          onClick={handleMuteToggle}
          onMouseEnter={playHover}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        >
          <VolumeIcon size={14} color="currentColor" />
        </button>
        <button
          className="nav-theme-btn"
          onClick={handleThemeCycle}
          onMouseEnter={playHover}
          title={`Sound theme: ${themeLabels[theme]}`}
          aria-label={`Change sound theme. Current: ${themeLabels[theme]}`}
        >
          <span className="theme-label">{themeLabels[theme]}</span>
        </button>
      </div>

      {/* Hamburger button (visible at ≤480px) */}
      <button
        className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="nav-mobile-menu"
      >
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
        <span className="nav-hamburger-line" />
      </button>

      {/* Mobile slide-down menu */}
      <div
        id="nav-mobile-menu"
        className={`nav-mobile-menu ${menuOpen ? 'open' : ''} ${menuClosing ? 'closing' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-mobile-menu-inner">
          <SectionLinks activeSection={activeSection} onNavigate={handleNavigate} />
          <div className="nav-mobile-controls">
            <button
              className={`nav-sound-btn ${muted ? 'muted' : ''}`}
              onClick={handleMuteToggle}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            >
              <VolumeIcon size={16} color="currentColor" />
            </button>
            <button
              className="nav-theme-btn"
              onClick={handleThemeCycle}
              title={`Sound theme: ${themeLabels[theme]}`}
              aria-label={`Change sound theme. Current: ${themeLabels[theme]}`}
            >
              <span className="theme-label">{themeLabels[theme]}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="nav-mobile-backdrop" onClick={closeMenu} />}
    </nav>
  )
}
