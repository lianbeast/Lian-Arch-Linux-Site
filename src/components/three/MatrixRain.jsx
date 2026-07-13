import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CHARS = '>_/?#@$%&*+=[]{}|\\:;<->~^'
const COLS = 30
const ROWS = 20
const TOTAL = COLS * ROWS
const FRAME_SKIP = 2

export default function MatrixRain({ position = [0, 0, -18], opacity = 0.12 }) {
  const meshRef = useRef()
  const drops = useRef(new Float32Array(COLS).fill(0))
  const speeds = useRef(new Float32Array(COLS).fill(0))
  const frameCount = useRef(0)

  useEffect(() => {
    for (let i = 0; i < COLS; i++) {
      drops.current[i] = Math.random() * ROWS
      speeds.current[i] = 0.3 + Math.random() * 0.7
    }
  }, [])

  const geometry = useMemo(() => new THREE.PlaneGeometry(0.4, 0.5), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current) return

    frameCount.current++
    const t = state.clock.elapsedTime

    for (let col = 0; col < COLS; col++) {
      drops.current[col] += speeds.current[col] * 0.15
      if (drops.current[col] > ROWS + 5) {
        drops.current[col] = -5
        speeds.current[col] = 0.3 + Math.random() * 0.7
      }

      // Only update matrix every FRAME_SKIP frames to reduce CPU
      if (frameCount.current % FRAME_SKIP !== 0) continue

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
      <instancedMesh ref={meshRef} args={[geometry, null, TOTAL]}>
        <meshBasicMaterial
          color="#1793D1"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}
