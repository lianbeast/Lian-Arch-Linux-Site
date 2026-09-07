import { useEffect, useMemo, useRef, useState } from 'react'

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const NEOFETCH_LOGO = [
  '                   -`',
  '                  .o+`               root@archbox',
  '                 `ooo/               -------------',
  '                `+oooo:              OS: Arch Linux x86_64',
  '               `+oooooo:             Kernel: 6.10.5-arch1-1',
  '               -+oooooo+:            Uptime: 3 days, 4 hours',
  '             `/:-:++oooo+:           Packages: 1,247 (pacman)',
  '            `/++++/++++-:++-:`       Shell: zsh 5.9',
  '           `/++++++++++++-:.`        Terminal: kitty 0.36',
  '          `/+++ooooooooooooo/`       DE: Hyprland (Wayland)',
  '         ./ooosssso++osssssso+`      CPU: AMD Ryzen 7 (16) @ 4.7GHz',
  '        .oossssso-````/ossssss+`     GPU: AMD Radeon Graphics',
  '       -osssssso.      :ssssssso.    Memory: 3120MiB / 32000MiB',
  '      :osssssss/        osssso+++/',
  '     /ossssssss/        +ssssooo/-`',
  '   `/ossssso+/:-        -:/+osssso+-`',
  '  `+sso+:-`                 `.-/+oso:',
  ' `++:.                           `-/+:',
  ' .`                                 `:/',
]

// Local package list for pacman -Ss — mirrors repo style, no network
const PKG_DB = [
  { name: 'firefox', repo: 'extra', ver: '129.0.2-1', desc: 'Standalone web browser from Mozilla' },
  { name: 'linux', repo: 'core', ver: '6.10.5-arch1-1', desc: 'The Linux kernel and modules' },
  { name: 'linux-lts', repo: 'core', ver: '6.6.47-1', desc: 'The LTS Linux kernel and modules' },
  { name: 'pacman', repo: 'core', ver: '6.1.0-3', desc: 'A library-based package manager with dependency resolution' },
  { name: 'neovim', repo: 'extra', ver: '0.10.1-1', desc: 'Vim-fork focused on extensibility and agility' },
  { name: 'git', repo: 'extra', ver: '2.46.0-1', desc: 'The fast distributed version control system' },
  { name: 'hyprland', repo: 'extra', ver: '0.42.0-1', desc: 'A dynamic tiling Wayland compositor based on wlroots' },
  { name: 'zsh', repo: 'extra', ver: '5.9-1', desc: 'A very advanced and programmable command interpreter' },
  { name: 'btrfs-progs', repo: 'core', ver: '6.10.1-1', desc: 'Btrfs filesystem utilities' },
  { name: 'docker', repo: 'extra', ver: '27.1.1-1', desc: 'Pack, ship and run any application as a lightweight container' },
]

const HELP_LINES = [
  { kind: 'out', text: 'Built-in commands:' },
  { kind: 'out-dim', text: '  pacman -Syu         full system upgrade (animated)' },
  { kind: 'out-dim', text: '  pacman -Q           list a few installed packages' },
  { kind: 'out-dim', text: '  pacman -Ss <name>   search the package database' },
  { kind: 'out-dim', text: '  neofetch            system info with the Arch logo' },
  { kind: 'out-dim', text: '  uname -a            kernel and architecture info' },
  { kind: 'out-dim', text: '  ls                  list home directory' },
  { kind: 'out-dim', text: '  echo <text>         print text' },
  { kind: 'out-dim', text: '  whoami              current user' },
  { kind: 'out-dim', text: '  uptime              how long this box has been up' },
  { kind: 'out-dim', text: '  man pacman          pacman synopsis' },
  { kind: 'out-dim', text: '  clear               wipe the screen' },
  { kind: 'out-dim', text: '  help                this list' },
  { kind: 'out-dim', text: 'Tab completes a command; up/down walks history.' },
]

const BASE_COMMANDS = {
  'pacman -Q': [
    { kind: 'out', text: 'linux 6.10.5.arch1-1' },
    { kind: 'out', text: 'pacman 6.1.0-3' },
    { kind: 'out', text: 'systemd 256.4-2' },
    { kind: 'out', text: 'wayland 1.23.0-1' },
    { kind: 'out', text: '... 1,247 packages total' },
  ],
  'uname -a': [
    { kind: 'out', text: 'Linux archbox 6.10.5-arch1-1 #1 SMP PREEMPT_DYNAMIC Thu, 08 Aug 2026 20:00:00 +0000 x86_64 GNU/Linux' },
  ],
  neofetch: NEOFETCH_LOGO.map((text, i) => ({ kind: i < 2 ? 'out' : 'out-dim', text })),
  ls: [
    { kind: 'out', text: 'Documents  Downloads  Music  Pictures  Projects  dotfiles' },
  ],
  whoami: [{ kind: 'out', text: 'root' }],
  uptime: [
    { kind: 'out', text: ' 20:41:02 up 3 days,  4:12,  1 user,  load average: 0.42, 0.35, 0.31' },
  ],
  'man pacman': [
    { kind: 'out', text: 'PACMAN(8)                    System Administration                   PACMAN(8)' },
    { kind: 'out-dim', text: '' },
    { kind: 'out', text: 'NAME' },
    { kind: 'out-dim', text: '       pacman - package manager with dependency resolution' },
    { kind: 'out', text: 'SYNOPSIS' },
    { kind: 'out-dim', text: '       pacman <operation> [options] [targets] ...' },
    { kind: 'out-dim', text: '       -S install, -Syu full upgrade, -Ss search, -R remove, -Q query' },
    { kind: 'out-dim', text: '       (Q for more, but honestly the wiki has you covered.)' },
  ],
  help: HELP_LINES,
}

// Animated script for pacman -Syu — rendered line-by-line; bar lines animate
const SYU_SCRIPT = [
  { kind: 'out', text: ':: Synchronizing package databases...', delay: 100 },
  { kind: 'bar', label: 'core', delay: 300 },
  { kind: 'bar', label: 'extra', delay: 300 },
  { kind: 'bar', label: 'multilib', delay: 300 },
  { kind: 'out', text: ':: Starting full system upgrade...', delay: 200 },
  { kind: 'out', text: 'resolving dependencies...' },
  { kind: 'out', text: 'looking for conflicting packages...' },
  { kind: 'out', text: '' },
  { kind: 'out', text: 'Packages (3) linux-6.10.6-1  nvidia-555.58-2  zsh-5.9-2' },
  { kind: 'out', text: '' },
  { kind: 'out', text: 'Total Download Size:   312.42 MiB' },
  { kind: 'out', text: 'Total Installed Size:  1,204.00 MiB' },
  { kind: 'out', text: '' },
  { kind: 'bar', label: 'linux-6.10.6-1', delay: 400 },
  { kind: 'bar', label: 'nvidia-555.58-2', delay: 300 },
  { kind: 'bar', label: 'zsh-5.9-2', delay: 200 },
  { kind: 'out', text: 'checking keys in keyring...', delay: 150 },
  { kind: 'bar', label: 'progress', delay: 300 },
  { kind: 'out', text: 'checking package integrity...' },
  { kind: 'out', text: 'loading package files...' },
  { kind: 'bar', label: 'install', delay: 400 },
  { kind: 'out', text: 'checking for file conflicts...' },
  { kind: 'out', text: 'installing linux...' },
  { kind: 'out', text: 'installing nvidia...' },
  { kind: 'out', text: 'installing zsh...' },
  { kind: 'out', text: ':: Running post-transaction hooks...' },
  { kind: 'out', text: '(1/3) Reloading system manager configuration' },
  { kind: 'out', text: '(2/3) Arming ConditionNeedsUpdate' },
  { kind: 'out', text: '(3/3) Updating module dependencies' },
  { kind: 'out', text: '' },
  { kind: 'out-dim', text: '# upgrade complete — system is current. nothing was held back.' },
]

// Static fallback output for reduced motion: bars become finished bars
const SYU_STATIC = SYU_SCRIPT.map((s) =>
  s.kind === 'bar'
    ? { kind: 'out-dim', text: ` ${s.label.padEnd(18, ' ')} [################] 100%` }
    : s
)

const CHIPS = ['pacman -Syu', 'neofetch', 'pacman -Ss firefox', 'uname -a', 'help']

const BAR_WIDTH = 16

export default function Terminal() {
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [animating, setAnimating] = useState(false)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const histIdxRef = useRef(-1)
  const draftRef = useRef('')
  const timersRef = useRef([])
  const animatingRef = useRef(false)

  const knownCommands = useMemo(() => Object.keys(BASE_COMMANDS), [])

  const scrollDown = () => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }

  useEffect(scrollDown, [lines])

  const appendLines = (out) => {
    setLines((prev) => [...prev, ...out.map((o) => ({ ...o, key: crypto.randomUUID() }))])
  }

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => clearTimers, [])

  // Drive the animated script: reveal lines one by one, animate bar fills
  const runScript = (script) => {
    animatingRef.current = true
    setAnimating(true)
    setLines((prev) => [...prev, ...script.slice(0, 1).map((o) => ({ ...o, key: crypto.randomUUID() }))])
    let t = script[0]?.delay ?? 100
    script.slice(1).forEach((step, i) => {
      const timer = setTimeout(() => {
        if (step.kind === 'bar') {
          // Animate the bar: append a bar line, then grow it over ~600ms
          const lineKey = crypto.randomUUID()
          setLines((prev) => [...prev, { kind: 'bar', label: step.label, progress: 0, key: lineKey }])
          for (let p = 1; p <= BAR_WIDTH; p++) {
            timersRef.current.push(
              setTimeout(() => {
                setLines((prev) => prev.map((l) => (l.key === lineKey ? { ...l, progress: p } : l)))
                if (p === BAR_WIDTH) {
                  if (i === script.length - 2) {
                    animatingRef.current = false
                    setAnimating(false)
                  }
                }
              }, (600 / BAR_WIDTH) * p)
            )
          }
        } else {
          setLines((prev) => [...prev, { ...step, key: crypto.randomUUID() }])
          if (i === script.length - 1) {
            animatingRef.current = false
            setAnimating(false)
          }
        }
      }, t)
      timersRef.current.push(timer)
      t += step.delay ?? 80
    })
    // Safety: if script ended on a bar, the last-index check above may not fire
    const finisher = setTimeout(() => {
      animatingRef.current = false
      setAnimating(false)
    }, t + 800)
    timersRef.current.push(finisher)
  }

  const run = (cmd) => {
    const trimmed = cmd.trim()
    if (!trimmed) return
    if (animatingRef.current) return

    setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]))
    histIdxRef.current = -1
    draftRef.current = ''

    if (trimmed === 'clear') {
      clearTimers()
      setLines([])
      setInput('')
      return
    }

    const promptLine = { kind: 'cmd', text: trimmed }
    setInput('')

    if (trimmed === 'pacman -Syu') {
      setLines((prev) => [...prev, promptLine])
      if (REDUCED_MOTION) appendLines(SYU_STATIC)
      else runScript(SYU_SCRIPT)
      return
    }

    if (trimmed.startsWith('pacman -Ss ')) {
      const term = trimmed.slice('pacman -Ss '.length).trim()
      const hits = term
        ? PKG_DB.filter((p) => p.name.includes(term) || p.desc.toLowerCase().includes(term.toLowerCase()))
        : PKG_DB
      appendLines([promptLine, ...renderSearch(hits, term)])
      return
    }

    if (trimmed.startsWith('echo ')) {
      appendLines([promptLine, { kind: 'out', text: trimmed.slice(5) }])
      return
    }

    const out = BASE_COMMANDS[trimmed] ?? [{ kind: 'out-dim', text: `bash: ${trimmed}: command not found` }]
    appendLines([promptLine, ...out.map((o) => ({ ...o }))])
  }

  const renderSearch = (hits, term) => {
    if (!hits.length) {
      return [{ kind: 'out-dim', text: `no packages matched "${term}" in this demo database — the live search section below covers all 80k` }]
    }
    return hits.flatMap((p) => [
      { kind: 'out', text: `${p.repo}/${p.name} ${p.ver}` },
      { kind: 'out-dim', text: `    ${p.desc}` },
    ])
  }

  // Ghost autocomplete: longest known command that starts with input
  const ghost = useMemo(() => {
    if (!input) return ''
    const match = knownCommands.find((c) => c.startsWith(input) && c !== input)
    return match ? match.slice(input.length) : ''
  }, [input, knownCommands])

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(input)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (ghost) {
        setInput((prev) => prev + ghost)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      if (histIdxRef.current === -1) {
        draftRef.current = input
        histIdxRef.current = history.length - 1
      } else {
        histIdxRef.current = Math.max(0, histIdxRef.current - 1)
      }
      setInput(history[histIdxRef.current])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdxRef.current === -1) return
      histIdxRef.current++
      if (histIdxRef.current >= history.length) {
        histIdxRef.current = -1
        setInput(draftRef.current)
      } else {
        setInput(history[histIdxRef.current])
      }
    }
  }

  const focusInput = () => inputRef.current?.focus()

  const renderLine = (l) => {
    if (l.kind === 'cmd') {
      return (
        <div className="terminal-line">
          <span className="terminal-prompt">$</span>
          <span className="terminal-out">{l.text}</span>
        </div>
      )
    }
    if (l.kind === 'bar') {
      const filled = '#'.repeat(l.progress || 0).padEnd(BAR_WIDTH, ' ')
      return (
        <div className="terminal-line terminal-out-dim">
          {` ${l.label.padEnd(18, ' ')} [${filled}] ${Math.round(((l.progress || 0) / BAR_WIDTH) * 100)}%`}
        </div>
      )
    }
    return <div className={`terminal-line terminal-${l.kind}`}>{l.text}</div>
  }

  return (
    <section id="terminal" className="section" aria-label="Interactive terminal">
      <div className="section-header reveal">
        <p className="section-tag">Interactive</p>
        <h2 className="section-title">The terminal front door</h2>
        <p className="section-lead">
          Click the window, type a command, or pick a chip. Tab completes,
          arrows walk history. Real output, no pointer needed.
        </p>
      </div>
      <div className="terminal-wrapper reveal">
        <div
          className="terminal"
          role="region"
          aria-label="Arch Linux terminal"
          onClick={focusInput}
        >
          <div className="terminal-header">
            <span className="terminal-dot red" aria-hidden="true" />
            <span className="terminal-dot yellow" aria-hidden="true" />
            <span className="terminal-dot green" aria-hidden="true" />
            <span className="terminal-title">root@archbox:~</span>
          </div>
          <div className="terminal-body" ref={bodyRef}>
            {lines.map((l) => <div key={l.key}>{renderLine(l)}</div>)}
            <div className="terminal-line terminal-input-row">
              <span className="terminal-prompt">$</span>
              <span className="terminal-input-wrap">
                {ghost && (
                  <span
                    className="terminal-ghost"
                    aria-hidden="true"
                    style={{ left: `${input.length}ch` }}
                  >
                    {ghost}
                  </span>
                )}
                <input
                  ref={inputRef}
                  className="terminal-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="type a command…"
                  aria-label="Terminal input"
                  disabled={animating}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </span>
              <span className="terminal-cursor" aria-hidden="true" />
            </div>
          </div>
          <div className="terminal-chips" aria-label="Quick commands">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className="terminal-chip"
                onClick={(e) => {
                  e.stopPropagation()
                  run(c)
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
