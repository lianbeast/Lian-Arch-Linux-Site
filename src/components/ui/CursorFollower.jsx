import { useRef, useEffect, useState, memo } from 'react'

const TRAIL_COUNT = 3
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)

function CursorFollower() {
  const [visible, setVisible] = useState(false)
  const mouse = useRef({ x: -100, y: -100 })
  const pos = useRef({ x: -100, y: -100 })
  const trail = useRef(Array(TRAIL_COUNT).fill(null).map(() => ({ x: -100, y: -100 })))
  const refs = useRef({
    dot: null,
    ring: null,
    trail: [],
  })

  // Track mouse via ref — no React state updates, no re-renders
  useEffect(() => {
    if (isTouchDevice()) return
    const handleMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (!visible) setVisible(true)
    }
    const handleLeave = () => setVisible(false)
    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [visible])

  useEffect(() => {
    if (isTouchDevice()) return
    let raf
    const animate = () => {
      const { x, y } = mouse.current
      pos.current.x += (x - pos.current.x) * 0.15
      pos.current.y += (y - pos.current.y) * 0.15

      for (let i = TRAIL_COUNT - 1; i > 0; i--) {
        trail.current[i] = { ...trail.current[i - 1] }
      }
      trail.current[0] = { ...pos.current }

      const { dot, ring, trail: trailEls } = refs.current
      if (dot) {
        dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
      }
      if (ring) {
        ring.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      }
      trailEls.current?.forEach((el, i) => {
        if (el) {
          const t = trail.current[i]
          el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`
        }
      })

      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (isTouchDevice()) return null

  return (
    <>
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (refs.current.trail) refs.current.trail[i] = el }}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: 4 - i * 0.6,
            height: 4 - i * 0.6,
            borderRadius: '50%',
            background: 'var(--cursor-trail)',
            opacity: (1 - i / TRAIL_COUNT) * 0.3,
            pointerEvents: 'none',
            zIndex: 1000,
            willChange: 'transform',
          }}
        />
      ))}
      <div
        ref={(el) => { refs.current.ring = el }}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 40, height: 40, borderRadius: '50%',
          border: '1.5px solid var(--cursor-ring)',
          pointerEvents: 'none', zIndex: 1001,
          opacity: visible ? 1 : 0, transition: 'opacity 0.2s',
          willChange: 'transform',
        }}
      />
      <div
        ref={(el) => { refs.current.dot = el }}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--cursor-dot)',
          boxShadow: '0 0 8px var(--cursor-dot), 0 0 16px rgba(0,212,255,0.5)',
          pointerEvents: 'none', zIndex: 1001,
          opacity: visible ? 1 : 0, transition: 'opacity 0.2s',
          willChange: 'transform',
        }}
      />
    </>
  )
}

const MemoCursorFollower = memo(CursorFollower)

export default MemoCursorFollower
