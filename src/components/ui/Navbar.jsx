import { useEffect, useRef, useState } from 'react'
import { NAV_LINKS } from '../../utils/constants'
import { ArchLinuxIcon } from './Icons'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'

export default function Navbar({ active }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)
  const reduced = usePrefersReducedMotion()

  /* Hide the bar scrolling down, bring it back scrolling up. */
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        if (y < 64) setHidden(false)
        else if (delta > 10) setHidden(true)
        else if (delta < -10) setHidden(false)
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Escape closes the mobile menu. */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* Crossing into the desktop breakpoint drops the mobile menu. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 821px)')
    const onChange = (e) => { if (e.matches) setOpen(false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
    })
    setOpen(false)
  }

  return (
    <nav className={`nav${hidden ? ' nav--hidden' : ''}`} aria-label="Main">
      <div className="nav-inner">
        <a className="nav-brand" href="#home" onClick={(e) => { e.preventDefault(); go('home') }}>
          <ArchLinuxIcon size={18} color="var(--brand)" />
          <span>arch</span>
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <ul id="nav-menu" className={`nav-links${open ? ' open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                className="nav-link"
                aria-current={active === link.id ? 'location' : undefined}
                onClick={() => go(link.id)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <a
          className="btn btn-solid nav-cta"
          href="#download"
          onClick={(e) => { e.preventDefault(); go('download') }}
        >
          Download
        </a>
      </div>
    </nav>
  )
}
