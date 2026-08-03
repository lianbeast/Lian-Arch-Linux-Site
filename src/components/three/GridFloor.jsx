import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const pulseRef = useRef()

  const geom = useMemo(() => {
    const size = 100
    const divisions = 80
    const pts = []
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const pos = (i / divisions) * size
      pts.push(new THREE.Vector3(pos, 0, -size / 2))
      pts.push(new THREE.Vector3(pos, 0, size / 2))
      pts.push(new THREE.Vector3(-size / 2, 0, pos))
      pts.push(new THREE.Vector3(size / 2, 0, pos))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  const pulseGeom = useMemo(() => {
    const pts = [
      new THREE.Vector3(-50, 0.01, 0),
      new THREE.Vector3(50, 0.01, 0),
    ]
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame((state) => {
    if (!pulseRef.current) return
    const t = state.clock.elapsedTime
    pulseRef.current.position.z = ((t * 3) % 40) - 20
    pulseRef.current.material.opacity = 0.15 + Math.sin(t * 4) * 0.1
  })

  return (
    <group position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <lineSegments geometry={geom}>
        <lineBasicMaterial color="#1793D1" transparent opacity={0.06} depthWrite={false} />
      </lineSegments>
      <line ref={pulseRef} geometry={pulseGeom}>
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>
    </group>
  )
}
