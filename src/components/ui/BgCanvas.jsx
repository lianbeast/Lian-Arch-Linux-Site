import { useEffect, useRef, useState } from 'react'

const PARTICLE_COUNT = 40
const LOW_POWER_PARTICLE_COUNT = 20
const CONNECTION_DISTANCE = 140

function getReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function getLowPower() {
  return typeof navigator !== 'undefined' && navigator.deviceMemory !== undefined && navigator.deviceMemory <= 4
}

function createParticles(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 1.2 + 0.4,
    opacity: Math.random() * 0.4 + 0.15,
  }))
}

export default function BgCanvas() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const particlesRef = useRef([])
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion())
  const [lowPower, setLowPower] = useState(getLowPower())
  const [dpr, setDpr] = useState(1)

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
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    setDpr(devicePixelRatio)

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const count = lowPower ? LOW_POWER_PARTICLE_COUNT : PARTICLE_COUNT
      particlesRef.current = createParticles(canvas.width, canvas.height, count)
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const particles = particlesRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const w = canvas.width
      const h = canvas.height

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        p.x = Math.max(0, Math.min(w, p.x))
        p.y = Math.max(0, Math.min(h, p.y))
      }

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist2 = dx * dx + dy * dy
          if (dist2 < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            const opacity = (1 - dist2 / (CONNECTION_DISTANCE * CONNECTION_DISTANCE)) * 0.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
            ctx.stroke()
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * devicePixelRatio)
        gradient.addColorStop(0, `rgba(99, 102, 241, ${p.opacity})`)
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const start = () => {
      if (!rafRef.current) tick()
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
  }, [reducedMotion, lowPower, dpr])

  return <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
}