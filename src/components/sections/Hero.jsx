import { Suspense, lazy } from 'react'
import { ArchLinuxIcon, ArrowDownIcon } from '../ui/Icons'

// Mountain split out of the main bundle — it's the one heavy thing on the page
const ArchMesh = lazy(() => import('../ui/ArchMesh.jsx'))

export default function Hero() {
  return (
    <section id="home" className="section hero" aria-label="Hero">
      {/* 3D wireframe mountain — the Arch "A" read as terrain */}
      <div className="hero-mesh" aria-hidden="true">
        <Suspense fallback={null}>
          <ArchMesh />
        </Suspense>
      </div>
      {/* Single static glow behind the peaks — the old orb trio is gone */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow-single" />
      </div>

      <div className="hero-content reveal-stagger">
        <span className="hero-icon" aria-hidden="true">
          <ArchLinuxIcon size={72} color="var(--primary-light)" />
        </span>
        <p className="hero-tagline">You. The machine. Nothing between.</p>
        <h1 className="hero-title">
          Arch <span className="hero-title-accent">Linux</span>
        </h1>
        <p className="hero-desc">
          A lightweight, flexible, rolling-release Linux distribution for the
          self-directed. You build it. You own it. Nothing hides behind a curtain.
        </p>
        <div className="hero-cta-row">
          <a className="btn btn-primary" href="#download">
            Download
          </a>
          <a
            className="btn btn-secondary"
            href="https://wiki.archlinux.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the wiki
          </a>
        </div>
        <a
          href="#about"
          className="hero-scroll-hint"
          aria-label="Scroll to about"
        >
          <ArrowDownIcon size={20} color="currentColor" />
        </a>
      </div>
    </section>
  )
}