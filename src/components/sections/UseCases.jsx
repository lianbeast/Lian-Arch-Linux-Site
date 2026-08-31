const cases = [
  {
    num: '01',
    title: 'Personal workstation',
    text: 'Keep one system current for years. Roll updates weekly. Skip nothing. Accumulate nothing.',
  },
  {
    num: '02',
    title: 'Development machine',
    text: 'Current compilers, current libs, current tooling. Reproducible builds, no version rot.',
  },
  {
    num: '03',
    title: 'Server',
    text: 'Light, fast to boot, trivial to snapshot. Deploy one box or a thousand, keep them identical.',
  },
  {
    num: '04',
    title: 'Embedded / SBC',
    text: 'ARM builds for Pi, Pine, and similar boards. Minimal base, maximal control.',
  },
  {
    num: '05',
    title: 'Security & forensics',
    text: 'Custom live images, minimal services, total auditability. A clean base is a safe base.',
  },
  {
    num: '06',
    title: 'Learning',
    text: 'Reading the wiki, building a system, hitting the Arch User Repository. Learning by doing.',
  },
]

export default function UseCases() {
  return (
    <section id="usecases" className="section" aria-label="Use cases">
      <div className="section-header reveal">
        <p className="section-tag">Use cases</p>
        <h2 className="section-title">Arch is not opinionated about your workload</h2>
        <p className="section-lead">
          Developers, sysadmins, students, tinkerers — the same base works for all
          of them.
        </p>
      </div>
      <div className="usecase-grid reveal-stagger" aria-label="Use case grid">
        {cases.map((c) => (
          <article key={c.num} className="usecase-card">
            <span className="usecase-num" aria-hidden="true">
              {c.num}
            </span>
            <h3 className="usecase-title">{c.title}</h3>
            <p className="usecase-text">{c.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}