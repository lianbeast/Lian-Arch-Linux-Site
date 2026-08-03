import { useRef, useMemo, useEffect, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CHARS = '>_/?#@$%&*+=[]{}|\\:;<->~^アイウエオカキクケコ0123456789'
const COLS = 30
const ROWS = 20
const TOTAL = COLS * ROWS
const FRAME_SKIP = 2

// Build a single-row glyph atlas texture once (module scope, not during render)
function buildGlyphTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = CHARS.length * 32
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 46px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  CHARS.split('').forEach((c, i) => ctx.fillText(c, i * 32 + 16, 32))
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.needsUpdate = true
  return tex
}

// One random glyph index per instance
function buildGlyphs() {
  const arr = new Float32Array(TOTAL)
  for (let i = 0; i < TOTAL; i++) arr[i] = Math.floor(Math.random() * CHARS.length)
  return arr
}

const GLYPH_TEX = buildGlyphTexture()
const GLYPHS = buildGlyphs()

const VERTEX_SHADER = `
  attribute float aChar;
  varying float vChar;
  varying vec2 vUv;
  void main() {
    vChar = aChar;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = `
  uniform sampler2D uGlyphs;
  uniform float uCharCount;
  uniform float uOpacity;
  varying float vChar;
  varying vec2 vUv;
  void main() {
    float idx = clamp(floor(vChar + 0.5), 0.0, uCharCount - 1.0);
    vec2 uv = vec2((idx + vUv.x) / uCharCount, vUv.y);
    float a = texture2D(uGlyphs, uv).a;
    gl_FragColor = vec4(0.09, 0.58, 0.82, a * uOpacity);
  }
`

export default function MatrixRain({ position = [0, 0, -18], opacity = 0.12 }) {
  const meshRef = useRef()
  const drops = useRef(new Float32Array(COLS).fill(0))
  const speeds = useRef(new Float32Array(COLS).fill(0))
  const frameCount = useRef(0)

  const geometry = useMemo(() => new THREE.PlaneGeometry(0.4, 0.5), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uGlyphs: { value: GLYPH_TEX },
      uCharCount: { value: CHARS.length },
      uOpacity: { value: opacity },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }), [opacity])

  useEffect(() => {
    for (let i = 0; i < COLS; i++) {
      drops.current[i] = Math.random() * ROWS
      speeds.current[i] = 0.3 + Math.random() * 0.7
    }
  }, [])

  // Attach the per-instance glyph attribute before the first frame renders
  useLayoutEffect(() => {
    const attr = new THREE.InstancedBufferAttribute(GLYPHS, 1)
    attr.needsUpdate = true
    meshRef.current?.setAttribute('aChar', attr)
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    frameCount.current++

    for (let col = 0; col < COLS; col++) {
      drops.current[col] += speeds.current[col] * 0.15
      if (drops.current[col] > ROWS + 5) {
        drops.current[col] = -5
        speeds.current[col] = 0.3 + Math.random() * 0.7
      }
    }

    // Only update instances every FRAME_SKIP frames to reduce CPU
    if (frameCount.current % FRAME_SKIP !== 0) return

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const idx = col * ROWS + row
        const x = (col - COLS / 2) * 0.55
        const y = (row - ROWS / 2) * 0.55 - (drops.current[col] % ROWS)

        dummy.position.set(x, y, 0)
        const dist = Math.abs(row - (drops.current[col] % ROWS))
        const alpha = dist < 3 ? (1 - dist / 3) : 0.15
        dummy.scale.setScalar(alpha > 0.2 ? 1 : 0.6)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(idx, dummy.matrix)
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[geometry, material, TOTAL]} />
    </group>
  )
}
