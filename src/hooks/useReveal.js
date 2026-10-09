import { useEffect } from 'react'

/**
 * Reveal-on-scroll, as a progressive enhancement.
 *
 * If IntersectionObserver is missing, every element is revealed immediately.
 * Content that is invisible without JavaScript is a bug, not a design.
 */
export default function useReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-stagger')

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('revealed'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' })

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
