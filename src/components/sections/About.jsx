import { PackageIcon, TerminalIcon, BookIcon } from '../ui/Icons.jsx'

const cards = [
  {
    icon: <PackageIcon size={28} color="currentColor" />,
    title: 'Rolling release',
    text: 'No versions. No upgrade cycles. Pull what is current, rebuild what broke. The distribution is the upstream.',
  },
  {
    icon: <TerminalIcon size={28} color="currentColor" />,
    title: 'Pacman + AUR',
    text: 'One tool for repos. Another for community packages. Together: 80,000+ packages, no waiting for a vendor.',
  },
  {
    icon: <BookIcon size={28} color="currentColor" />,
    title: 'The wiki',
    text: 'Detailed, current, written by users. The Arch Wiki is the most-cited Linux reference on the internet.',
  },
]

const stats = [
  { value: '80,000+', label: 'AUR packages' },
  { value: '6', label: 'Architectures' },
  { value: '1,000+', label: 'Contributors' },
  { value: '20+', label: 'Years rolling' },
]

export default function About() {
  return (
    <section id="about" className="section" aria-label="About Arch Linux">
      <div className="section-header reveal">
        <p className="section-tag">About</p>
        <h2 className="section-title">
          A distro that gets out of your way
        </h2>
        <p className="section-lead">
          Arch is not a product. It is a base. You decide what goes on top.
        </p>
      </div>
      <div className="grid-3 reveal-stagger">
        {cards.map((c) => (
          <article key={c.title} className="card">
            <span className="card-icon" aria-hidden="true">
              {c.icon}
            </span>
            <h3 className="card-title">{c.title}</h3>
            <p className="card-text">{c.text}</p>
          </article>
        ))}
      </div>
      <div className="stats-bar reveal">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}