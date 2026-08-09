import { CpuIcon } from '../ui/Icons.jsx'

const arches = [
  { label: 'x86_64', text: 'The primary architecture. Full support, all packages built.' },
  { label: 'aarch64', text: 'ARM 64-bit. Raspberry Pi 4, Pine64, and servers.' },
  { label: 'armv7h', text: 'ARM 32-bit hard-float. Older Pi, Odroid, and mobile boards.' },
  { label: 'riscv64', text: 'RISC-V 64-bit. The open ISA future, tiered support growing.' },
]

export default function Architectures() {
  return (
    <section id="architectures" className="section" aria-label="Supported architectures">
      <div className="section-header reveal">
        <p className="section-tag">// 05 — Supported on</p>
        <h2 className="section-title">Build it for what you run</h2>
        <p className="section-lead">
          Official tiers plus community ports. If it boots Linux, Arch likely runs there.
        </p>
      </div>
      <div className="arch-grid reveal" aria-label="Architecture grid">
        {arches.map((a) => (
          <article key={a.label} className="arch-card">
            <span className="arch-icon" aria-hidden="true">
              <CpuIcon size={24} color="var(--cyan)" />
            </span>
            <h3 className="arch-title">{a.label}</h3>
            <p className="arch-text">{a.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}