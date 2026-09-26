/**
 * Use cases as a table, not six identical cards.
 *
 * Same content, one column of labels and one of descriptions — which is what a
 * list of things that share a shape should have been all along.
 */
const CASES = [
  ['Personal workstation', 'Keep one system current for years. Roll updates weekly, skip nothing, accumulate nothing.'],
  ['Development machine', 'Current compilers, current libraries, current tooling. Reproducible builds with no version rot.'],
  ['Server', 'Light, fast to boot, trivial to snapshot. Deploy one box or a thousand and keep them identical.'],
  ['Embedded / SBC', 'ARM and RISC-V builds for Pi, Pine and similar boards. Minimal base, maximal control.'],
  ['Security & forensics', 'Custom live images, minimal services, total auditability. A clean base is a safe base.'],
  ['Learning', 'Read the wiki, build a system, hit the AUR. Learning by doing, because there is no other way.'],
]

export default function UseCases() {
  return (
    <section id="usecases" className="sec" aria-labelledby="usecases-title">
      <header className="sec-head">
        <p className="sec-name">use cases</p>
        <h2 id="usecases-title" className="sec-title">
          Arch is not opinionated about your workload
        </h2>
      </header>

      <div className="cases reveal">
        {CASES.map(([title, text]) => (
          <div className="case-row" key={title}>
            <h3 className="case-k">{title}</h3>
            <p className="case-v">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
