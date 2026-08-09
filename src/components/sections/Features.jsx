import { PackageIcon, TerminalIcon, CpuIcon, BookIcon } from '../ui/Icons.jsx'

const features = [
  {
    icon: <TerminalIcon size={32} color="currentColor" />,
    title: 'Pacman',
    tag: 'Native',
    desc: 'Fast, surgical, dependency-aware. -Syu keeps the system current; -R leaves nothing behind; -Ss finds anything in the repos.',
  },
  {
    icon: <PackageIcon size={32} color="currentColor" />,
    title: 'AUR',
    tag: 'Community',
    desc: '80,000+ community-built packages. If it runs on Linux, someone in the Arch world has packaged it for you.',
  },
  {
    icon: <CpuIcon size={32} color="currentColor" />,
    title: 'Rolling Release',
    tag: 'Continuous',
    desc: 'One install, one stream. No version migrations. No "upgrade every three years". You install Arch once.',
  },
  {
    icon: <BookIcon size={32} color="currentColor" />,
    title: 'Minimal Base',
    tag: 'Composable',
    desc: 'A clean install is essentially nothing. You choose your display server, your init, your shell, your tools. Every choice stays yours.',
  },
]

export default function Features() {
  return (
    <section id="features" className="section" aria-label="Features">
      <div className="section-header reveal">
        <p className="section-tag">// 03 — Features</p>
        <h2 className="section-title">Everything you need. Nothing you didn't ask for</h2>
        <p className="section-lead">
          Four load-bearing pieces, designed to compose into any system you can describe.
        </p>
      </div>
      <div className="features">
        {features.map((f) => (
          <article key={f.title} className="feature-row reveal">
            <span className="feature-icon" aria-hidden="true">
              {f.icon}
            </span>
            <div className="feature-text">
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
            <span className="feature-tag">{f.tag}</span>
          </article>
        ))}
      </div>
    </section>
  )
}