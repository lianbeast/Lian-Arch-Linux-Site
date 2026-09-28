import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * In-page shell. Everything is parsed locally — no network, no state leaves
 * the browser. Reduced motion gets the same output as static text instead of
 * a suppressed animation, so the feature never silently disappears.
 */

/* Keys are a module-level counter rather than crypto.randomUUID(), which is
   only defined in a secure context. This page must work on plain HTTP too. */
let uid = 0
const nextKey = () => `l${++uid}`

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

/* Mirrors real pacman output shape. Local table — nothing is fetched. */
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
    { kind: 'out', text: 'Linux archbox 6.10.5-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux' },
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
    { kind: 'out', text: 'PACMAN(8)              System Administration              PACMAN(8)' },
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
  { kind: 'out-ok', text: '# upgrade complete - system is current. nothing was held back.' },
]

const SYU_STATIC = SYU_SCRIPT.map((s) =>
  s.kind === 'bar'
    ? { kind: 'out-dim', text: ` ${s.label.padEnd(18, ' ')} [################] 100%` }
    : s
)

const CHIPS = ['pacman -Syu', 'neofetch', 'pacman -Ss firefox', 'uname -a', 'help']
const BAR_WIDTH = 16
const REDUCED = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Announced once when the animated upgrade lands, in place of the ~130 live
   region updates the animation itself would otherwise produce. */
const SYU_SUMMARY = 'Upgrade complete. Three packages upgraded, nothing held back.'

export default function Terminal() {
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [animating, setAnimating] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const histIdxRef = useRef(-1)
  const draftRef = useRef('')
  const timersRef = useRef([])
  const animatingRef = useRef(false)

  const knownCommands = useMemo(() => Object.keys(BASE_COMMANDS), [])

  const appendLines = (out) => {
    setLines((prev) => [...prev, ...out.map((o) => ({ ...o, key: nextKey() }))])
  }

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => clearTimers, [])

  /* Follow new output, but respect a reduced-motion preference. */
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: REDUCED ? 'auto' : 'smooth' })
  }, [lines])

  /**
   * Close out a scripted run.
   *
   * The line-by-line output is deliberately NOT announced while the script is
   * playing — the log goes quiet (see the `aria-live` binding below) and this
   * single summary is announced instead. A live region that fires ~130 times in
   * four seconds is not communication, it is noise.
   */
  const finishScript = (summary) => {
    animatingRef.current = false
    setAnimating(false)
    setLiveMessage(summary)
  }

  const runScript = (script, summary) => {
    animatingRef.current = true
    setAnimating(true)
    setLiveMessage('')
    setLines((prev) => [...prev, { ...script[0], key: nextKey() }])

    let t = script[0]?.delay ?? 100
    script.slice(1).forEach((step, i) => {
      timersRef.current.push(setTimeout(() => {
        if (step.kind === 'bar') {
          const lineKey = nextKey()
          setLines((prev) => [...prev, { kind: 'bar', label: step.label, progress: 0, key: lineKey }])
          for (let p = 1; p <= BAR_WIDTH; p++) {
            timersRef.current.push(setTimeout(() => {
              setLines((prev) => prev.map((l) => (l.key === lineKey ? { ...l, progress: p } : l)))
            }, (600 / BAR_WIDTH) * p))
          }
        } else {
          setLines((prev) => [...prev, { ...step, key: nextKey() }])
        }
        if (i === script.length - 2) finishScript(summary)
      }, t))
      t += step.delay ?? 80
    })

    /* Safety net: if the script ends on a bar line the check above never fires.
       Calling this twice is harmless — the second call sets an identical string,
       so React bails out and nothing is announced a second time. */
    timersRef.current.push(setTimeout(() => finishScript(summary), t + 800))
  }

  const renderSearch = (hits, term) => {
    if (!hits.length) {
      return [{
        kind: 'out-dim',
        text: `no packages matched "${term}" in this demo database - the live search section below covers the real index`,
      }]
    }
    return hits.flatMap((p) => [
      { kind: 'out', text: `${p.repo}/${p.name} ${p.ver}` },
      { kind: 'out-dim', text: `    ${p.desc}` },
    ])
  }

  const run = (raw) => {
    const cmd = raw.trim()
    if (!cmd || animatingRef.current) return

    setHistory((prev) => (prev[prev.length - 1] === cmd ? prev : [...prev, cmd]))
    histIdxRef.current = -1
    draftRef.current = ''
    setInput('')
    setLiveMessage('')

    if (cmd === 'clear') {
      clearTimers()
      setLines([])
      return
    }

    const prompt = { kind: 'cmd', text: cmd }

    if (cmd === 'pacman -Syu') {
      setLines((prev) => [...prev, prompt])
      /* Reduced motion appends the whole transcript at once, so it is announced
         as a batch and needs no separate summary. The animated path is the one
         that has to be summarised. */
      if (REDUCED) appendLines(SYU_STATIC)
      else runScript(SYU_SCRIPT, SYU_SUMMARY)
      return
    }

    if (cmd.startsWith('pacman -Ss ')) {
      const term = cmd.slice('pacman -Ss '.length).trim()
      const hits = term
        ? PKG_DB.filter((p) =>
            p.name.includes(term) || p.desc.toLowerCase().includes(term.toLowerCase()))
        : PKG_DB
      appendLines([prompt, ...renderSearch(hits, term)])
      return
    }

    if (cmd.startsWith('echo ')) {
      appendLines([prompt, { kind: 'out', text: cmd.slice(5) }])
      return
    }

    const out = BASE_COMMANDS[cmd] ?? [{ kind: 'out-dim', text: `bash: ${cmd}: command not found` }]
    appendLines([prompt, ...out])
  }

  /* Ghost completion: longest known command that extends what is typed. */
  const ghost = useMemo(() => {
    if (!input) return ''
    const match = knownCommands.find((c) => c.startsWith(input) && c !== input)
    return match ? match.slice(input.length) : ''
  }, [input, knownCommands])

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      run(input)
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      if (ghost) setInput((prev) => prev + ghost)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      if (histIdxRef.current === -1) {
        draftRef.current = input
        histIdxRef.current = history.length - 1
      } else {
        histIdxRef.current = Math.max(0, histIdxRef.current - 1)
      }
      setInput(history[histIdxRef.current])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdxRef.current === -1) return
      histIdxRef.current += 1
      if (histIdxRef.current >= history.length) {
        histIdxRef.current = -1
        setInput(draftRef.current)
      } else {
        setInput(history[histIdxRef.current])
      }
    }
  }

  const renderLine = (l) => {
    if (l.kind === 'cmd') {
      return (
        <div className="term-line">
          <span className="term-prompt">$</span>
          <span className="term-out">{l.text}</span>
        </div>
      )
    }
    if (l.kind === 'bar') {
      const filled = '#'.repeat(l.progress || 0).padEnd(BAR_WIDTH, ' ')
      const pct = Math.round(((l.progress || 0) / BAR_WIDTH) * 100)
      /* Decorative: a progress bar that is re-rendered sixteen times per package
         has nothing to say to a screen reader. */
      return (
        <div className="term-line term-out-dim" aria-hidden="true">
          {` ${l.label.padEnd(18, ' ')} [${filled}] ${pct}%`}
        </div>
      )
    }
    const cls = l.kind === 'out-ok' ? 'term-ok' : `term-${l.kind}`
    return <div className={`term-line ${cls}`}>{l.text}</div>
  }

  return (
    <section id="terminal" className="sec" aria-labelledby="terminal-title">
      <header className="sec-head">
        <p className="sec-name">terminal</p>
        <h2 id="terminal-title" className="sec-title">
          The terminal front door
        </h2>
        <p className="sec-lead">
          Click the window, type a command, or pick a chip. Tab completes,
          arrows walk history. Every response is generated locally.
        </p>
      </header>

      <div className="term reveal">
        <div className="term-bar">
          <span>root@archbox:~</span>
        </div>

        <div
          className="term-body"
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
        >
          {/* The live region wraps only the output. Putting it around the
              input too would make every keystroke a potential announcement.
              It also goes quiet while a scripted command plays, so the reader
              gets one summary instead of a hundred partial lines. */}
          <div
            role="log"
            aria-live={animating ? 'off' : 'polite'}
            aria-label="Terminal output"
          >
            {lines.map((l) => <div key={l.key}>{renderLine(l)}</div>)}
          </div>

          <div className="term-line term-input-row">
            <span className="term-prompt">$</span>
            <span className="term-input-wrap">
              {ghost && (
                <span className="term-ghost" aria-hidden="true" style={{ left: `${input.length}ch` }}>
                  {ghost}
                </span>
              )}
              <input
                ref={inputRef}
                className="term-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="type a command"
                aria-label="Terminal command input"
                readOnly={animating}
                aria-busy={animating}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </span>
            <span className="term-cursor" aria-hidden="true" />
          </div>
        </div>

        {/* Deliberately outside the log: this is the only thing a screen reader
            hears for a scripted command, so it must not be suppressed with it. */}
        <p className="sr-only" role="status">{liveMessage}</p>

        <div className="term-chips" role="group" aria-label="Quick commands">
          {CHIPS.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => run(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
