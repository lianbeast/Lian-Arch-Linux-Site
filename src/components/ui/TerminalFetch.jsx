import { useState, useEffect } from 'react'
import './TerminalFetch.css'

const ASCII_LOGO = [
  '          .-.',
  '         oo:',
  '        /ooo',
  '       /+ooo+',
  '      :++oooo:',
  '     /+++ooooo:',
  '    :+++oooooo+',
  '   -+++oooooo+',
  '  :+++oooo+++++:',
  ' .+++oooo++++++:',
  '.+++oo++/.....',
  '..++/:.',
]

const LINES = [
  { label: 'OS', value: 'Arch Linux (rolling)' },
  { label: 'Host', value: navigator.platform || 'x86_64' },
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
  const [visibleCount, setVisibleCount] = useState(0)
  const [prevActive, setPrevActive] = useState(active)

  // Reset when the section becomes active again (adjust state during render, per React docs)
  if (active !== prevActive) {
    setPrevActive(active)
    setVisibleCount(0)
  }

  // Replay the reveal animation whenever this section becomes active again
  useEffect(() => {
    if (!active) return
    let i = 0
    const iv = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= LINES.length) clearInterval(iv)
    }, 100)
    return () => clearInterval(iv)
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
          {LINES.map((line, i) => (
            <div key={i} className={`terminal-fetch-line ${i < visibleCount ? 'visible' : ''}`}>
              <span className="terminal-fetch-label">{line.label}:</span>
              <span className="terminal-fetch-value">{line.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
