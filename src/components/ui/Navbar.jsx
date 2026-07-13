import { useState } from 'react'
import { playClick, playHover, playThemeSwitch, cycleTheme, getTheme, toggleMute, isMuted } from '../../utils/sounds'
import { ArchLinuxIcon, VolumeIcon } from './Icons'
import { SECTIONS as sections } from '../../utils/constants'
import './Navbar.css'
const themeLabels = { hacker: 'Hacker', retro: 'Retro', minimal: 'Minimal' }

export default function Navbar({ activeSection, onNavigate }) {
  const [theme, setTheme] = useState(getTheme())
  const [muted, setMuted] = useState(isMuted())

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

  return (
    <nav className="nav-3d">
      <div className="nav-brand">
        <span className="nav-logo">
          <ArchLinuxIcon size={20} color="var(--blue)" />
        </span>
        <span className="nav-title">Arch Linux</span>
      </div>
      <div className="nav-links">
        {sections.map((s, i) => (
          <button
            key={s}
            className={`nav-link ${activeSection === i ? 'active' : ''}`}
            onClick={() => { playClick(); onNavigate(i) }}
            onMouseEnter={playHover}
          >
            {s}
          </button>
        ))}
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
    </nav>
  )
}
