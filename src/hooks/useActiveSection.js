import { useEffect, useState } from 'react'
import { SECTIONS, NAV_LINKS } from '../utils/constants'

/**
 * Highlights the nav item for whichever section currently owns the viewport.
 *
 * Only the linked sections are observed. Watching all of SECTIONS meant that
 * scrolling through history, packages or download matched nothing, so the
 * marker blinked off and on again as you passed through — a glitch, not a
 * signal. With just the nav targets observed, the last one you were in stays
 * current until the next nav target takes over.
 *
 * `SECTIONS[0]` ("home") is the initial value: no nav link is current while the
 * reader is still on the hero.
 */
export default function useActiveSection() {
  const [active, setActive] = useState(SECTIONS[0])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id)
      })
    }, { threshold: 0.4, rootMargin: '-20% 0px -60% 0px' })

    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return active
}
