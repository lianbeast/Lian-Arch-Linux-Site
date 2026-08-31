import { ArchLinuxIcon, ArrowDownIcon } from '../ui/Icons'

export default function Hero() {
  return (
    <section id="home" className="section hero" aria-label="Hero">
      {/* Animated gradient mesh background */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-gradient-orb hero-gradient-orb--1" />
        <div className="hero-gradient-orb hero-gradient-orb--2" />
        <div className="hero-gradient-orb hero-gradient-orb--3" />
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