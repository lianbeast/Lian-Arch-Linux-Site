import { useEffect, useRef } from 'react'

/**
 * Read position through the document, for the hairline progress bar.
 *
 * Deliberately self-contained. This value changes every frame, so it must never
 * live in a component that renders the rest of the page — a scroll listener at
 * the root would reconcile the whole tree sixty times a second to move a 2px
 * bar. The bar is written straight to the DOM instead of through state, because
 * a 60Hz value is not something React should be scheduling renders for.
 *
 * scrollHeight is read ONCE on mount and refreshed ONLY on resize (via
 * ResizeObserver). The scroll handler only reads scrollY (cheap, no layout
 * flush) and uses the cached max. This avoids the classic layout-thrashing
 * anti-pattern.
 */
export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let frame = 0
    let max = 0

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight
    }

    const draw = () => {
      frame = 0
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bar.style.transform = `scaleX(${p})`
    }

    // Coalesce bursts of scroll events into one write per frame.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    // The document grows as sections reveal and as results arrive, so the
    // divisor has to be re-measured — but ONLY on resize, not every frame.
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { measure(); schedule() })
      : null
    ro?.observe(document.body)

    const onResize = () => { measure(); schedule() }

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    measure()
    draw()

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="progress" aria-hidden="true">
      <div className="progress-bar" ref={barRef} />
    </div>
  )
}
