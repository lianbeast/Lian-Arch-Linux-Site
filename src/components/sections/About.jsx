import SectionHead from '../ui/SectionHead'

/**
 * About is an argument, not a feature list.
 *
 * It used to be three identical glass cards plus a stats bar. It is now one
 * paragraph set large, and the numbers run as a single line of text — because
 * a manifesto does not need a grid, and emphasis you apply to everything is
 * emphasis you have not applied.
 */
const FACTS = [
  ['80,000+', 'AUR packages'],
  ['2002', 'first release'],
  ['4', 'architectures'],
  ['100%', 'plain-text config'],
]

export default function About() {
  return (
    <section id="about" className="sec" aria-labelledby="about-title">
      <SectionHead
        name="about"
        id="about-title"
        title="Arch is not a product. It is a base."
      />

      <p className="manifesto reveal">
        Nothing is installed that you did not ask for. Nothing runs that you did
        not enable. <strong>The system is the sum of your decisions</strong>, and
        every one of them is legible.
      </p>

      <div className="facts reveal">
        {FACTS.map(([value, label]) => (
          <p className="fact" key={label}>
            <b>{value}</b> {label}
          </p>
        ))}
      </div>
    </section>
  )
}
