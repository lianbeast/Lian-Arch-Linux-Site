import { useEffect, useState } from 'react'

/**
 * Compact mode toggle — persists to localStorage.
 *
 * State is initialized from localStorage via a lazy initializer, so no effect
 * needs to call setState — the effect only applies the value to the DOM.
 *
 * The visible "Compact" text sits INSIDE the label so it is the control's
 * accessible name (WCAG 2.5.3, label in name) rather than a stray sibling.
 */
export default function Tweaks() {
  const [compact, setCompact] = useState(
    () => typeof localStorage !== 'undefined' &&
      localStorage.getItem('arch-compact') === 'true'
  )

  useEffect(() => {
    document.body.dataset.compact = compact ? 'true' : 'false'
  }, [compact])

  const toggle = () => {
    const next = !compact
    setCompact(next)
    localStorage.setItem('arch-compact', next)
  }

  return (
    <div className="tweaks" role="group" aria-label="Display tweaks">
      <label className="tweaks-toggle">
        <span className="tweaks-label">Compact</span>
        <input type="checkbox" checked={compact} onChange={toggle} />
        <span className="tweaks-switch" aria-hidden="true" />
      </label>
    </div>
  )
}
