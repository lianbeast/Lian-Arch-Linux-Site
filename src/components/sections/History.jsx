const events = [
  {
    year: '2002',
    title: 'Arch is born',
    text: 'Judd Vinet releases Arch 0.1 - a clean build system, pacman, and the start of the wiki.',
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
    year: '2017',
    title: 'Rolling, always',
    text: 'Partial upgrades become supported and recommended. Users stop holding packages back.',
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
    <section id="history" className="section" aria-label="History">
      <div className="section-header reveal">
        <p className="section-tag">// History</p>
        <h2 className="section-title">Twenty-something years of deliberate choices</h2>
        <p className="section-lead">
          No marketing pivots. No acquisitions. Arch has always been built by the
          people who use it.
        </p>
      </div>
      <ol className="timeline">
        {events.map((e) => (
          <li key={e.year} className="timeline-item reveal">
            <span className="timeline-year">{e.year}</span>
            <h3 className="timeline-title">{e.title}</h3>
            <p className="timeline-text">{e.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}