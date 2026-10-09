import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Live `prefers-reduced-motion` preference.
 *
 * Reading matchMedia once at module load — which is what this app used to do —
 * goes stale the moment the reader flips the setting. Subscribing to `change`
 * keeps every consumer (nav scroll behaviour, back-to-top, the terminal's
 * static fallback) in step with the backdrop, which already listened.
 *
 * The initial value is read lazily during the first render so the first paint
 * is already correct; the effect only wires up the listener.
 */
export default function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true
  )

  useEffect(() => {
    const mq = window.matchMedia?.(QUERY)
    if (!mq) return
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
