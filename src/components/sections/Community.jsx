const words = ['PACMAN', 'WIKI', 'AUR', 'ROLLING', 'COMMUNITY', 'FREEDOM']

const cards = [
  { title: 'Forums', text: 'The longest-running Arch conversation. Read. Search. Post. The answer is almost always already there.' },
  { title: 'IRC', text: '#archlinux on Libera Chat. Real-time help from people who actually know.' },
  { title: 'Wiki', text: 'The most detailed Linux wiki on the internet. Written by users, verified by time.' },
  { title: 'Mailing list', text: 'Announcements, RFCs, and deep technical discussions. No noise.' },
]

export default function Community() {
  return (
    <section id="community" className="section" aria-label="Community">
      <div className="section-header reveal">
        <p className="section-tag">// 08 — Community</p>
        <h2 className="section-title">Users who build the distro they use</h2>
        <p className="section-lead">
          Not customers. Not consumers. People who read source before asking questions.
        </p>
      </div>
      <div className="marquee-wrap reveal" aria-label="Arch community values">
        <div className="marquee-track" aria-hidden="true">
          {[...words, ...words].map((w, i) => (
            <span key={i} className="marquee-word">{w}</span>
          ))}
        </div>
      </div>
      <div className="grid-2">
        {cards.map((c) => (
          <article key={c.title} className="card reveal">
            <h3 className="card-title">{c.title}</h3>
            <p className="card-text">{c.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}