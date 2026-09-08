// Mockup 04: hero as mirrorlist race. Latency bars fill in order; localhost wins.
import { useEffect, useRef } from 'react'

const MIRRORS = [
  { name: 'mirror.osbeck.com', loc: 'Luleå, SE', ms: 14.2, score: .14, cls: 'fast' },
  { name: 'mirror.t-home.mk', loc: 'Skopje, MK', ms: 19.8, score: .19, cls: 'fast' },
  { name: 'arch.jensgutermuth.de', loc: 'Falkenstein, DE', ms: 26.1, score: .26, cls: 'fast' },
  { name: 'mirror.23m.com', loc: 'Vienna, AT', ms: 31.4, score: .31, cls: 'fast' },
  { name: 'mirrors.kernel.org', loc: 'San Francisco, US', ms: 47.0, score: .47, cls: 'mid' },
]

const RANK_CARDS = [
  {
    medal: 'IDLE FOOTPRINT',
    title: '~200 packages base',
    body: 'What you don\'t install costs nothing. No telemetry daemons, no preloaded desktop suites, no "helper" services phoning home.',
    metric: 'RAM at idle:', value: 'yours to measure',
  },
  {
    medal: 'UPDATE CADENCE',
    title: 'Daily, if you want',
    body: 'Rolling release means `pacman -Syu` is the whole upgrade procedure. Median time from upstream release to repo: hours, not seasons.',
    metric: 'Time between releases:', value: 'zero',
  },
  {
    medal: 'BOOT PATH',
    title: 'What you load is what boots',
    body: 'No services you didn\'t enable. The kernel boots what you told it to boot, which is why nothing competes for first place except your work.',
    metric: 'Services you didn\'t ask for:', value: '0',
  },
]

export default function RaceHero() {
  const tickerRef = useRef(null)

  useEffect(() => {
    const el = tickerRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { el.classList.add('go'); return }
    const t = setTimeout(() => el.classList.add('go'), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="home" className="section hero race-hero" aria-label="Hero">
      <div className="race-head">
        <span className="race-kicker">Reflector · ranking mirrors</span>
        <h1>Fast because nothing <span className="fast">slows it down.</span></h1>
        <p>Every Arch mirror is a server you can measure. Latency, throughput, uptime: public numbers, real race. The same transparency runs the whole system.</p>
        <div className="race-ctas">
          <a className="btn btn-primary" href="#podium">Rank your machine</a>
          <a className="btn" href="https://archlinux.org/mirrors/status/" target="_blank" rel="noopener noreferrer">archlinux.org/mirrors</a>
        </div>
      </div>

      <div ref={tickerRef} className="ticker" role="table" aria-label="Mirror latency ranking">
        <div className="ticker-head" role="row">
          <span role="columnheader">Server</span>
          <span role="columnheader">Latency</span>
          <span role="columnheader">Score</span>
        </div>
        {MIRRORS.map((m, i) => (
          <div key={i} className="ticker-row" role="row">
            <span className="mirror-name" role="cell">
              {m.name}
              <span className="mirror-loc">{m.loc}</span>
            </span>
            <span className="bar-track" role="cell">
              <span className="bar-fill" style={{ '--w': m.score }} />
            </span>
            <span className={`ping-val ${m.cls}`} role="cell">{m.ms.toFixed(1)} ms</span>
          </div>
        ))}
        <div className="ticker-row winner-flash" role="row">
          <span className="mirror-name" role="cell">
            <b>localhost</b> · your machine
            <span className="mirror-loc">wherever you are</span>
          </span>
          <span className="bar-track" role="cell">
            <span className="bar-fill" style={{ '--w': .04 }} />
          </span>
          <span className="ping-val fast" role="cell">0.04 ms</span>
        </div>
      </div>
      <p className="tick-note">// numbers illustrative — run <code>reflector --verbose --latest 5</code> for yours</p>

      <section className="podium" id="podium">
        <div className="podium-head">
          <span className="podium-kicker">Benchmarks that matter</span>
          <h2>Nothing between you and first place.</h2>
        </div>
        <div className="rank-grid">
          {RANK_CARDS.map((c, i) => (
            <article key={i} className="rank-card">
              <span className="medal">{c.medal}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <p className="metric">{c.metric} <b>{c.value}</b></p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}