import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlowOrb({ position, size = 0.5, color = '#1793D1', speed = 0.3 }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const innerRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    groupRef.current.position.x = position[0] + Math.sin(t * speed) * 0.5
    groupRef.current.position.y = position[1] + Math.cos(t * speed * 1.3) * 0.3
    groupRef.current.position.z = position[2] + Math.sin(t * speed * 0.7) * 0.2

    if (glowRef.current) {
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={innerRef}>
        <sphereGeometry args={[size * 0.3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color={color} intensity={0.3} distance={size * 8} />
    </group>
  )
}
