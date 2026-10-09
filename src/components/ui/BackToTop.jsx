import { useEffect, useState } from 'react'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'

/** Appears once the reader is deep enough that scrolling back is a chore. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    let frame = 0
    const measure = () => setVisible(window.scrollY > window.innerHeight * 1.5)
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => { measure(); frame = 0 })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Deferred, not called inline: a synchronous setState in an effect body
    // cascades a render on mount for no reason.
    frame = requestAnimationFrame(() => { measure(); frame = 0 })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      className={`to-top${visible ? ' is-visible' : ''}`}
      // Hidden from assistive tech and out of the tab order while it is not
      // on screen — an invisible control that steals focus is a bug.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      aria-label="Back to top"
      onClick={() => window.scrollTo({
        top: 0,
        behavior: reduced ? 'auto' : 'smooth',
      })}
    >
      ↑
    </button>
  )
}
