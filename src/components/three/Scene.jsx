import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Starfield from './Starfield'
import ArchLogo from './ArchLogo'
import FloatingPanel from './FloatingPanel'
import GridFloor from './GridFloor'
import GlowOrb from './GlowOrb'
import MatrixRain from './MatrixRain'
import DataStreams from './DataStreams'

const sectionPositions = [
  new THREE.Vector3(0, 0, 5),
  new THREE.Vector3(-7, 1.5, -2),
  new THREE.Vector3(7, -1, -4),
  new THREE.Vector3(-5, -2, -8),
  new THREE.Vector3(6, 2, -12),
  new THREE.Vector3(0, 0, -2),
]

const sectionCameras = [
  new THREE.Vector3(0, 0, 8),
  new THREE.Vector3(-7, 1.5, 4),
  new THREE.Vector3(7, -1, 2),
  new THREE.Vector3(-5, -2, -1),
  new THREE.Vector3(6, 2, -5),
  new THREE.Vector3(0, 0, 5),
]

// Cameras sit at different distances from their panels (features/install at 6, the rest at 7), so
// the 5×4 cards would project at different on-screen sizes. Scale each card by distance/6 to unify
// projection at the nearest camera's size — same world fonts now render at the same pixel size.
const CARD_PROJ = sectionCameras.map((cam, i) => cam.distanceTo(sectionPositions[i]) / 6)

const _prefersReduced = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const BASE_DUST = _prefersReduced ? 50 : 200
const BASE_STARS = _prefersReduced ? 200 : 800

const TIER = { low: { stars: 200, dust: 30, rainOpacity: 0, glowOrbs: 0, dataStreams: false, bloom: false },
               medium: { stars: 400, dust: 80, rainOpacity: 0.06, glowOrbs: 1, dataStreams: true, bloom: false },
               high: { stars: BASE_STARS, dust: BASE_DUST, rainOpacity: 0.12, glowOrbs: 3, dataStreams: true, bloom: true } }

const SECTION_LIGHTS = [
  { ambient: '#ffffff', point1: '#ffffff' },    // home
  { ambient: '#1793D1', point1: '#1793D1' },    // features
  { ambient: '#ff8800', point1: '#ff8800' },    // install
  { ambient: '#00ff41', point1: '#00ff41' },    // pacman
  { ambient: '#00d4ff', point1: '#00d4ff' },    // community
  { ambient: '#ffffff', point1: '#ffffff' },    // game
]

const _tempColor = new THREE.Color()

// Precompute dust particle positions per count (cached — avoids Math.random during render)
const DUST_CACHE = new Map()
function buildDust(count) {
  if (DUST_CACHE.has(count)) return DUST_CACHE.get(count)
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 40
    arr[i * 3 + 1] = (Math.random() - 0.5) * 30
    arr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10
  }
  DUST_CACHE.set(count, arr)
  return arr
}

export default function Scene({ activeSection, qualityTier = 'high' }) {
  const { camera } = useThree()
  const _lookTarget = useMemo(() => new THREE.Vector3(), [])
  const _camDir = useMemo(() => new THREE.Vector3(), [])
  const tier = TIER[qualityTier] || TIER.high

  // Light refs for per-section color transitions
  const ambientRef = useRef(null)
  const pointLight1Ref = useRef(null)

  const dustPositions = buildDust(tier.dust)

  useFrame((_, delta) => {
    const targetCam = sectionCameras[activeSection]
    const targetLook = sectionPositions[activeSection]

    camera.position.lerp(targetCam, Math.min(delta * 2, 0.1))

    camera.getWorldDirection(_camDir)
    _lookTarget.copy(camera.position).add(_camDir)
    _lookTarget.lerp(targetLook, Math.min(delta * 2, 0.1))
    camera.lookAt(_lookTarget)

    // Light color transitions
    const lightTarget = SECTION_LIGHTS[activeSection]
    if (ambientRef.current && lightTarget) {
      ambientRef.current.color.lerp(_tempColor.set(lightTarget.ambient), delta * 3)
    }
    if (pointLight1Ref.current && lightTarget) {
      pointLight1Ref.current.color.lerp(_tempColor.set(lightTarget.point1), delta * 3)
    }
  })

  const sceneContent = (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 15, 45]} />

      <ambientLight ref={ambientRef} intensity={0.2} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />
      <pointLight ref={pointLight1Ref} position={[-5, 3, 2]} intensity={0.5} color="#ffffff" distance={20} />
      <pointLight position={[5, -3, -5]} intensity={0.3} color="#00ff41" distance={25} />

      <Starfield count={tier.stars} />
      <GridFloor />
      {tier.rainOpacity > 0 && <MatrixRain position={[0, 5, -25]} opacity={tier.rainOpacity} />}
      {tier.dataStreams && <DataStreams position={[0, 0, -10]} />}

      {tier.glowOrbs >= 1 && <GlowOrb position={[-8, 4, -10]} size={0.5} color="#00ff00" speed={0.3} />}
      {tier.glowOrbs >= 2 && <GlowOrb position={[10, -2, -15]} size={0.7} color="#00ff41" speed={0.2} />}
      {tier.glowOrbs >= 3 && <GlowOrb position={[3, 5, -20]} size={0.4} color="#00ff00" speed={0.4} />}

      {tier.dust > 0 && (
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={tier.dust} array={dustPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#00ff00" transparent opacity={0.3} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      )}

      <ArchLogo position={sectionPositions[0]} />

      <FloatingPanel position={sectionPositions[1]} active={activeSection === 1} type="features" scale={CARD_PROJ[1]} />
      <FloatingPanel position={sectionPositions[2]} active={activeSection === 2} type="install" scale={CARD_PROJ[2]} />
      <FloatingPanel position={sectionPositions[3]} active={activeSection === 3} type="pacman" scale={CARD_PROJ[3]} />
      <FloatingPanel position={sectionPositions[4]} active={activeSection === 4} type="community" scale={CARD_PROJ[4]} />
      <FloatingPanel position={sectionPositions[5]} active={activeSection === 5} type="game" scale={CARD_PROJ[5]} />
    </>
  )

  return (
    <>
      {tier.bloom ? (
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.9} luminanceSmoothing={0.02} radius={0.2} mipmapBlur />
          {sceneContent}
        </EffectComposer>
      ) : sceneContent}
    </>
  )
}
