/**
 * Native <details>, uncontrolled.
 *
 * The previous version passed `open={i === openIdx}` alongside an onToggle that
 * wrote back to state. That makes React and the browser fight over the same
 * attribute — it mostly worked, and failed in ways that are miserable to debug.
 *
 * So `open` is set on the first item and never changes afterwards. React
 * compares the prop against the previous render, sees no change, and leaves the
 * DOM alone, which lets the browser own the toggle from then on. (There is no
 * React `defaultOpen` for <details>; a stable `open` prop is the equivalent.)
 */
const FAQS = [
  {
    q: 'Is Arch hard to install?',
    a: 'There are two paths. archinstall gives you a guided installer with a menu. The manual path is harder, but that is the point: you end up knowing exactly what is on your machine and why. The wiki walks through both, step by step.',
  },
  {
    q: 'Will it break?',
    a: 'A rolling distribution updated regularly is stable. Breakage comes from partial upgrades and from ignoring what pacman prints. Read your update output, never mix stale packages with fresh ones, and Arch stays boring in the good way.',
  },
  {
    q: 'Arch or Ubuntu?',
    a: 'Ubuntu decides for you and updates twice a year. Arch asks you to decide and updates whenever upstream does. If you want your system to feel like a product, take Ubuntu. If you want it to feel like yours, take Arch.',
  },
  {
    q: 'Do I really need the wiki?',
    a: 'Yes, and that is the deal. The Arch Wiki is the most complete and most current Linux documentation anywhere — a large share of its readers do not even run Arch. If reading docs feels like a cost, Arch will feel like a cost. If it feels like leverage, you are home.',
  },
  {
    q: 'Can I game on it?',
    a: 'Yes. Steam, Lutris, native titles, Proton for everything else. Arch tends to get new graphics drivers before most distributions, and the wiki gaming page is the reference the rest of the internet links to.',
  },
  {
    q: 'What is the AUR, and is it safe?',
    a: 'A community repository of build recipes. Every package is a PKGBUILD — plain text you can read before you run it. Nothing is hidden; trust is earned by inspection and reputation rather than branding. 80,000+ packages, maintained by the people who use them.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="sec" aria-labelledby="faq-title">
      <header className="sec-head">
        <p className="sec-name">faq</p>
        <h2 id="faq-title" className="sec-title">
          Questions people actually ask
        </h2>
        <p className="sec-lead">Straight answers. The wiki has the long ones.</p>
      </header>

      <div className="faq reveal-stagger">
        {FAQS.map((f, i) => (
          <details className="faq-item" key={f.q} open={i === 0 || undefined}>
            <summary className="faq-q">
              <span>{f.q}</span>
              <span className="faq-mark" aria-hidden="true">+</span>
            </summary>
            <p className="faq-a">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
