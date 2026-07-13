import { useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridFloor() {
  const [lineObj, setLineObj] = useState(null)
  const [pulseObj, setPulseObj] = useState(null)

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

  useEffect(() => {
    if (!geom) return
    const obj = new THREE.LineSegments(geom, new THREE.LineBasicMaterial({
      color: '#1793D1',
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    }))
    setLineObj(obj)
    return () => { obj.geometry.dispose(); obj.material.dispose() }
  }, [geom])

  useEffect(() => {
    if (!pulseGeom) return
    const obj = new THREE.Line(pulseGeom, new THREE.LineBasicMaterial({
      color: '#00d4ff',
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }))
    setPulseObj(obj)
    return () => { obj.geometry.dispose(); obj.material.dispose() }
  }, [pulseGeom])

  useFrame((state) => {
    if (pulseObj) {
      const t = state.clock.elapsedTime
      const z = ((t * 3) % 40) - 20
      pulseObj.position.z = z
      pulseObj.material.opacity = 0.15 + Math.sin(t * 4) * 0.1
    }
  })

  return (
    <group position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      {lineObj && <primitive object={lineObj} />}
      {pulseObj && <primitive object={pulseObj} />}
    </group>
  )
}
