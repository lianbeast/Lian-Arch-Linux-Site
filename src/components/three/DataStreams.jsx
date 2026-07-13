import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STREAM_COUNT = 20

export default function DataStreams({ position = [0, 0, -15] }) {
  const groupRef = useRef()
  const lineObjs = useRef([])

  const streams = useMemo(() => {
    return Array.from({ length: STREAM_COUNT }, () => ({
      y: (Math.random() - 0.5) * 20,
      z: -5 - Math.random() * 20,
      speed: 8 + Math.random() * 15,
      length: 2 + Math.random() * 6,
      offset: Math.random() * 100,
      color: Math.random() < 0.7 ? '#1793D1' : '#00d4ff',
    }))
  }, [])

  useEffect(() => {
    const objs = streams.map((s) => {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(s.length, 0, 0),
      ])
      const mat = new THREE.LineBasicMaterial({
        color: s.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const obj = new THREE.Line(geom, mat)
      obj.position.set(0, s.y, s.z)
      return obj
    })
    lineObjs.current = objs
    objs.forEach(o => groupRef.current?.add(o))
    return () => {
      objs.forEach(o => {
        o.geometry.dispose()
        o.material.dispose()
        groupRef.current?.remove(o)
      })
    }
  }, [streams])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    streams.forEach((s, i) => {
      const obj = lineObjs.current[i]
      if (!obj) return
      obj.position.x = ((t * s.speed + s.offset) % 30) - 15
      obj.material.opacity = 0.3 + Math.sin(t * 2 + i) * 0.15
    })
  })

  return <group ref={groupRef} position={position} />
}
