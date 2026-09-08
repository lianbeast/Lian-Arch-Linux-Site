// Mockup 05: hero as a tiling WM. Status bar fixed; workspace 1 splits master/ssh/htop.
// Workspace 2 shows feature windows. $mod+j/k navigate tiles.
import { useEffect, useRef, useState } from 'react'

const METERS = [
  { lbl: 'CPU', w: '12%' },
  { lbl: 'MEM', w: '6%' },
  { lbl: 'SRV', w: '4' },
]

const SSH_LINES = [
  { delay: '0.3s', html: '<span class="prompt">[root@your-box ~]#</span> uptime' },
  { delay: '0.9s', html: '  00:00:01 up 41 days, load average: 0.24, 0.31, 0.19' },
  { delay: '1.6s', html: '<span class="prompt">[root@your-box ~]#</span> pacman -Syu' },
  { delay: '2.2s', html: '<span class="ok">:: Synchronizing package databases…</span>' },
  { delay: '2.9s', html: '<span class="ok">:: Starting full system upgrade… nothing to do (you were current already)</span>' },
]

const FEATURE_TILES = [
  {
    titlebar: 'rolling-release.txt',
    mode: 'vim',
    title: 'Rolling release',
    desc: 'One command, always current. Your pkgver is today\'s date, every day.',
    cmd: '$ pacman -Syu',
  },
  {
    titlebar: 'minimal-base.txt',
    mode: 'vim',
    title: 'Minimal base',
    desc: 'The install boots to a shell. What it becomes is entirely your configuration.',
    cmd: '$ pacstrap /mnt base linux',
  },
  {
    titlebar: 'aur.txt',
    mode: 'vim',
    title: 'AUR, 80,000+',
    desc: 'Community build recipes in plain text. Read first, build second, trust always earned.',
    cmd: '$ makepkg -si',
  },
  {
    titlebar: 'wiki.txt',
    mode: 'firefox',
    title: 'The wiki',
    desc: 'Documentation precise enough that other distros link to it. The manual IS the distro.',
    cmd: '$ xdg-open https://wiki.archlinux.org',
  },
]

export default function TilingHero() {
  const tilesRef = useRef([])
  const [focusedIdx, setFocusedIdx] = useState(0)

  // $mod = Alt key navigation between tiles
  useEffect(() => {
    const tiles = tilesRef.current
    const focus = (i) => {
      tiles.forEach(t => t.classList.remove('focused'))
      tiles[i]?.classList.add('focused')
      setFocusedIdx(i)
    }
    const onKeyDown = (e) => {
      if (!e.altKey) return
      if (e.key === 'j') { focus(Math.min(focusedIdx + 1, tiles.length - 1)); e.preventDefault() }
      if (e.key === 'k') { focus(Math.max(focusedIdx - 1, 0)); e.preventDefault() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusedIdx])

  const registerTile = (i, el) => { tilesRef.current[i] = el }

  return (
    <section id="home" className="section hero tiling-hero" aria-label="Hero">
      {/* Status bar: fixed top, shows workspace tabs, system stats */}
      <nav className="statusbar" role="navigation" aria-label="Window manager status bar">
        <span className="bar-title">i3 · arch</span>
        <div className="ws-tabs" role="tablist" aria-label="Workspaces">
          <button className="ws-tab active" role="tab" aria-selected="true">1: main</button>
          <a className="ws-tab" href="#features" role="tab" aria-selected="false">2: why</a>
        </div>
        <span className="bar-right">
          <span>eth0 <span className="accent">▲</span></span>
          <span>mem 2.1G/32G</span>
          <span className="accent">2026-09-08 00:00</span>
        </span>
      </nav>

      {/* Workspace 1: hero tiles */}
      <div className="workspace ws-hero" id="home">
        {/* Master tile: left, full height */}
        <section className="tile tile-master" aria-label="Arch Linux introduction" ref={(el) => registerTile(0, el)} tabIndex={-1}>
          <div className="tile-titlebar">
            <span>~ : zsh — 132×37</span>
            <span className="mode">[$mod+1]</span>
          </div>
          <div className="master-body">
            <h1>Arch <span className="mod">Linux</span></h1>
            <p>The window manager stays out of the way. So does everything else. A rolling-release distribution where you place every tile, run every service, and nothing occupies memory you didn't allocate.</p>
            <div className="master-ctas">
              <a className="btn btn-primary" href="#features">Open workspace 2</a>
              <a className="btn btn-secondary" href="https://wiki.archlinux.org/" target="_blank" rel="noopener noreferrer">Read the wiki</a>
            </div>
            <p className="keyhint">hint: like this page, the whole system is <kbd>$mod</kbd> + your choice. Nothing grabs focus you didn't give it.</p>
          </div>
        </section>

        {/* SSH tile: top right, fake live session */}
        <section className="tile tile-ssh" aria-label="Live session" ref={(el) => registerTile(1, el)} tabIndex={-1}>
          <div className="tile-titlebar">
            <span>ssh: root@your-box</span>
            <span className="mode">term</span>
          </div>
          <div className="ssh-body">
            {SSH_LINES.map((line, i) => (
              <div key={i} className="ssh-line" style={{ animationDelay: line.delay }} dangerouslySetInnerHTML={{ __html: line.html }} />
            ))}
          </div>
        </section>

        {/* htop tile: bottom right, meters */}
        <section className="tile tile-htop" aria-label="System meters" ref={(el) => registerTile(2, el)} tabIndex={-1}>
          <div className="tile-titlebar">
            <span>htop</span>
            <span className="mode">[F10 quit]</span>
          </div>
          <div className="htop-body">
            {METERS.map((m, i) => (
              <div key={i} className="meter">
                <span className="lbl">{m.lbl}</span>
                <span className="meter-track">
                  <span className="meter-fill" style={{ '--w': m.w }} />
                </span>
                <span className="pct">{m.w}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Workspace 2: feature windows */}
      <div className="workspace ws-features" id="features">
        <span className="ws-features-label">Workspace 2 — reasons</span>
        {FEATURE_TILES.map((t, i) => (
          <article key={i} className="tile" ref={(el) => registerTile(i + 3, el)} tabIndex={-1}>
            <div className="tile-titlebar">
              <span>{t.titlebar}</span>
              <span className="mode">{t.mode}</span>
            </div>
            <div className="win-body">
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <span className="win-cmd">{t.cmd}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}