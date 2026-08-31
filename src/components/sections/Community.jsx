const links = [
  {
    label: 'IRC',
    text: '#archlinux on Libera.Chat — help, chatter, both.',
    href: 'https://libera.chat/',
  },
  {
    label: 'Forum',
    text: 'General support, packaging, dev talks.',
    href: 'https://bbs.archlinux.org/',
  },
  {
    label: 'Bug Tracker',
    text: 'Found a bug? File it. All bugs are public.',
    href: 'https://bugs.archlinux.org/',
  },
  {
    label: 'Wiki',
    text: 'The most-cited Linux reference on the internet.',
    href: 'https://wiki.archlinux.org/',
  },
]

const marqueeWords = [
  'Arch Linux', 'Rolling Release', 'KISS', 'Pacman', 'AUR', 'Wiki',
  'Open Source', 'Do It Yourself', 'Minimal', 'DIY', 'Pkgbuild', 'Git',
]

export default function Community() {
  return (
    <section id="community" className="section" aria-label="Community">
      <div className="section-header reveal">
        <p className="section-tag">Community</p>
        <h2 className="section-title">
          No. 1 question: "Is Arch worth it?"
        </h2>
        <p className="section-lead">
          The community will not judge you for asking. They will judge you for not
          reading the wiki first.
        </p>
      </div>

      <div className="marquee reveal" aria-hidden="true">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="marquee-word">{w}</span>
          ))}
        </div>
      </div>

      <ul className="grid-2 reveal-stagger" aria-label="Community links">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="card"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <h3 className="card-title">{l.label}</h3>
              <p className="card-text">{l.text}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}