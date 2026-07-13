import { useState, useEffect, useRef, useCallback } from 'react'
import './BootSequence.css'

const BIOS_LINES = [
  'BIOS Version: ArchLinux-UEFI v2.1',
  'CPU: x86_64 Architecture Detected',
  'RAM: 16384 MB DDR5 @ 4800MHz',
  'Storage: NVMe SSD 1TB detected',
  'GPU: WebGL 3.0 capable',
  '',
]

const KERNEL_LINES = [
  '[    0.000000] Linux version 6.14.6-arch1-1',
  '[    0.004102] Command line: BOOT_IMAGE=/vmlinuz-linux',
  '[    0.102341] BIOS-provided physical RAM map:',
  '[    0.102345] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable',
  '[    0.241876] NX (Execute Disable) protection: active',
  '[    0.487213] ACPI: All SSDT tables successfully acquired',
  '[    0.621549] PCI: Using configuration type 1 for base access',
  '[    0.814327] CPU: 12 Core(s), 24 Thread(s) @ 5.2GHz',
  '[    1.023654] Memory: 16384MB available',
  '[    1.247891] systemd[1]: Detected architecture x86-64.',
  '[    1.487213] systemd[1]: Hostname set to <archlinux>.',
  '',
  '[    1.823456] systemd[1]: Starting Journal Service...',
  '[    2.014567] systemd[1]: Starting Network Manager...',
  '[    2.236789] systemd[1]: Starting SSH Daemon...',
  '[    2.458901] systemd[1]: Starting Wayland Compositor...',
  '',
  '[    2.671234] systemd[1]: Reached target Graphical Interface.',
  '[    2.894567] systemd[1]: Starting TLP system startup...',
  '',
]

const ARCH_ASCII = [
  '                  -`                  ',
  '                 .o+`                 ',
  '                 `ooo/                 ',
  '                `+oooo:                ',
  '               `+oooooo:               ',
  '               -+oooooo+:             ',
  '             `/:-:++oooo+:            ',
  '            `/++++/+++++++:`           ',
  '           `/++++++++++++++:          ',
  '          `/+++ooooooooooooo/`        ',
  '         ./ooosssso++osssssso+`       ',
  '        .oossssso-````/ossssss+`      ',
  '       -osssssso.      :ssssssso.     ',
  '      :osssssss/        osssso+++.    ',
  '     /ossssssss/        +ssssooo/-    ',
  '   `/ossssso+/:-        -:/+osssso+-  ',
  '  `+sso+:-`                 `.-/+oso: ',
  ' `++:.                           `-/+.',
  ' .`                                 `/',
]

const WELCOME_TEXT = 'Welcome to Arch Linux'
const BOOT_COMPLETE = '[  COMPLETE  ] System initialized. Loading interface...'

export default function BootSequence({ onComplete }) {
  const [phase, setPhase] = useState('cursor') // cursor -> bios -> kernel -> ascii -> welcome -> glitch -> done
  const [lines, setLines] = useState([])
  const [asciiLines, setAsciiLines] = useState([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [completeLine, setCompleteLine] = useState('')
  const containerRef = useRef(null)
  const lineIndex = useRef(0)
  const charIndex = useRef(0)
  const timerRef = useRef(null)

  // Blinking cursor
  useEffect(() => {
    const iv = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(iv)
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines, asciiLines, completeLine])

  // Phase 1: Cursor blink then start BIOS
  useEffect(() => {
    if (phase === 'cursor') {
      const t = setTimeout(() => setPhase('bios'), 1200)
      return () => clearTimeout(t)
    }
  }, [phase])

  // Phase 2: BIOS text typing
  useEffect(() => {
    if (phase !== 'bios') return
    lineIndex.current = 0
    charIndex.current = 0
    setLines([])

    const typeLine = () => {
      if (lineIndex.current >= BIOS_LINES.length) {
        setTimeout(() => setPhase('kernel'), 400)
        return
      }
      const line = BIOS_LINES[lineIndex.current]
      if (charIndex.current <= line.length) {
        setLines(prev => {
          const next = [...prev]
          next[lineIndex.current] = line.slice(0, charIndex.current)
          return next
        })
        charIndex.current++
        timerRef.current = setTimeout(typeLine, 12 + Math.random() * 8)
      } else {
        lineIndex.current++
        charIndex.current = 0
        timerRef.current = setTimeout(typeLine, 30)
      }
    }
    typeLine()
    return () => clearTimeout(timerRef.current)
  }, [phase])

  // Phase 3: Kernel messages (fast scroll)
  useEffect(() => {
    if (phase !== 'kernel') return
    lineIndex.current = 0
    setLines([...BIOS_LINES])

    const addLine = () => {
      if (lineIndex.current >= KERNEL_LINES.length) {
        setTimeout(() => setPhase('ascii'), 300)
        return
      }
      const line = KERNEL_LINES[lineIndex.current]
      if (line.startsWith('[')) {
        // Typing effect for status lines
        let ci = 0
        const typeChar = () => {
          if (ci <= line.length) {
            setLines(prev => {
              const next = [...prev]
              next[BIOS_LINES.length + lineIndex.current] = line.slice(0, ci)
              return next
            })
            ci++
            timerRef.current = setTimeout(typeChar, 6 + Math.random() * 4)
          } else {
            lineIndex.current++
            timerRef.current = setTimeout(addLine, 15)
          }
        }
        typeChar()
      } else {
        // Instant for blank lines
        setLines(prev => [...prev, line])
        lineIndex.current++
        timerRef.current = setTimeout(addLine, 20)
      }
    }
    addLine()
    return () => clearTimeout(timerRef.current)
  }, [phase])

  // Phase 4: ASCII art line-by-line
  useEffect(() => {
    if (phase !== 'ascii') return
    lineIndex.current = 0
    setAsciiLines([])

    const addAsciiLine = () => {
      if (lineIndex.current >= ARCH_ASCII.length) {
        setTimeout(() => setPhase('welcome'), 400)
        return
      }
      setAsciiLines(prev => [...prev, ARCH_ASCII[lineIndex.current]])
      lineIndex.current++
      timerRef.current = setTimeout(addAsciiLine, 40)
    }
    addAsciiLine()
    return () => clearTimeout(timerRef.current)
  }, [phase])

  // Phase 5: Welcome flash
  useEffect(() => {
    if (phase !== 'welcome') return
    setShowWelcome(true)
    const t = setTimeout(() => setPhase('glitch'), 1000)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 6: Glitch + complete message
  useEffect(() => {
    if (phase !== 'glitch') return
    setGlitching(true)
    let ci = 0
    const typeComplete = () => {
      if (ci <= BOOT_COMPLETE.length) {
        setCompleteLine(BOOT_COMPLETE.slice(0, ci))
        ci++
        timerRef.current = setTimeout(typeComplete, 20)
      } else {
        setTimeout(() => onComplete(), 800)
      }
    }
    const t = setTimeout(typeComplete, 600)
    return () => { clearTimeout(t); clearTimeout(timerRef.current) }
  }, [phase, onComplete])

  const totalLines = [...lines, ...asciiLines].filter(l => l !== undefined && l !== null)
  if (completeLine) totalLines.push(completeLine)

  return (
    <div className={`boot-sequence ${glitching ? 'glitch-active' : ''}`}>
      <div className="crt-overlay" />
      <div className="scanlines" />
      <div className="vignette" />

      {phase !== 'done' && (
        <button
          onClick={() => { clearTimeout(timerRef.current); onComplete() }}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'none', border: '1px solid rgba(23,147,209,0.3)',
            color: '#6b8aad', padding: '4px 12px', borderRadius: 4,
            fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer',
            zIndex: 10, opacity: 0.7, transition: 'opacity 0.3s',
          }}
        >
          Skip →
        </button>
      )}

      <div className="boot-terminal" ref={containerRef}>
        {totalLines.map((line, i) => {
          const isOk = line.includes('[  OK  ]') || line.includes('[  COMPLETE  ]')
          const isFailed = line.includes('[FAILED]')
          const isAscii = i >= lines.length
          return (
            <div
              key={i}
              className={`boot-line ${isOk ? 'ok' : ''} ${isFailed ? 'failed' : ''} ${isAscii ? 'ascii' : ''}`}
            >
              {line}
            </div>
          )
        })}
        {phase !== 'done' && (
          <span className={`boot-cursor ${cursorVisible ? 'visible' : ''}`}>_</span>
        )}
      </div>

      {showWelcome && (
        <div className="welcome-flash">
          <h1>{WELCOME_TEXT}</h1>
        </div>
      )}
    </div>
  )
}
