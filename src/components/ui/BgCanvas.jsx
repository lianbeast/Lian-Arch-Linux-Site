import { useEffect, useRef, useState } from 'react'

const PARTICLE_COUNT = 30
const LOW_POWER_PARTICLE_COUNT = 15

function getReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function getLowPower() {
  return typeof navigator !== 'undefined' &&
    navigator.deviceMemory !== undefined &&
    navigator.deviceMemory <= 4
}

function createParticles(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
  }))
}

export default function BgCanvas() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion())
  const [lowPower, setLowPower] = useState(getLowPower())
  const particleCount = lowPower ? LOW_POWER_PARTICLE_COUNT : PARTICLE_COUNT

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    resize()
    window.addEventListener('resize', resize)

    let particles = createParticles(canvas.width, canvas.height, particleCount)

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(0, 212, 255, 0.35)'
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2)
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!rafRef.current) {
        particles = createParticles(canvas.width, canvas.height, particleCount)
        tick()
      }
    }
    const stop = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    const onVisibility = () => {
      document.hidden ? stop() : start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reducedMotion, particleCount])

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
}