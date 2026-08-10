import { useState, useEffect, useCallback } from 'react'
import { SECTIONS } from './utils/constants'
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

  const scrollToSection = useCallback((index) => {
    const id = SECTIONS[index]
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return { activeSection, scrollToSection }
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

function Navbar({ activeSection, onNavigate }) {
  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        <a href="#home" className="nav-brand" aria-label="Arch Linux Home">
          <span className="nav-brand-icon">
            <ArchLinuxIcon size={20} color="var(--cyan)" />
          </span>
          Arch Linux
        </a>
        <ul className="nav-links" role="menubar">
          {SECTIONS.map((section, i) => (
            <li key={section} role="none">
              <button
                role="menuitem"
                className={`nav-link ${activeSection === i ? 'active' : ''}`}
                onClick={() => onNavigate(i)}
                aria-current={activeSection === i ? 'page' : undefined}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            </li>
          ))}
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
  const { activeSection, scrollToSection } = useActiveSection()
  const progress = useScrollProgress()

  useReveal()

  return (
    <>
      <BgCanvas />
      <ScrollProgress progress={progress} />
      <Navbar activeSection={activeSection} onNavigate={scrollToSection} />
      <main>
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