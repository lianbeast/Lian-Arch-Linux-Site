import { useEffect, useRef, useState } from 'react'
import { SECTIONS, NAV_LINKS } from './utils/constants'
import { ArchLinuxIcon } from './components/ui/Icons'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Backdrop from './components/ui/Backdrop'

import SpecHero from './components/sections/SpecHero'
import About from './components/sections/About'
import History from './components/sections/History'
import Features from './components/sections/Features'
import Terminal from './components/sections/Terminal'
import PackageSearch from './components/sections/PackageSearch'
import Download from './components/sections/Download'
import Architectures from './components/sections/Architectures'
import UseCases from './components/sections/UseCases'
import Faq from './components/sections/Faq'
import Community from './components/sections/Community'
import Footer from './components/sections/Footer'

const REDUCED_MOTION = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Reveal-on-scroll, as a progressive enhancement.
 *
 * If IntersectionObserver is missing, every element is revealed immediately.
 * Content that is invisible without JavaScript is a bug, not a design.
 */
function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger')

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('revealed'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

/** Highlights the nav item for whichever section currently owns the viewport. */
function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
    }, { threshold: 0.4, rootMargin: '-20% 0px -60% 0px' })

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return active
}

/** Read position through the document, for the hairline progress bar. */
function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
    }

    // Coalesce bursts of scroll events into one measurement per frame.
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { measure(); frame = 0 })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Deferred rather than called inline: a synchronous setState in an effect
    // body cascades a render on mount for no reason.
    frame = requestAnimationFrame(() => { measure(); frame = 0 })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return progress
}

function Navbar({ active }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

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
      behavior: REDUCED_MOTION ? 'auto' : 'smooth',
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
                aria-current={active === link.id ? 'true' : undefined}
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

/** Appears once the reader is deep enough that scrolling back is a chore. */
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0
    const measure = () => setVisible(window.scrollY > window.innerHeight * 1.5)
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { measure(); frame = 0 })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Deferred, not called inline: a synchronous setState in an effect body
    // cascades a render on mount for no reason.
    frame = requestAnimationFrame(() => { measure(); frame = 0 })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      className={`to-top${visible ? ' is-visible' : ''}`}
      // Hidden from assistive tech and out of the tab order while it is not
      // on screen — an invisible control that steals focus is a bug.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Back to top"
      onClick={() => window.scrollTo({
        top: 0,
        behavior: REDUCED_MOTION ? 'auto' : 'smooth',
      })}
    >
      ↑
    </button>
  )
}

export default function App() {
  const active = useActiveSection()
  const progress = useScrollProgress()
  useReveal()

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* Fixed behind everything, at z-index 0. `main`, `.nav`, `.foot` and the
          fixed controls all sit above it. */}
      <Backdrop />

      <div className="progress" aria-hidden="true">
        <div className="progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      <Navbar active={active} />
      <BackToTop />

      {/* One boundary per section: a single broken subtree degrades to a
          readable message instead of taking the whole page down with it. */}
      <main id="main-content">
        <ErrorBoundary><SpecHero /></ErrorBoundary>
        <ErrorBoundary><About /></ErrorBoundary>
        <ErrorBoundary><History /></ErrorBoundary>
        <ErrorBoundary><Features /></ErrorBoundary>
        <ErrorBoundary><Terminal /></ErrorBoundary>
        <ErrorBoundary><PackageSearch /></ErrorBoundary>
        <ErrorBoundary><Download /></ErrorBoundary>
        <ErrorBoundary><Architectures /></ErrorBoundary>
        <ErrorBoundary><UseCases /></ErrorBoundary>
        <ErrorBoundary><Faq /></ErrorBoundary>
        <ErrorBoundary><Community /></ErrorBoundary>
      </main>

      <ErrorBoundary><Footer /></ErrorBoundary>
    </>
  )
}
