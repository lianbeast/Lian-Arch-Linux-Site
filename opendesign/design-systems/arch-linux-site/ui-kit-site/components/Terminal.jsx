// Production .terminal — #08090d body, colored dots, mono output, focusable input.
// Static recreation of src/components/sections/Terminal.jsx for the kit showcase.
export function Terminal({ lines = [] }) {
  return (
    <div className="terminal-wrapper">
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">you@arch ~</span>
        </div>
        <div className="terminal-body">
          {lines.map((l, i) => (
            <div key={i} className="terminal-line">{l}</div>
          ))}
          <div className="terminal-input-row">
            <span className="terminal-prompt">[you@arch ~]$</span>
            <span className="terminal-cursor" aria-hidden="true" />
          </div>
        </div>
        <div className="terminal-chips">
          <button className="terminal-chip">pacman -Syu</button>
          <button className="terminal-chip">neofetch</button>
          <button className="terminal-chip">uname -r</button>
        </div>
      </div>
    </div>
  )
}
