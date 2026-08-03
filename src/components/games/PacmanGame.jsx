import { useRef, useEffect, useState, useCallback } from 'react'
import { getCtx } from '../../utils/sounds'
import './PacmanGame.css'

// ── Maze (28 x 31) ──
// W=wall  D=dot  P=power pellet  G=ghost-house floor  -=ghost gate  (space)=empty
const MAZE_STR = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'WPWWWW.WWWWW.WW.WWWWW.WWWWPW',
  'W..........................W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W....WW....WWWWWW....WW....W',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'W...........WWWW...........W',
  'W.WWWW.WWWW.WWWWWWWW.WWWW.WW',
  'W.WWWW.WWWW.WWWWWWWW.WWWW.WW',
  'W....WW....WWWWWW....WW....W',
  'WWWW.WWWW.WW----WW.WW.WWWW.WW',
  'WWWW.WWWW.WWGGGGWW.WW.WWWW.WW',
  'WWWW.WWWW.WWGGGGWW.WW.WWWW.WW',
  'W....WW....WWWWWW....WW....W',
  'W.WWWW.WWWW.WWWWWWWW.WWWW.WW',
  'W.WWWW.WWWW.WWWWWWWW.WWWW.WW',
  'W...........WWWW...........W',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'WWWW.WWWW.WW....WW.WW.WWWW.WW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'WPD..WW................WW..DPW',
  'WWWW.WW.WWWWWWWWWWW.WW.WWWWW',
  'WWWW.WW.WWWWWWWWWWW.WW.WWWWW',
]

const TILE = 28
const COLS = 28
const ROWS = 31
const W = COLS * TILE  // 784
const H = ROWS * TILE  // 868

const DIRS = [
  [-1, 0], // 0 = left
  [0, -1], // 1 = up
  [1, 0],  // 2 = right
  [0, 1],  // 3 = down
]

const PAC_START = { x: 14, y: 23 }
const GHOSTS = [
  { name: 'blinky', color: '#1793D1', start: { x: 14, y: 10 }, scatter: { x: 25, y: 0 } },
  { name: 'pinky',  color: '#00d4ff', start: { x: 10, y: 14 }, scatter: { x: 2, y: 0 } },
  { name: 'inky',   color: '#1da3e8', start: { x: 18, y: 14 }, scatter: { x: 27, y: 30 } },
  { name: 'clyde',  color: '#6b8aad', start: { x: 17, y: 18 }, scatter: { x: 0, y: 30 } },
]

// ── Helper: initialize maze from string ──
function buildMaze() {
  const maze = []
  let dots = 0
  for (let y = 0; y < ROWS; y++) {
    maze[y] = []
    for (let x = 0; x < COLS; x++) {
      const ch = MAZE_STR[y]?.[x] || ' '
      if (ch === '.' || ch === 'D') { maze[y][x] = 2; dots++ }
      else if (ch === 'P') { maze[y][x] = 3; dots++ }
      else if (ch === 'W' || ch === '-') { maze[y][x] = 1 } // wall or gate
      else maze[y][x] = 0 // empty or ghost house floor
    }
  }
  return { maze, dots }
}

function isWall(maze, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true
  return maze[y][x] === 1
}

// ── Ghost AI: target tile ──
function ghostTarget(ghost, pac, maze, blinkyPos) {
  const { x, y } = ghost.pos
  const t = ghost.mode === 'scatter' ? ghost.scatter : { x: pac.x, y: pac.y }
  if (ghost.name === 'pinky') {
    const d = DIRS[pac.dir]
    return { x: pac.x + d[0] * 4, y: pac.y + d[1] * 4 }
  }
  if (ghost.name === 'inky' && blinkyPos) {
    const ahead = { x: pac.x + DIRS[pac.dir][0] * 2, y: pac.y + DIRS[pac.dir][1] * 2 }
    return { x: ahead.x + (ahead.x - blinkyPos.x), y: ahead.y + (ahead.y - blinkyPos.y) }
  }
  if (ghost.name === 'clyde') {
    const dist = Math.abs(x - pac.x) + Math.abs(y - pac.y)
    return dist > 8 ? { x: pac.x, y: pac.y } : ghost.scatter
  }
  return t
}

function ghostSpeed(mode) {
  if (mode === 'frightened') return 0.5
  if (mode === 'eaten') return 4
  return 1
}

// ── Sound helpers — reuse shared AudioContext singleton from sounds.js ──
function beep(freq, dur, vol = 0.08) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'square'
    o.frequency.value = freq
    g.gain.setValueAtTime(vol, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
    o.connect(g)
    g.connect(c.destination)
    o.start(c.currentTime)
    o.stop(c.currentTime + dur)
  } catch { /* ignore */ }
}

function sndChomp() { beep(260, 0.08, 0.06) }
function sndPower() { beep(200, 0.15, 0.1); setTimeout(() => beep(400, 0.1, 0.08), 80) }
function sndDeath() { beep(500, 0.1, 0.1); setTimeout(() => beep(300, 0.15, 0.08), 100); setTimeout(() => beep(200, 0.2, 0.06), 200) }
function sndEatGhost() { beep(600, 0.06, 0.08); setTimeout(() => beep(800, 0.06, 0.08), 50); setTimeout(() => beep(1000, 0.08, 0.06), 100) }
function sndWin() { beep(523, 0.15, 0.1); setTimeout(() => beep(659, 0.15, 0.1), 150); setTimeout(() => beep(784, 0.1, 0.08), 300) }

// ── Speed constants (pixels per tick) ──
const PAC_SPEED = 1
const GHOST_BASE_SPEED = 1

// ── Render helpers (pure canvas drawing; read everything from the `st` ref) ──
function render(ctx, st, gameState) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  drawMaze(ctx, st.maze, st.frightenedTimer > 0, st)
  if (gameState !== 'dying') drawPac(ctx, st.pac, st.ticks)
  st.ghosts.forEach(g => drawGhost(ctx, g, st.frightenedTimer > 0, st.ticks))
  drawHUD(ctx, st)

  if (gameState === 'ready') {
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('READY!', W / 2, 340)
  }
  if (gameState === 'over') {
    ctx.fillStyle = '#1793D1'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', W / 2, 420)
    ctx.fillStyle = '#6b8aad'
    ctx.font = '16px monospace'
    ctx.fillText('Press Enter to restart', W / 2, 460)
  }
  if (gameState === 'won') {
    ctx.fillStyle = '#00d4ff'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('YOU WIN!', W / 2, 420)
    ctx.fillStyle = '#6b8aad'
    ctx.font = '16px monospace'
    ctx.fillText('Press Enter to play again', W / 2, 460)
  }
}

function drawMaze(ctx, maze, frightened, st) {
  const wallColor = frightened ? '#4444ff' : '#1793D1'
  const dotColor = '#88ff88'
  ctx.strokeStyle = wallColor
  ctx.lineWidth = 2
  ctx.shadowColor = wallColor
  ctx.shadowBlur = 4

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const px = x * TILE, py = y * TILE
      if (maze[y]?.[x] === 1) {
        ctx.fillStyle = wallColor
        ctx.globalAlpha = 0.08
        ctx.fillRect(px, py, TILE, TILE)
        ctx.globalAlpha = 1

        const neighbors = [[0, -1, 'top'], [0, 1, 'bottom'], [-1, 0, 'left'], [1, 0, 'right']]
        for (const [nx, ny] of neighbors) {
          const cx = x + nx, cy = y + ny
          if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS || !isWall(maze, cx, cy)) {
            ctx.beginPath()
            ctx.strokeStyle = wallColor
            ctx.lineWidth = 2
            if (nx === -1) { ctx.moveTo(px, py); ctx.lineTo(px, py + TILE) }
            if (nx === 1) { ctx.moveTo(px + TILE, py); ctx.lineTo(px + TILE, py + TILE) }
            if (ny === -1) { ctx.moveTo(px, py); ctx.lineTo(px + TILE, py) }
            if (ny === 1) { ctx.moveTo(px, py + TILE); ctx.lineTo(px + TILE, py + TILE) }
            ctx.stroke()
          }
        }
      } else if (maze[y]?.[x] === 2) {
        ctx.fillStyle = dotColor
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(px + TILE / 2, py + TILE / 2, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 4
      } else if (maze[y]?.[x] === 3) {
        ctx.fillStyle = dotColor
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(px + TILE / 2, py + TILE / 2, 8 + Math.sin(st.ticks * 0.15) * 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 4
      }
    }
  }
  ctx.shadowBlur = 0
}

function drawPac(ctx, pac, ticks) {
  const cx = pac.px + TILE / 2
  const cy = pac.py + TILE / 2
  const mouthOpen = Math.sin(ticks * 0.3) * 0.3 + 0.3
  const dirAngles = [Math.PI, -Math.PI / 2, 0, Math.PI / 2]
  const angle = dirAngles[pac.dir] || 0
  const r = TILE * 0.45

  ctx.fillStyle = '#00d4ff'
  ctx.shadowColor = '#00d4ff'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(cx, cy, r, angle + mouthOpen, angle + Math.PI * 2 - mouthOpen)
  ctx.lineTo(cx, cy)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
}

function drawGhost(ctx, ghost, frightened, ticks) {
  const cx = ghost.px, cy = ghost.py
  const r = TILE * 0.4

  if (ghost.mode === 'eaten') {
    ctx.fillStyle = '#fff'
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(cx + TILE * 0.32, cy + TILE * 0.33, 3, 0, Math.PI * 2)
    ctx.arc(cx + TILE * 0.68, cy + TILE * 0.33, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(cx + TILE * 0.32, cy + TILE * 0.33, 1.5, 0, Math.PI * 2)
    ctx.arc(cx + TILE * 0.68, cy + TILE * 0.33, 1.5, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  const color = frightened ? (ticks % 10 < 5 ? '#2121de' : '#1793D1') : ghost.color

  // Body
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(cx + TILE / 2, cy + TILE * 0.36, r, Math.PI, 0, false)
  ctx.lineTo(cx + TILE / 2 + r, cy + TILE * 0.64)
  // Wavy bottom — 4 equal waves across the ghost width
  const ghostRight = cx + TILE / 2 + r
  const ghostBottom = cy + TILE * 0.64
  const waveWidth = (r * 2) / 4
  for (let i = 0; i < 4; i++) {
    const endX = ghostRight - (i + 1) * waveWidth
    const ctrlX = ghostRight - (i + 0.5) * waveWidth
    const waveAmp = Math.sin(ticks * 0.1 + i) * 2.5
    ctx.quadraticCurveTo(ctrlX, ghostBottom - waveAmp + 2, endX, ghostBottom)
  }
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  if (!frightened) {
    // Eyes
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(cx + TILE * 0.32, cy + TILE * 0.33, 2.5, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + TILE * 0.68, cy + TILE * 0.33, 2.5, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2121de'
    ctx.beginPath()
    ctx.arc(cx + TILE * 0.32, cy + TILE * 0.33, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + TILE * 0.68, cy + TILE * 0.33, 1.5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#fff'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('×', cx + TILE * 0.32, cy + TILE * 0.38)
    ctx.fillText('×', cx + TILE * 0.68, cy + TILE * 0.38)
    ctx.beginPath()
    ctx.arc(cx + TILE / 2, cy + TILE * 0.54, TILE * 0.12, 0, Math.PI, false)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function drawHUD(ctx, st) {
  ctx.fillStyle = '#6b8aad'
  ctx.font = '14px monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`SCORE: ${st.score}`, 10, 18)
  ctx.textAlign = 'right'
  ctx.fillText(`HIGH: ${st.highScore}`, W - 10, 18)
  for (let i = 0; i < st.lives; i++) {
    ctx.fillStyle = '#00d4ff'
    ctx.beginPath()
    ctx.arc(14 + i * 24, H - 14, 8, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Reset positions after a death ──
function resetPositions(st) {
  st.pac.x = PAC_START.x; st.pac.y = PAC_START.y
  st.pac.px = PAC_START.x * TILE; st.pac.py = PAC_START.y * TILE
  st.pac.dir = 2; st.pac.nextDir = 2
  st.ghosts.forEach((g, i) => {
    const s = GHOSTS[i].start
    g.pos.x = s.x; g.pos.y = s.y; g.px = s.x * TILE; g.py = s.y * TILE
    g.dir = 2
    g.mode = 'chase'
    g.frightened = false; g.eaten = false
  })
  st.frightenedTimer = 0
}

export default function PacmanGame({ onClose }) {
  const canvasRef = useRef(null)
  const closeBtnRef = useRef(null)
  const [gameState, setGameState] = useState('ready') // ready | playing | dying | over | won
  const state = useRef({
    maze: [],
    pac: { x: PAC_START.x, y: PAC_START.y, dir: 2, nextDir: 2, px: PAC_START.x * TILE, py: PAC_START.y * TILE },
    ghosts: [],
    score: 0, highScore: 0, lives: 3, dots: 0, totalDots: 0,
    frightenedTimer: 0,
    dyingTimer: 0,
    readyTimer: 90,
    ticks: 0,
  })

  // Move focus into the modal so keyboard users can reach the close button,
  // and restore focus to the launcher when the modal unmounts
  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeBtnRef.current?.focus()
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [])

  // ── Initialize ──
  const initGame = useCallback(() => {
    const { maze, dots } = buildMaze()
    const st = state.current
    st.maze = maze
    st.pac = { x: PAC_START.x, y: PAC_START.y, dir: 2, nextDir: 2, px: PAC_START.x * TILE, py: PAC_START.y * TILE }
    st.ghosts = GHOSTS.map(g => ({
      ...g,
      pos: { x: g.start.x, y: g.start.y },
      px: g.start.x * TILE, py: g.start.y * TILE,
      dir: 2,
      mode: 'chase',
      frightened: false,
      eaten: false,
    }))
    st.score = 0; st.lives = 3; st.dots = 0; st.totalDots = dots
    st.frightenedTimer = 0; st.dyingTimer = 0; st.readyTimer = 90; st.ticks = 0
    setGameState('ready')
  }, [])

  // Initialize on mount (deferred a frame so the effect stays pure)
  useEffect(() => {
    const raf = requestAnimationFrame(() => initGame())
    return () => cancelAnimationFrame(raf)
  }, [initGame])

  // ── Game loop ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = null

    const loop = () => {
      const st = state.current
      st.ticks++

      // ── Update ──
      if (st.readyTimer > 0) { st.readyTimer--; render(ctx, st, gameState); raf = requestAnimationFrame(loop); return }
      if (gameState === 'ready') setGameState('playing')

      if (gameState === 'dying') {
        st.dyingTimer++
        if (st.dyingTimer > 60) {
          if (st.lives <= 0) { setGameState('over'); render(ctx, st, gameState); raf = requestAnimationFrame(loop); return }
          resetPositions(st)
          setGameState('ready'); st.readyTimer = 40; st.dyingTimer = 0
          render(ctx, st, gameState); raf = requestAnimationFrame(loop); return
        }
        render(ctx, st, gameState); raf = requestAnimationFrame(loop); return
      }

      if (gameState === 'over' || gameState === 'won') {
        render(ctx, st, gameState); raf = requestAnimationFrame(loop); return
      }

      // ── Playing ──
      const pac = st.pac
      const tileX = Math.round(pac.px / TILE)
      const tileY = Math.round(pac.py / TILE)
      const atCenter = pac.px % TILE === 0 && pac.py % TILE === 0

      if (atCenter) {
        pac.x = tileX; pac.y = tileY
        if (pac.nextDir !== pac.dir) {
          const nd = DIRS[pac.nextDir]
          if (!isWall(st.maze, tileX + nd[0], tileY + nd[1])) {
            pac.dir = pac.nextDir
          }
        }
        const d = DIRS[pac.dir]
        if (!isWall(st.maze, tileX + d[0], tileY + d[1])) {
          pac.px += d[0] * PAC_SPEED
          pac.py += d[1] * PAC_SPEED
        }
        // Eat dot
        const cell = st.maze[tileY]?.[tileX]
        if (cell === 2 || cell === 3) {
          st.maze[tileY][tileX] = 0
          st.dots++
          const pts = cell === 3 ? 50 : 10
          st.score += pts
          if (st.score > st.highScore) st.highScore = st.score
          if (cell === 3) {
            st.frightenedTimer = 300
            st.ghosts.forEach(g => { if (g.mode !== 'eaten') { g.frightened = true; g.mode = 'frightened' } })
            sndPower()
          } else {
            sndChomp()
          }
          if (st.dots >= st.totalDots) { setGameState('won'); sndWin() }
        }
      } else {
        pac.px += DIRS[pac.dir][0] * PAC_SPEED
        pac.py += DIRS[pac.dir][1] * PAC_SPEED
        // Wrap
        if (pac.px < -TILE) pac.px = COLS * TILE
        else if (pac.px > COLS * TILE) pac.px = -TILE
      }

      // Frightened timer
      if (st.frightenedTimer > 0) {
        st.frightenedTimer--
        if (st.frightenedTimer === 0) {
          st.ghosts.forEach(g => { g.frightened = false; if (g.mode === 'frightened') g.mode = 'chase' })
        }
      }

      // Ghost movement
      st.ghosts.forEach(g => {
        const speed = ghostSpeed(g.mode) * GHOST_BASE_SPEED
        const gtx = Math.round(g.px / TILE)
        const gty = Math.round(g.py / TILE)
        const gAtCenter = g.px % TILE === 0 && g.py % TILE === 0

        if (gAtCenter) {
          g.pos.x = gtx; g.pos.y = gty

          if (g.mode === 'eaten' && gtx === g.start.x && gty === g.start.y) {
            g.mode = 'chase'; g.frightened = false; g.eaten = false
          }

          const opposites = [2, 3, 0, 1]
          const target = g.mode === 'frightened'
            ? { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
            : g.mode === 'eaten'
              ? { x: g.start.x, y: g.start.y }
              : ghostTarget(g, pac, st.maze, st.ghosts[0]?.pos)

          let bestDir = g.dir
          let bestDist = Infinity
          const dirs = [0, 1, 2, 3]
            .filter(d => {
              const nd = DIRS[d]
              return !isWall(st.maze, gtx + nd[0], gty + nd[1])
            })
            .filter(d => d !== opposites[g.dir]) // No reversing

          if (dirs.length === 0) { bestDir = opposites[g.dir] } // dead end
          else {
            for (const d of dirs) {
              const nd = DIRS[d]
              const dist = Math.abs((gtx + nd[0]) - target.x) + Math.abs((gty + nd[1]) - target.y)
              if (dist < bestDist) { bestDist = dist; bestDir = d }
            }
          }
          g.dir = bestDir
        }

        const gd = DIRS[g.dir]
        g.px += gd[0] * speed
        g.py += gd[1] * speed
        // Wrap
        if (g.px < -TILE) g.px = COLS * TILE
        else if (g.px > COLS * TILE) g.px = -TILE
      })

      // ── Collision: ghost vs pac ──
      st.ghosts.forEach(g => {
        if (g.mode === 'eaten') return
        const dx = Math.abs(pac.px - g.px)
        const dy = Math.abs(pac.py - g.py)
        if (dx < TILE * 0.7 && dy < TILE * 0.7) {
          if (g.frightened) {
            g.mode = 'eaten'; g.frightened = false; g.eaten = true
            st.score += 200
            sndEatGhost()
          } else {
            st.lives--
            setGameState('dying'); st.dyingTimer = 0
            sndDeath()
          }
        }
      })

      render(ctx, st, gameState)
      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [gameState])

  // ── Input ──
  useEffect(() => {
    const onKey = (e) => {
      const st = state.current
      if (e.key === 'Escape') { onClose(); return }
      if (gameState === 'over' || gameState === 'won') { if (e.key === 'Enter') { initGame(); return } }
      if (gameState !== 'playing' && gameState !== 'ready') return
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 }
      if (map[e.key] !== undefined) { e.preventDefault(); st.pac.nextDir = map[e.key] }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, onClose, initGame])

  return (
    <div className="pacman-overlay">
      <div className="pacman-container">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="pacman-canvas"
          aria-label="PAC-MAN game. Use the arrow keys to move. Press Escape to close."
        />
      </div>
      <button ref={closeBtnRef} className="pacman-close" onClick={onClose} aria-label="Close game">✕</button>
    </div>
  )
}
