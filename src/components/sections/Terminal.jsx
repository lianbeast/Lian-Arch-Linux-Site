import { useEffect, useRef, useState } from 'react'

const commands = {
  'pacman -Syu': [
    { kind: 'out', text: ':: Synchronizing package databases...' },
    { kind: 'out-dim', text: ' core            142.3 KiB   1.4 MiB/s 00:00 [################] 100%' },
    { kind: 'out-dim', text: ' extra          1831.8 KiB   3.2 MiB/s 00:00 [################] 100%' },
    { kind: 'out-dim', text: ' multilib       184.2 KiB   2.8 MiB/s 00:00 [################] 100%' },
    { kind: 'out', text: ':: Starting full system upgrade...' },
    { kind: 'out', text: ' there is nothing to do' },
  ],
  'pacman -Q': [
    { kind: 'out', text: 'linux 6.10.5.arch1-1' },
    { kind: 'out', text: 'pacman 6.1.0-3' },
    { kind: 'out', text: 'systemd 256.4-2' },
    { kind: 'out', text: 'wayland 1.23.0-1' },
    { kind: 'out', text: '... 1,247 packages total' },
  ],
  'yay -Ss': [
    { kind: 'out', text: 'aur/visual-studio-code-bin 1.92.1-1 (+42 3.41)' },
    { kind: 'out-dim', text: '    Visual Studio Code (binary)' },
    { kind: 'out', text: 'aur/spotify 1.2.13.661.ga58f7f2f-1 (+18 2.07)' },
    { kind: 'out-dim', text: '    A proprietary music streaming service' },
    { kind: 'out', text: 'aur/discord 0.0.62-1 (+188 5.24)' },
    { kind: 'out-dim', text: '    All-in-one voice and text chat' },
  ],
  'cat /etc/os-release': [
    { kind: 'out', text: 'NAME="Arch Linux"' },
    { kind: 'out', text: 'PRETTY_NAME="Arch Linux"' },
    { kind: 'out', text: 'ID=arch' },
    { kind: 'out', text: 'BUILD_ID=rolling' },
    { kind: 'out', text: 'SUPPORTED=true' },
    { kind: 'out', text: 'HOME_URL="https://archlinux.org/"' },
    { kind: 'out', text: 'DOCUMENTATION_URL="https://wiki.archlinux.org/"' },
  ],
  'uname -a': [
    { kind: 'out', text: 'Linux archbox 6.10.5-arch1-1 #1 SMP PREEMPT_DYNAMIC...' },
  ],
  clear: [],
}

const chips = Object.keys(commands)

export default function Terminal() {
  const [lines, setLines] = useState([{ kind: 'out-dim', text: 'Type a command, or click a chip below.' }])
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  const run = (cmd) => {
    const trimmed = cmd.trim()
    if (!trimmed) return
    if (trimmed === 'clear') {
      setLines([])
      setInput('')
      return
    }
    const out = commands[trimmed] ?? [{ kind: 'out-dim', text: `bash: ${trimmed}: command not found` }]
    setLines((prev) => [...prev, { kind: 'cmd', text: trimmed }, ...out.map((o) => ({ ...o, key: crypto.randomUUID() }))])
    setInput('')
  }

  const focusInput = () => inputRef.current?.focus()

  return (
    <section id="terminal" className="section" aria-label="Interactive terminal">
      <div className="section-header reveal">
        <h2 className="section-title">The terminal is the front door</h2>
        <p className="section-lead">
          Click the window, type a command, or pick a chip. Real output is not the
          point. The feel is.
        </p>
      </div>
      <div
        className="terminal reveal"
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
          {lines.map((l, i) => {
            if (l.kind === 'cmd') {
              return (
                <div key={i} className="terminal-line">
                  <span className="terminal-prompt">$</span>
                  <span className="terminal-out">{l.text}</span>
                </div>
              )
            }
            return (
              <div key={i} className={`terminal-line terminal-${l.kind}`}>
                {l.text}
              </div>
            )
          })}
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run(input)
              }}
              spellCheck="false"
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
        <div className="terminal-chips" role="toolbar" aria-label="Quick commands">
          {chips.map((c) => (
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
    </section>
  )
}