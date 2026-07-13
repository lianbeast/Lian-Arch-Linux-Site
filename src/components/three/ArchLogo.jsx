import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const DISPLAY_FONT = '/fonts/UbuntuSansMono-Regular.ttf'

export default function ArchLogo({ position, active }) {
  const groupRef = useRef()
  const glowRef = useRef()
  const [lineObj, setLineObj] = useState(null)

  const ringGeom = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 2.2, 2.2, 0, Math.PI * 2, false, 0)
    const pts = curve.getPoints(100).map(p => new THREE.Vector3(p.x, p.y, 0))
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useEffect(() => {
    if (!ringGeom) return
    const line = new THREE.Line(ringGeom, new THREE.LineBasicMaterial({ color: '#1793D1', transparent: true, opacity: 0.6 }))
    setLineObj(line)
    return () => { line.geometry.dispose(); line.material.dispose() }
  }, [ringGeom])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05
    groupRef.current.position.y = position.y + Math.sin(t * 0.5) * 0.15
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.15 + Math.sin(t * 1.5) * 0.08
    }
  })

  const blue = '#1793D1'
  const cyan = '#00d4ff'

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <mesh ref={glowRef} position={[0, 0.3, -0.5]}>
        <circleGeometry args={[3.5, 64]} />
        <meshBasicMaterial color={blue} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {lineObj && <primitive object={lineObj} position={[0, 0.3, 0]} />}

      {/*
        ARCH LINUX — split across two lines for drama and visual balance.
        fontSize responds to viewport distance so the text always reads well.
      */}
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.85}
        font={DISPLAY_FONT}
        color={cyan}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor={blue}
        letterSpacing={0.35}
      >
        ARCH
      </Text>
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.85}
        font={DISPLAY_FONT}
        color={cyan}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor={blue}
        letterSpacing={0.35}
      >
        LINUX
      </Text>

      <Text position={[0, -0.9, 0]} fontSize={0.2} color="#6b8aad" anchorX="center" anchorY="middle" letterSpacing={0.08}>
        Keep It Simple Stupid
      </Text>

      <Text position={[0, -1.55, 0]} fontSize={0.16} color={blue} anchorX="center" anchorY="middle">
        {'>'} Scroll to explore _
      </Text>
    </group>
  )
}