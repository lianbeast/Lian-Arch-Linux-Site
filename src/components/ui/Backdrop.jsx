import { useEffect, useRef, useState } from 'react'

/**
 * Site-wide animated backdrop — a dark 3D digital landscape.
 *
 * A flowing wireframe terrain receding to a horizon, with sparse drifting nodes
 * above it. Drawn on a 2D canvas with a hand-written projection: no three.js, no
 * WebGL, no shader, and the runtime dependency count stays at `react` +
 * `react-dom`.
 *
 * Deliberately mark-free. No Arch logo or letterform is drawn here: the official
 * logo is the only mark that should represent the project, and a hand-drawn
 * approximation in a decorative layer is neither accurate nor appropriate.
 *
 * Everything here is one component's worth of maths and one requestAnimationFrame
 * loop. It is decorative, so every budget decision favours the content:
 *
 *   - reduced motion renders a SINGLE static frame, keeping the atmosphere
 *     without the movement
 *   - touch devices and small screens get a lower-complexity scene
 *   - the loop pauses when the tab is hidden
 *   - DPR is capped, and the whole grid is two stroke() calls per row
 *
 * The scene sits behind the content at z-index 0 and never takes pointer events.
 * See docs/backdrop.md for the geometry and every tuning knob.
 */

/* ---- scene ------------------------------------------------------------ */
const FOCAL_RATIO = 0.9    // focal length as a fraction of canvas width
const HORIZON = 0.46       // horizon line, as a fraction of canvas height
const DEPTH_RANGE = 22     // far plane, as a multiple of the near plane
const CAM_H = 2.2          // camera height above the mean surface
const PERSP = 0.85         // <1 gives the grid a gentle convergence
const MAX_DPR = 2

/* ---- motion ----------------------------------------------------------- */
const WAVE_RATE = 0.30     // how fast the surface flows
const AMBIENT = 0.13       // ambient brightness cycle
const DRIFT = 0.55         // node travel speed

/* ---- pointer ---------------------------------------------------------- */
const POINTER_PAN = 16     // px of camera pan at full deflection
const POINTER_EASE = 0.045

/* ---- complexity by viewport ------------------------------------------- */
const detailFor = (w) => {
  if (w < 640) return { rows: 16, cols: 30, nodes: 26 }
  if (w < 1024) return { rows: 22, cols: 44, nodes: 44 }
  return { rows: 28, cols: 64, nodes: 72 }
}

/* ---- terrain ---------------------------------------------------------- */

/** A sum of slow sines — a surface that flows rather than oscillates.
 *  `WAVE_RATE` is the single master speed; the multipliers set the relative
 *  drift of each component. */
function wave(x, z, t) {
  const u = t * WAVE_RATE
  return (
    Math.sin(x * 1.6 + u * 1.50) * 0.30 +
    Math.sin(z * 1.05 - u * 1.00) * 0.34 +
    Math.sin(x * 2.3 + z * 1.7 + u * 0.73) * 0.20
  )
}

/** Atmospheric depth: near rows are bright, far rows dissolve into the horizon. */
const fogAt = (z, zNear, zFar) =>
  Math.pow(Math.max(0, 1 - (z - zNear) / (zFar - zNear)), 0.7)

/* ---- shared buffers --------------------------------------------------- */
/* Reused across frames. Module scope because there is one backdrop, and
   allocating these 60 times a second is pointless GC pressure. Sized for the
   largest detail tier. */
const MAX_ROWS = 28
const MAX_COLS = 64
const PX = new Float32Array(MAX_ROWS * MAX_COLS)
const PY = new Float32Array(MAX_ROWS * MAX_COLS)

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/** Derive every size-dependent value once per resize, not per frame. */
function buildScene(w, h, detail) {
  const focal = w * FOCAL_RATIO
  const cx = w / 2
  const cy = h * HORIZON

  /* Depth at which the mean surface crosses the bottom edge of the canvas.
     Anything nearer than this is off-screen, so it is the near plane. */
  const zNear = Math.max(0.001, (CAM_H * focal) / Math.max(1, h - cy))
  const zFar = zNear * DEPTH_RANGE

  /* World half-width at the near plane, widened 35% so the grid always runs off
     both edges and never shows a boundary. */
  const halfNear = ((w / 2) * zNear / focal) * 1.35

  /* Geometric depth spacing — even rows in screen space, rather than every row
     crammed against the horizon. */
  const rowZ = new Float32Array(detail.rows)
  const ratio = Math.pow(zFar / zNear, 1 / (detail.rows - 1))
  let z = zNear
  for (let i = 0; i < detail.rows; i++) {
    rowZ[i] = z
    z *= ratio
  }

  return { w, h, focal, cx, cy, zNear, zFar, halfNear, rowZ, detail }
}

/* ---- draw ------------------------------------------------------------- */

function drawTerrain(ctx, sc, t, panX, panY, ambient, colors) {
  const { focal, cx, cy, rowZ, zNear, zFar, halfNear, detail } = sc
  const { rows, cols } = detail

  for (let i = 0; i < rows; i++) {
    const z = rowZ[i]
    const s = focal / z
    const half = halfNear * Math.pow(z / zNear, PERSP)
    const base = i * cols
    for (let j = 0; j < cols; j++) {
      const x = (j / (cols - 1) - 0.5) * 2 * half
      const y = wave(x, z, t)
      PX[base + j] = cx + panX + x * s
      PY[base + j] = cy + panY - (y - CAM_H) * s
    }
  }

  ctx.lineWidth = 1
  ctx.lineJoin = 'round'
  ctx.strokeStyle = colors.rule

  /* Back to front, so nearer rows overlay the ones behind them. */
  for (let i = rows - 1; i >= 0; i--) {
    const fog = fogAt(rowZ[i], zNear, zFar)
    const base = i * cols

    ctx.globalAlpha = ambient * fog * 0.85
    ctx.beginPath()
    for (let j = 0; j < cols - 1; j++) {
      ctx.moveTo(PX[base + j], PY[base + j])
      ctx.lineTo(PX[base + j + 1], PY[base + j + 1])
    }
    ctx.stroke()

    if (i > 0) {
      const prev = (i - 1) * cols
      ctx.globalAlpha = ambient * fog * 0.45
      ctx.beginPath()
      for (let j = 0; j < cols; j++) {
        ctx.moveTo(PX[base + j], PY[base + j])
        ctx.lineTo(PX[prev + j], PY[prev + j])
      }
      ctx.stroke()
    }
  }
}

function drawNodes(ctx, sc, nodes, panX, panY, ambient, colors) {
  const { focal, cx, cy, zNear, halfNear, zFar } = sc
  ctx.fillStyle = colors.brand

  for (const n of nodes) {
    const s = focal / n.z
    const half = halfNear * Math.pow(n.z / zNear, PERSP)
    const x = n.nx * half
    const sx = cx + panX + x * s
    const sy = cy + panY - (n.y - CAM_H) * s
    if (sx < -20 || sx > sc.w + 20 || sy < -20 || sy > sc.h + 20) continue

    const a = ambient * fogAt(n.z, zNear, zFar) * n.b
    if (a <= 0.01) continue
    ctx.globalAlpha = a

    /* A few read as short vertical trails, the way the reference image does it. */
    if (n.trail) ctx.fillRect(sx, sy - 7, 1, 8)
    else ctx.fillRect(sx, sy, 1.6, 1.6)
  }
}

/* ---- component -------------------------------------------------------- */

export default function Backdrop() {
  const canvasRef = useRef(null)

  /* Read the preferences during the first render rather than syncing them into
     state from an effect: a synchronous setState in an effect body cascades a
     render, and evaluating up front means the first paint is already correct. */
  const [animate, setAnimate] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !window.matchMedia('(pointer: coarse)').matches
    )
  })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(pointer: coarse)')
    const sync = () => setAnimate(!motion.matches && !pointer.matches)

    motion.addEventListener('change', sync)
    pointer.addEventListener('change', sync)
    return () => {
      motion.removeEventListener('change', sync)
      pointer.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = {
      rule: cssVar('--rule-2', '#2c3138'),
      brand: cssVar('--brand', '#1793d1'),
    }

    let sc = null
    let nodes = []
    let raf = 0
    let last = 0
    let time = 0
    let tabVisible = !document.hidden

    /* Pointer target and the eased value actually used, so the camera drifts
       toward the cursor rather than snapping to it. */
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      sc = buildScene(rect.width, rect.height, detailFor(rect.width))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      /* Nodes are seeded in normalised x so they stay inside the frustum as the
         world widens with depth. */
      const { nodes: count } = sc.detail
      nodes = Array.from({ length: count }, () => ({
        nx: Math.random() * 2 - 1,
        y: Math.random() * 2.4,
        z: sc.zNear + Math.random() * (sc.zFar - sc.zNear),
        b: 0.25 + Math.random() * 0.55,
        trail: Math.random() < 0.22,
      }))
    }

    const paint = () => {
      if (!sc) return
      const { w, h } = sc
      ctx.clearRect(0, 0, w, h)

      const panX = eased.x * POINTER_PAN
      const panY = eased.y * POINTER_PAN * 0.4
      const ambient = 0.82 + Math.sin(time * AMBIENT) * 0.14

      drawTerrain(ctx, sc, time, panX, panY, ambient, colors)
      drawNodes(ctx, sc, nodes, panX, panY, ambient, colors)
      ctx.globalAlpha = 1
    }

    const step = (dt) => {
      time += dt
      eased.x += (target.x - eased.x) * POINTER_EASE
      eased.y += (target.y - eased.y) * POINTER_EASE
      if (!sc) return
      for (const n of nodes) {
        n.z -= n.b * DRIFT * dt
        if (n.z < sc.zNear) {
          n.z = sc.zFar
          n.nx = Math.random() * 2 - 1
          n.y = Math.random() * 2.4
        }
      }
    }

    const tick = (t) => {
      raf = requestAnimationFrame(tick)
      /* Clamp dt so a pause never lurches the scene forward on resume. */
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0
      last = t

      /* Yield to main thread if user input is pending — prevents jank during
         interaction (scrolling, typing, clicking). scheduler.yield() is the
         modern way; isInputPending() is the widely supported fallback. */
      if (navigator.scheduling?.isInputPending?.()) return

      step(dt)
      paint()
    }

    const start = () => {
      if (raf) return
      last = 0
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }

    /* Pointer parallax. Touch devices never fire this meaningfully, and the
       whole handler is only attached when motion is allowed at all. */
    const onPointerMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = (e.clientY / window.innerHeight) * 2 - 1
    }

    const onVisibility = () => {
      tabVisible = !document.hidden
      if (tabVisible && animate) start()
      else stop()
    }

    const ro = new ResizeObserver(() => { resize(); paint() })
    ro.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)
    if (animate) window.addEventListener('pointermove', onPointerMove, { passive: true })

    resize()
    if (animate) {
      start()
    } else {
      /* Reduced motion: one static frame keeps the full atmosphere — terrain,
         nodes, logo — with nothing moving. */
      step(0)
      paint()
    }

    return () => {
      stop()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [animate])

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-atmosphere" />
      <canvas ref={canvasRef} className="backdrop-canvas" />
      <div className="backdrop-vignette" />
    </div>
  )
}
