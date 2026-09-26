/**
 * Four architectures do not need four cards.
 *
 * They run as one line of text with a tier tag each. The distinction that
 * actually matters here is official versus community port, so that is the
 * thing the layout encodes.
 */
const ARCHES = [
  { key: 'x86_64', tag: 'official', desc: 'The primary target. Full support, every package built.' },
  { key: 'aarch64', tag: 'port', desc: 'ARM 64-bit. Raspberry Pi 4, Pine64, ARM servers.' },
  { key: 'armv7h', tag: 'port', desc: 'ARM 32-bit hard-float. Older Pi and Odroid boards.' },
  { key: 'riscv64', tag: 'port', desc: 'RISC-V 64-bit. The open ISA, tiered support growing.' },
]

export default function Architectures() {
  return (
    <section id="architectures" className="sec" aria-labelledby="platforms-title">
      <header className="sec-head">
        <p className="sec-name">platforms</p>
        <h2 id="platforms-title" className="sec-title">
          Build it for what you run
        </h2>
        <p className="sec-lead">
          One officially supported target plus community ports. If it boots
          Linux, someone has almost certainly made Arch run on it.
        </p>
      </header>

      <div className="plat reveal-stagger">
        {ARCHES.map((a) => (
          <div className="plat-item" key={a.key}>
            <p className="plat-key">
              {a.key}
              <span className="tag">{a.tag}</span>
            </p>
            <p className="plat-desc">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
