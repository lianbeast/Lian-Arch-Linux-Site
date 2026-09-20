import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getReducedMotion } from '../../utils/reducedMotion.js'

// The Arch "A" as terrain: a mountain ridge whose two peaks form the arch's
// legs, with the gap between them as the pass — the logo, read as landscape.
function MountainGeometry() {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(14, 10, 28, 20)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // Two peaks at x = ±2.5 (the legs), valley at center (the pass)
      const peakL = Math.exp(-((x + 2.5) ** 2) / 1.8)
      const peakR = Math.exp(-((x - 2.5) ** 2) / 1.8)
      const ridge = peakL + peakR
      // Fade height toward back rows so the front reads as a cliff face
      const depth = (y + 5) / 10
      pos.setZ(i, ridge * (2.6 - depth * 0.8) + Math.sin(x * 3.1) * 0.15)
    }
    geo.computeVertexNormals()
    return geo
  }, [])
}

function Mountain({ reduced }) {
  const meshRef = useRef()
  const targetY = useRef(0)
  const targetX = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    if (reduced) return // static: mount and never animate
    // Slow ambient spin; mouse position adds a gentle parallax tilt
    meshRef.current.rotation.y += delta * 0.06
    targetY.current = (state.pointer.x - 0.5) * 0.25
    targetX.current = (state.pointer.y - 0.5) * -0.15
    meshRef.current.rotation.x += (targetX.current - meshRef.current.rotation.x) * 0.04
    meshRef.current.position.y += (targetY.current - meshRef.current.position.y) * 0.04
  })

  const geo = MountainGeometry()

  return (
    <group ref={meshRef} rotation={[-0.35, 0, 0]} position={[0, -0.5, 0]}>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color="#1793D1"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Accent ridge overlay — thinner, brighter, cyan, reads as the horizon line */}
      <mesh geometry={geo} scale={[1.001, 1.001, 1.001]}>
        <meshBasicMaterial
          color="#22d3ee"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  )
}

export default function ArchMesh({ reduced = getReducedMotion() }) {
  return (
    <Canvas
      className="arch-mesh-canvas"
      camera={{ position: [0, 2.2, 7], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Mountain reduced={reduced} />
    </Canvas>
  )
}
