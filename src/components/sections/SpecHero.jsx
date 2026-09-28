/**
 * The hero is a PKGBUILD.
 *
 * The whole thesis of the brand — sovereignty, the user as the load-bearing
 * component — stated as a build recipe instead of a claim. The headline sits
 * on its own line of the sheet, so the reader gets the name and the argument
 * before anything else, and the last line is the payoff: depends=('you').
 */
const NOTES = [
  {
    h: 'pkgname',
    p: 'Every package is a PKGBUILD — plain text you can read before you run it. Nothing arrives compiled from a source you cannot inspect.',
    ref: 'line 5',
  },
  {
    h: 'pkgver',
    p: 'One command keeps the system current. There is no upgrade cycle because there is no version. The date is the version; the version is the date.',
    ref: 'line 6',
  },
  {
    h: 'depends',
    p: 'Arch decides nothing for you. Every choice the system makes is a choice you made first — which is why nothing is ever hidden from you.',
    ref: 'line 9',
  },
]

export default function SpecHero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-code">
          <span className="ln" aria-hidden="true">1</span>
          <span className="code c"># The Arch Way, in plain text</span>

          <span className="ln" aria-hidden="true">2</span>
          <span className="code">&nbsp;</span>

          <span className="ln" aria-hidden="true">3</span>
          <div className="code code--block">
            <h1 id="hero-title" className="hero-title">
              Arch <em>Linux</em>
            </h1>
            <p className="hero-lead">
              A lightweight, rolling-release distribution for people who want to
              know exactly what is on their machine. You build it. You own it.
              Nothing hides behind a curtain.
            </p>
            <div className="hero-cta">
              <a className="btn btn-solid" href="#download">Download</a>
              <a
                className="btn btn-line"
                href="https://wiki.archlinux.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the wiki
              </a>
            </div>

            <p className="hero-hint">
              ↓ the same commands run live in{' '}
              <a href="#terminal">the terminal</a> below.
            </p>
          </div>

          <span className="ln" aria-hidden="true">4</span>
          <span className="code">&nbsp;</span>

          <span className="ln" aria-hidden="true">5</span>
          <span className="code">
            <span className="k">pkgname</span>=<span className="v">your-machine</span>
          </span>

          <span className="ln" aria-hidden="true">6</span>
          <span className="code">
            <span className="k">pkgver</span>=<span className="v">rolling</span>
          </span>

          <span className="ln" aria-hidden="true">7</span>
          <span className="code">
            <span className="k">pkgrel</span>=<span className="v">1</span>
          </span>

          <span className="ln" aria-hidden="true">8</span>
          <span className="code">
            <span className="k">arch</span>=<span className="v">('x86_64' 'aarch64' 'armv7h' 'riscv64')</span>
          </span>

          <span className="ln" aria-hidden="true">9</span>
          <span className="code">
            <span className="k">depends</span>=<span className="v">('you')</span>
          </span>
        </div>

        <aside className="hero-notes" aria-label="Annotations">
          {NOTES.map((n) => (
            <div className="note" key={n.h}>
              <p className="note-h">{n.h}</p>
              <p className="note-p">{n.p}</p>
              <span className="note-ref">see {n.ref}</span>
            </div>
          ))}
        </aside>
      </div>

      <div className="hero-cue" aria-hidden="true">
        <span className="hero-cue-rule" />
        <span>scroll — the argument continues</span>
        <span className="hero-cue-arrow">↓</span>
      </div>
    </section>
  )
}
