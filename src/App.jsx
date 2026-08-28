import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { SECTIONS, NAV_LINKS } from './utils/constants'
import { ArchLinuxIcon } from './components/ui/Icons'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import History from './components/sections/History'
import Features from './components/sections/Features'
import Terminal from './components/sections/Terminal'
import Architectures from './components/sections/Architectures'
import Download from './components/sections/Download'
import UseCases from './components/sections/UseCases'
import Community from './components/sections/Community'
import Footer from './components/sections/Footer'
import BgCanvas from './components/ui/BgCanvas'

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useActiveSection() {
  const [activeSection, setActiveSection] = useState(0)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTIONS.indexOf(entry.target.id)
            if (idx >= 0) setActiveSection(idx)
          }
        })
      },
      { threshold: 0.4, rootMargin: '-20% 0px -60% 0px' }
    )

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return { activeSection }
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}

function Navbar({ activeSection }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)
  const pillRef = useRef(null)
  const reducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  // Scroll-aware navbar hide/show
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const diff = y - lastY.current
        if (y < 64) setHidden(false)
        else if (diff > 10) setHidden(true)
        else if (diff < -10) setHidden(false)
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animate pill to active link - using transform scaleX for performance
  useEffect(() => {
    if (reducedMotion || !navRef.current || !pillRef.current) return
    const activeLink = navRef.current.querySelector('.nav-link.active')
    if (!activeLink) { pillRef.current.style.opacity = '0'; pillRef.current.style.transform = 'translateX(0) scaleX(0)'; return }
    const container = navRef.current.getBoundingClientRect()
    const link = activeLink.getBoundingClientRect()
    const scale = link.width / container.width
    const translate = link.left - container.left
    pillRef.current.style.transform = `translateX(${translate}px) scaleX(${scale})`
    pillRef.current.style.opacity = '1'
  }, [activeSection, reducedMotion])

  // Magnetic hover effect (desktop only)
  useEffect(() => {
    if (reducedMotion || window.innerWidth < 768) return
    const links = navRef.current?.querySelectorAll('.nav-link')
    if (!links) return
    const cleanups = []
    links.forEach(link => {
      const onMove = (e) => {
        const r = link.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.18
        const y = (e.clientY - r.top - r.height / 2) * 0.18
        link.style.transform = `translate(${x}px, ${y}px)`
      }
      const onLeave = () => { link.style.transform = '' }
      link.addEventListener('mousemove', onMove)
      link.addEventListener('mouseleave', onLeave)
      cleanups.push(() => { link.removeEventListener('mousemove', onMove); link.removeEventListener('mouseleave', onLeave) })
    })
    return () => cleanups.forEach(fn => fn())
  }, [reducedMotion])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)')
    const handler = (e) => { if (e.matches) setMobileOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mobileOpen])

  return (
    <nav className={`nav${hidden ? ' nav--hidden' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="#home" className="nav-brand" aria-label="Arch Linux Home">
          <span className="nav-brand-icon">
            <ArchLinuxIcon size={20} color="var(--cyan)" />
          </span>
          Arch Linux
        </a>
        <button
          className="nav-hamburger"
          aria-expanded={mobileOpen}
          aria-controls="nav-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen(o => !o)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <ul ref={navRef} id="nav-menu" className={`nav-links${mobileOpen ? ' open' : ''}`} role="menubar">
          {!reducedMotion && <span ref={pillRef} className="nav-active-pill" />}
          {NAV_LINKS.map((link) => {
            const activeSectionId = SECTIONS[activeSection]
            const isActive = activeSectionId === link.id
            return (
              <li key={link.id} role="none">
                <button
                  role="menuitem"
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    const el = document.getElementById(link.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                    setMobileOpen(false)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

function ScrollProgress({ progress }) {
  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  )
}

export default function App() {
  const { activeSection } = useActiveSection()
  const progress = useScrollProgress()

  useReveal()

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <BgCanvas />
      <ScrollProgress progress={progress} />
      <Navbar activeSection={activeSection} />
      <main id="main-content">
        <Hero />
        <About />
        <History />
        <Features />
        <Terminal />
        <Architectures />
        <Download />
        <UseCases />
        <Community />
      </main>
      <Footer />
    </>
  )
}