import { useState } from 'react'

const faqs = [
  {
    q: 'Is Arch hard to install?',
    a: 'There are two paths. archinstall gives you a guided installer with a menu. The manual path is harder — but it is a feature: you end up knowing exactly what is on your machine and why. The wiki walks you through both, step by step.',
  },
  {
    q: 'Will it break?',
    a: 'A rolling distro updated regularly is stable. Breakage comes from partial upgrades and ignoring the output of pacman. Read what your updates print, never mix stale packages with fresh ones, and Arch stays boring — in the good way.',
  },
  {
    q: 'Arch or Ubuntu?',
    a: 'Ubuntu decides for you and updates twice a year. Arch asks you to decide and updates whenever upstream does. If you want your system to feel like a product, take Ubuntu. If you want it to feel like yours, take Arch.',
  },
  {
    q: 'Do I really need the wiki?',
    a: 'Yes — and that is the deal. The Arch Wiki is the most complete, most current Linux documentation anywhere. Half its readers do not even run Arch. If reading docs feels like a cost, Arch will feel like a cost. If it feels like leverage, you are home.',
  },
  {
    q: 'Can I game on it?',
    a: 'Yes. Steam, Lutris, native titles, Proton for everything else. Arch gets new graphics drivers before nearly anyone, and the wiki gaming page is the reference the rest of the internet links to.',
  },
  {
    q: 'What is the AUR, and is it safe?',
    a: 'A community repository of build recipes. Every package is a PKGBUILD — plain text you can read before you run it. Nothing is hidden; trust is earned by transparency and reputation, not branding. 80,000+ packages, maintained by people who use them.',
  },
]

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(0)

  return (
    <section id="faq" className="section" aria-label="Frequently asked questions">
      <div className="section-header reveal">
        <p className="section-tag">FAQ</p>
        <h2 className="section-title">Questions people actually ask</h2>
        <p className="section-lead">
          Straight answers. The wiki has the long ones.
        </p>
      </div>
      <div className="faq-list reveal-stagger">
        {faqs.map((f, i) => (
          <details
            key={f.q}
            className="faq-item"
            open={i === openIdx}
            onToggle={(e) => {
              if (e.currentTarget.open) setOpenIdx(i)
            }}
          >
            <summary className="faq-question">
              {f.q}
              <span className="faq-chevron" aria-hidden="true">▾</span>
            </summary>
            <p className="faq-answer">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
