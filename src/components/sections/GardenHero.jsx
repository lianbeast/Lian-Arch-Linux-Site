// Mockup 06: hero as prompt garden. Terminal seed grows a tree; every feature below is a rooted command.
const BRANCHES = [
  { d: 'M 350 800 C 350 700 340 640 350 560', delay: '0.2s' },
  { d: 'M 350 560 C 320 520 280 500 240 460', delay: '0.5s' },
  { d: 'M 350 560 C 380 520 420 500 460 460', delay: '0.7s' },
  { d: 'M 240 460 C 210 420 200 380 220 330', delay: '0.9s' },
  { d: 'M 460 460 C 490 420 500 380 480 330', delay: '1.1s' },
  { d: 'M 350 560 C 350 500 350 460 350 420', delay: '1.3s' },
  { d: 'M 220 330 C 200 300 210 260 240 230', delay: '1.5s' },
  { d: 'M 480 330 C 500 300 490 260 460 230', delay: '1.7s' },
  { d: 'M 350 420 C 340 380 360 340 350 300', delay: '1.9s' },
]

const LEAVES = [
  { cx: 240, cy: 230, r: 5, delay: '1.9s', fill: 'leaf' },
  { cx: 460, cy: 230, r: 5, delay: '2.1s', fill: 'leaf' },
  { cx: 350, cy: 300, r: 5, delay: '2.3s', fill: 'leaf' },
  { cx: 220, cy: 330, r: 4, delay: '2.0s', fill: 'leaf' },
  { cx: 480, cy: 330, r: 4, delay: '2.2s', fill: 'leaf' },
]

const CUTTINGS = [
  {
    cmt: '# daily ritual, 30 seconds',
    cmd: '$ pacman -Syu',
    out: ':: full system upgrade… done.',
    title: 'Rolling release',
    desc: 'The tree never stops growing. One command keeps every branch current, forever.',
  },
  {
    cmt: '# plant only what you use',
    cmd: '$ pacstrap /mnt base linux',
    out: '→ boots to a shell. yours from here.',
    title: 'Minimal base',
    desc: 'Two packages in, everything else is your decision. No pre-grown hedge.',
  },
  {
    cmt: '# graft from 80,000+ community branches',
    cmd: '$ makepkg -si',
    out: '→ PKGBUILD: plain text, read before run.',
    title: 'AUR',
    desc: 'Every community package is a recipe you can inspect. Trust grows from transparency.',
  },
  {
    cmt: '# the field guide other distros cite',
    cmd: '$ xdg-open https://wiki.archlinux.org',
    out: '→ 55,000+ articles. precise. current.',
    title: 'The wiki',
    desc: 'Documentation treated like the system itself: maintained, versioned, exact.',
  },
]

export default function GardenHero() {
  return (
    <section id="home" className="section hero garden-hero" aria-label="Hero">
      <svg className="tree-svg" viewBox="0 0 700 800" aria-hidden="true">
        <g fill="none" stroke="var(--bark)" strokeWidth="2" strokeLinecap="round">
          {BRANCHES.map((b, i) => (
            <path key={i} className="branch" style={{ animationDelay: b.delay }} d={b.d} />
          ))}
        </g>
        <g fill="var(--leaf)">
          {LEAVES.map((l, i) => (
            <circle key={i} className="leafnode" style={{ animationDelay: l.delay }} cx={l.cx} cy={l.cy} r={l.r} />
          ))}
        </g>
        <g fill="var(--accent)" opacity=".9">
          <circle className="leafnode" style={{ animationDelay: '2.6s' }} cx="350" cy="800" r="6" />
        </g>
      </svg>

      <div className="garden-head">
        <span className="garden-kicker">Est. 2002 · still growing</span>
        <h1>Grown from a <span className="alive">single prompt.</span></h1>
        <p>Arch starts as one line in a terminal and becomes whatever you cultivate. No installer makes choices for you, so no choice is ever hidden from you.</p>

        <div className="seed" aria-label="The seed prompt">
          <div><span className="p1">[you@arch ~]</span>$ <span className="p2">curl -O archlinux.iso</span></div>
          <div><span className="p1">[you@arch ~]</span>$ <span className="p2">timedatectl, fdisk, pacstrap…</span></div>
          <div><span className="p1">[you@arch ~]</span>$ <span className="cursor" aria-hidden="true" /></div>
          <p className="seed-note"># every branch above is a command you chose</p>
        </div>

        <div className="garden-ctas">
          <a className="btn btn-primary" href="#cuttings">Take cuttings</a>
          <a className="btn btn-secondary" href="https://wiki.archlinux.org/" target="_blank" rel="noopener noreferrer">Read the wiki</a>
        </div>
      </div>

      <section className="cuttings" id="cuttings">
        <div className="cuttings-head">
          <span className="cuttings-kicker">Cuttings</span>
          <h2>Every feature is a rooted command.</h2>
        </div>
        <div className="cutting-list">
          {CUTTINGS.map((c, i) => (
            <article key={i} className="cutting">
              <div className="cutting-term">
                <div><span className="cmt">{c.cmt}</span></div>
                <div><span className="cmd">{c.cmd}</span></div>
                <div className="out">{c.out}</div>
              </div>
              <div className="cutting-desc">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
