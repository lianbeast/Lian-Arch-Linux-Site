import { ArchLinuxIcon, ArrowDownIcon } from '../ui/Icons.jsx'

export default function Hero() {
  return (
    <section id="home" className="section hero" aria-label="Hero">
      <span className="hero-icon reveal" aria-hidden="true">
        <ArchLinuxIcon size={72} color="var(--cyan)" />
      </span>
      <p className="hero-tagline reveal">You. The machine. Nothing between.</p>
      <h1 className="hero-title reveal">
        Arch <span className="hero-title-accent">Linux</span>
      </h1>
      <p className="hero-desc reveal">
        A lightweight, flexible, rolling-release Linux distribution for the
        self-directed. You build it. You own it. Nothing hides behind a curtain.
      </p>
      <div className="hero-cta-row reveal">
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
        className="hero-scroll-hint reveal"
        aria-label="Scroll to about"
      >
        <ArrowDownIcon size={20} color="currentColor" />
      </a>
    </section>
  )
}
