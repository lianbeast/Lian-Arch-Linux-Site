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

/**
 * Read position through the document, for the hairline progress bar.
 *
 * Deliberately self-contained. This value changes every frame, so it must never
 * live in a component that renders the rest of the page — a scroll listener at
 * the root would reconcile the whole tree sixty times a second to move a 2px
 * bar. The bar is written straight to the DOM instead of through state, because
 * a 60Hz value is not something React should be scheduling renders for.
 *
 * scrollHeight is read ONCE on mount and refreshed ONLY on resize (via ResizeObserver).
 * The scroll handler only reads scrollY (cheap, no layout flush) and uses the
 * cached max. This avoids the classic layout-thrashing anti-pattern.
 */
function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0
    let max = 0

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight
    }

    const draw = () => {
      frame = 0
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bar.style.transform = `scaleX(${p})`
    }

    // Coalesce bursts of scroll events into one write per frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    // The document grows as sections reveal and as results arrive, so the
    // divisor has to be re-measured — but ONLY on resize, not every frame.
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { measure(); schedule() })
      : null
    ro?.observe(document.body)

    const onResize = () => { measure(); schedule() }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    measure()
    draw()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="progress" aria-hidden="true">
      <div className="progress-bar" ref={barRef} />
    </div>
  )
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
  useReveal()

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* Fixed behind everything, at z-index 0. `main`, `.nav`, `.foot` and the
          fixed controls all sit above it. */}
      <Backdrop />

      <ScrollProgress />

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
