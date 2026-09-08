// Mockup 02: hero as survey sheet. Contour lines map the A-mountain the
// 3D mesh renders; coordinates and elevation markers do the talking.
const CONTOURS = [
  'M 100 700 Q 350 660 600 700 T 1100 700',
  'M 80 640 Q 300 600 480 640 Q 560 620 600 640 Q 720 600 920 640 T 1120 640',
  'M 60 580 Q 260 540 440 580 Q 540 540 660 580 Q 780 540 960 580 T 1140 580',
  'M 40 520 Q 220 480 400 520 Q 520 460 600 520 Q 700 460 800 520 Q 980 480 1160 520',
  'M 20 460 Q 180 420 360 460 Q 480 380 540 460 Q 600 380 660 460 Q 720 380 840 460 Q 1020 420 1180 460',
  'M 0 400 Q 140 360 320 400 Q 440 300 500 400 Q 600 300 700 400 Q 760 300 880 400 Q 1060 360 1200 400',
  'M 0 340 Q 100 300 280 340 Q 400 240 480 340 Q 600 220 720 340 Q 800 240 920 340 Q 1100 300 1200 340',
  'M 0 280 Q 60 240 240 280 Q 360 180 460 280 Q 600 150 740 280 Q 840 180 960 280 Q 1140 240 1200 280',
]

const COORDS = [
  ['SURVEY ID', 'ARCH-2002-03'],
  ['LAT', '59.4370° N'],
  ['LON', '24.7536° E'],
  ['ELEV', '2,624 m AGL', 'hot'],
  ['TERRAIN', 'rolling-release'],
]

export default function TopoHero() {
  return (
    <section id="home" className="section hero topo-hero" aria-label="Hero">
      {/* contour background: mountain as map */}
      <svg className="contours" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="peakGlow" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="rgba(23,147,209,0.10)" />
            <stop offset="100%" stopColor="rgba(23,147,209,0)" />
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#peakGlow)" />
        <g fill="none" stroke="var(--contour)" strokeWidth="1">
          {CONTOURS.map((d, i) => <path key={i} d={d} />)}
        </g>
        <path
          d="M 0 220 Q 20 180 200 220 Q 320 130 440 220 Q 600 90 760 220 Q 880 130 1000 220 Q 1180 180 1200 220"
          fill="none" stroke="var(--contour-hot)" strokeWidth="1.4"
        />
        <g fill="var(--contour-hot)">
          <circle cx="440" cy="220" r="3" /><circle cx="760" cy="220" r="3" />
        </g>
        <text x="440" y="200" textAnchor="middle" fill="var(--text-muted)" fontFamily="JetBrains Mono, monospace" fontSize="11">2624 m</text>
        <text x="760" y="200" textAnchor="middle" fill="var(--text-muted)" fontFamily="JetBrains Mono, monospace" fontSize="11">2624 m</text>
      </svg>

      <span className="reg-mark tl" aria-hidden="true">+</span>
      <span className="reg-mark tr" aria-hidden="true">+</span>

      <div className="topo-sheet">
        <div className="sheet-main">
          <h1 className="hero-title">
            Arch <span className="hero-title-accent">Linux</span>
          </h1>
          <p className="hero-desc">
            A rolling-release terrain for the self-directed: exact
            documentation, no hidden layers. You summit on your own route.
          </p>
          <div className="hero-cta-row">
            <a className="btn btn-primary" href="#download">
              Begin ascent
            </a>
            <a
              className="btn btn-secondary"
              href="https://wiki.archlinux.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Field manual (wiki)
            </a>
          </div>
        </div>

        <aside className="coord-card" aria-label="Survey coordinates">
          {COORDS.map(([label, val, cls]) => (
            <div className="coord-row" key={label}>
              <span className="label">{label}</span>
              <span className={`val${cls ? ' ' + cls : ''}`}>{val}</span>
            </div>
          ))}
          <div className="coord-row">
            <span className="label">STATUS</span>
            <span className="val">
              <span className="live-ping" aria-hidden="true" /> maintained
            </span>
          </div>
        </aside>
      </div>
    </section>
  )
}
