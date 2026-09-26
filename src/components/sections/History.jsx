const EVENTS = [
  {
    year: '2002',
    title: 'Arch is born',
    text: 'Judd Vinet releases Arch 0.1 — a clean build system, pacman, and the start of the wiki.',
  },
  {
    year: '2007',
    title: 'Aaron Griffin leads',
    text: 'Project lead passes to Aaron Griffin. The community tightens around the KISS philosophy.',
  },
  {
    year: '2012',
    title: 'systemd adoption',
    text: 'Arch adopts systemd as the default init. Controversial then, universal since.',
  },
  {
    year: '2021',
    title: 'archinstall',
    text: 'An official guided installer lands. The hard way stays. The easier way is now there too.',
  },
  {
    year: 'Today',
    title: 'A community, not a product',
    text: 'Maintainers, packagers, wiki editors, IRC helpers. The work is paid in trust, not money.',
  },
]

export default function History() {
  return (
    <section id="history" className="sec" aria-labelledby="history-title">
      <header className="sec-head">
        <p className="sec-name">history</p>
        <h2 id="history-title" className="sec-title">
          Twenty-something years of deliberate choices
        </h2>
        <p className="sec-lead">
          No marketing pivots. No acquisitions. Arch has always been built by the
          people who use it.
        </p>
      </header>

      <ol className="timeline reveal-stagger" aria-label="Arch Linux release history">
        {EVENTS.map((e) => (
          <li className="tl-item" key={e.year}>
            <span className="tl-year">{e.year}</span>
            <div>
              <h3 className="tl-title">{e.title}</h3>
              <p className="tl-text">{e.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
