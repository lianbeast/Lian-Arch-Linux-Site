import SectionHead from '../ui/SectionHead'

/**
 * The scrolling keyword marquee is gone.
 *
 * It was twelve words on a loop, carrying no information the reader did not
 * already have from the section above it. What remains is a plain list of
 * places to go, which is what the section was actually for.
 */
const LINKS = [
  { label: 'IRC', text: '#archlinux on Libera.Chat — help and chatter, both.', href: 'https://libera.chat/' },
  { label: 'Forum', text: 'General support, packaging, and development talk.', href: 'https://bbs.archlinux.org/' },
  { label: 'Bug tracker', text: 'Found a bug? File it. Every report is public.', href: 'https://bugs.archlinux.org/' },
  { label: 'Wiki', text: 'The most-cited Linux reference on the internet.', href: 'https://wiki.archlinux.org/' },
]

export default function Community() {
  return (
    <section id="community" className="sec" aria-labelledby="community-title">
      <SectionHead
        name="community"
        id="community-title"
        title="The number one question: is Arch worth it?"
        lead="The community will not judge you for asking. They will judge you for not reading the wiki first."
      />

      <div className="comm reveal-stagger">
        {LINKS.map((l) => (
          <a
            className="comm-item"
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="comm-label">{l.label}</span>
            <span className="comm-text">{l.text}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
