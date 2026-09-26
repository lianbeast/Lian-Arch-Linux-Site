/**
 * Four load-bearing pieces, as a table of contents rather than a card grid.
 *
 * Each row carries the actual command, because this audience trusts artifacts
 * and not adjectives. The rows are separated by rules, not by boxes.
 */
const FEATURES = [
  {
    n: '01',
    title: 'Pacman',
    cmd: 'pacman -Syu',
    text: 'Fast, surgical, dependency-aware. -Syu keeps the system current, -R leaves nothing behind, -Ss finds anything in the repos.',
  },
  {
    n: '02',
    title: 'The AUR',
    cmd: 'makepkg -si',
    text: '80,000+ community build recipes. Every one is a PKGBUILD — plain text you can read before you run it, so trust is earned by inspection rather than by branding.',
  },
  {
    n: '03',
    title: 'Rolling release',
    cmd: 'pacman -Q',
    text: 'One install, one stream. No version migrations and no upgrade every three years. You install Arch once and keep it current.',
  },
  {
    n: '04',
    title: 'Minimal base',
    cmd: 'pacstrap /mnt base linux',
    text: 'A clean install is essentially nothing. You choose the display server, the init, the shell, the tools. Every choice stays yours.',
  },
]

export default function Features() {
  return (
    <section id="features" className="sec" aria-labelledby="features-title">
      <header className="sec-head">
        <p className="sec-name">features</p>
        <h2 id="features-title" className="sec-title">
          Everything you need. Nothing you did not ask for.
        </h2>
      </header>

      <div className="rows reveal-stagger">
        {FEATURES.map((f) => (
          <article className="row" key={f.n}>
            <span className="row-num">{f.n}</span>
            <h3 className="row-h">
              {f.title}
              <span className="cmd">{f.cmd}</span>
            </h3>
            <p className="row-p">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
