import { Suspense, lazy } from 'react'

// Mountain split out of the main bundle — it's the one heavy thing on the page
const ArchMesh = lazy(() => import('../ui/ArchMesh.jsx'))

// Boot-log choreography: each entry wakes in sequence, headline types itself
// between kernel messages, the way dmesg actually reads. (mockup 01)
const BOOT_LINES = [
  { ts: '[ 0.000000]', text: 'Linux version 7.2.2-arch1-1 (linux@archlinux.org)', cls: 'dim' },
  { ts: '[ 0.000000]', text: 'Command line: root=/dev/nvme0n1p2 rw quiet', cls: 'dim' },
  { ts: '[ 0.413321]', text: 'ACPI: Core revision 20260827', cls: '' },
  { ts: '[ 0.512321]', text: 'Btrfs (nvme0n1p2): mounted filesystem zstd compressed', cls: 'ok' },
]

const BOOT_TAIL = [
  { ts: '[ 1.204442]', text: 'Freeing unused kernel image (initmem) memory: 2104K', cls: 'dim' },
  { ts: '[ 1.821321]', text: 'Reached target Graphical Interface.', cls: 'ok' },
]

export default function BootHero() {
  return (
    <section id="home" className="section hero boot-hero" aria-label="Hero">
      <div className="hero-mesh" aria-hidden="true">
        <Suspense fallback={null}>
          <ArchMesh />
        </Suspense>
      </div>
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow-single" />
      </div>

      <div className="boot-log">
        {BOOT_LINES.map((l, i) => (
          <span
            key={l.ts + i}
            className={`log-line boot-anim ${l.cls}`}
            style={{ '--d': `${0.1 + i * 0.15}s` }}
          >
            <span className="log-ts">{l.ts}</span>
            {l.text}
          </span>
        ))}

        <div className="headline-block boot-anim" style={{ '--d': '0.75s' }}>
          <p className="hero-tagline">You. The machine. Nothing between.</p>
          <h1 className="hero-title">
            Arch <span className="hero-title-accent">Linux</span>
            <span className="boot-caret" aria-hidden="true" />
          </h1>
          <p className="hero-desc">
            A lightweight, flexible, rolling-release Linux distribution for the
            self-directed. You build it. You own it. Nothing hides behind a curtain.
          </p>
          <div className="hero-cta-row">
            <a className="btn btn-primary" href="#download">
              # pacman -S freedom
            </a>
            <a
              className="btn btn-secondary"
              href="https://wiki.archlinux.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              wiki.archlinux.org
            </a>
          </div>
        </div>

        {BOOT_TAIL.map((l, i) => (
          <span
            key={l.ts + i}
            className={`log-line boot-anim ${l.cls}`}
            style={{ '--d': `${1 + i * 0.15}s` }}
          >
            <span className="log-ts">{l.ts}</span>
            {l.text}
          </span>
        ))}
        <span
          className="log-line boot-anim"
          style={{ '--d': '1.3s' }}
        >
          <span className="log-ts">[ 2.049113]</span>
          you are in control
          <span className="boot-caret" aria-hidden="true" />
        </span>
      </div>
    </section>
  )
}
