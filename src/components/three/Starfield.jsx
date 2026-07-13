import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Starfield({ count = 3000 }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const shootingObjs = useRef([])

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 30 + Math.random() * 70
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      const brightness = 0.3 + Math.random() * 0.7
      const tint = Math.random()
      if (tint < 0.3) {
        colors[i3] = 0.09 * brightness; colors[i3 + 1] = 0.58 * brightness; colors[i3 + 2] = 0.82 * brightness
      } else if (tint < 0.5) {
        colors[i3] = 0; colors[i3 + 1] = 0.83 * brightness; colors[i3 + 2] = brightness
      } else {
        colors[i3] = brightness; colors[i3 + 1] = brightness; colors[i3 + 2] = brightness
      }
      sizes[i] = 0.3 + Math.random() * 1.2
    }
    return { positions, colors, sizes }
  }, [count])

  const shootingStars = useMemo(() =>
    Array.from({ length: 3 }, () => ({
      active: false,
      timer: Math.random() * 5,
      points: [new THREE.Vector3(), new THREE.Vector3()],
    })), [])

  // Create shooting star line objects once
  useEffect(() => {
    if (!groupRef.current) return
    const objs = shootingStars.map(() => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)
      ])
      const mat = new THREE.LineBasicMaterial({
        color: '#00d4ff', transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      return new THREE.Line(geom, mat)
    })
    objs.forEach(o => groupRef.current.add(o))
    shootingObjs.current = objs
    return () => {
      objs.forEach(o => {
        o.geometry.dispose()
        o.material.dispose()
        groupRef.current?.remove(o)
      })
    }
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.02
    }

    shootingStars.forEach((star, i) => {
      const obj = shootingObjs.current[i]
      star.timer -= delta
      if (star.timer <= 0 && !star.active) {
        star.active = true
        star.timer = 0.3 + Math.random() * 0.4
        const angle = Math.random() * Math.PI * 2
        const r = 20 + Math.random() * 30
        star.points[0].set(Math.cos(angle) * r, (Math.random() - 0.5) * 20, Math.sin(angle) * r - 20)
        const dir = new THREE.Vector3(-Math.cos(angle), -0.3, -Math.sin(angle)).normalize()
        star.points[1].copy(star.points[0]).add(dir.multiplyScalar(8 + Math.random() * 5))
        if (obj) {
          obj.geometry.setFromPoints(star.points)
          obj.material.opacity = 1
        }
      }
      if (star.active) {
        star.timer -= delta
        if (obj) obj.material.opacity = Math.max(0, star.timer / 0.4)
        if (star.timer <= 0) { star.active = false; star.timer = 3 + Math.random() * 7 }
      }
    })
  })

  return (
    <>
      <group ref={groupRef} />
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial size={0.15} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  )
}
