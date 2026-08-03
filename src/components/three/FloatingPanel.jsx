import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Html } from '@react-three/drei'
import * as THREE from 'three'
import TerminalFetch from '../ui/TerminalFetch'

// All card text uses the self-hosted theme font (troika needs a real TTF).
// Glyphs below are verified against JetBrains Mono's cmap — no tofu.
const CARD_FONT = `${import.meta.env.BASE_URL}fonts/JetBrainsMono-Regular.ttf`

const installSteps = [
  '$ fdisk /dev/sda',
  '$ mkfs.ext4 /dev/sda2',
  '$ pacstrap /mnt base linux',
  '$ genfstab -U /mnt',
  '$ arch-chroot /mnt',
  '$ bootctl install',
  '$ reboot',
]

const pacmanCmds = [
  { cmd: 'pacman -S pkg', desc: 'Install' },
  { cmd: 'pacman -Syu', desc: 'Upgrade' },
  { cmd: 'pacman -R pkg', desc: 'Remove' },
  { cmd: 'pacman -Ss key', desc: 'Search' },
  { cmd: 'yay -S aur-pkg', desc: 'AUR install' },
]

const communityLinks = [
  { title: 'Arch Wiki', url: 'wiki.archlinux.org' },
  { title: 'Forum', url: 'bbs.archlinux.org' },
  { title: 'IRC #archlinux', url: 'libera.chat' },
  { title: 'GitLab', url: 'gitlab.archlinux.org' },
  { title: 'Reddit', url: 'r/archlinux' },
  { title: 'Mastodon', url: '@archlinux' },
]

const gameControls = [
  { cmd: '\u2190 \u2191 \u2192 \u2193', desc: 'move', size: 0.2 },
  { cmd: 'ESC', desc: 'quit', size: 0.14 },
]

function PanelBackground({ width = 5, height = 4, active }) {
  const meshRef = useRef()
  useFrame(() => {
    if (meshRef.current) meshRef.current.material.opacity = active ? 0.85 : 0.4
  })
  return (
    <RoundedBox ref={meshRef} args={[width, height, 0.05]} radius={0.08} smoothness={4}>
      <meshPhysicalMaterial color="#0a1628" transparent opacity={0.85} roughness={0.8} metalness={0.1} clearcoat={0.3} clearcoatRoughness={0.4} />
    </RoundedBox>
  )
}

function PanelBorder({ width = 5, height = 4, active }) {
  const geom = useMemo(() => {
    const hw = width / 2 - 0.05
    const hh = height / 2 - 0.05
    const r = 0.08
    const pts = []
    const corners = [
      [hw - r, hh], [-hw + r, hh], [-hw, hh - r], [-hw, -hh + r],
      [-hw + r, -hh], [hw - r, -hh], [hw, -hh + r], [hw, hh - r],
    ]
    for (let c = 0; c < corners.length; c++) {
      const [cx, cy] = corners[c]
      const next = corners[(c + 1) % corners.length]
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        pts.push(new THREE.Vector3(cx + (next[0] - cx) * t, cy + (next[1] - cy) * t, 0.03))
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [width, height])

  return (
    <line geometry={geom}>
      <lineBasicMaterial
        color={active ? '#1793D1' : '#0e2a4a'}
        transparent
        opacity={active ? 0.9 : 0.4}
      />
    </line>
  )
}

function FeaturesContent({ active }) {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center" font={CARD_FONT}>
        {'< features />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center" font={CARD_FONT}>
        Why Arch Linux?
      </Text>
      {/* distanceFactor calibrated (empirically, vs. features camera ~6 units away) so the
          neofetch renders ~400px wide on screen — inside the 5×4 panel instead of overflowing.
          Note: drei Html transform keeps a near-constant on-screen size at any camera distance. */}
      <Html position={[0, -0.35, 0.1]} transform distanceFactor={5} style={{ width: '400px', height: '250px', pointerEvents: 'none', overflow: 'visible' }}>
        <TerminalFetch active={active} />
      </Html>
    </group>
  )
}

function InstallContent() {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center" font={CARD_FONT}>
        {'< install />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center" font={CARD_FONT}>
        Installation Steps
      </Text>
      {installSteps.map((cmd, i) => (
        <group key={i} position={[0, 0.65 - i * 0.25, 0.1]}>
          <Text position={[-2, 0, 0]} fontSize={0.13} color="#1793D1" anchorX="left" font={CARD_FONT}>
            {`${i + 1}.`}
          </Text>
          <Text position={[-1.6, 0, 0]} fontSize={0.12} color="#00d4ff" anchorX="left" font={CARD_FONT}>
            {cmd}
          </Text>
        </group>
      ))}
    </group>
  )
}

function PacmanContent() {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center" font={CARD_FONT}>
        {'< pacman />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center" font={CARD_FONT}>
        Package Management
      </Text>
      {pacmanCmds.map((item, i) => (
        <group key={i} position={[0, 0.6 - i * 0.35, 0.1]}>
          <Text position={[-2, 0, 0]} fontSize={0.14} color="#00d4ff" anchorX="left" font={CARD_FONT}>
            $ {item.cmd}
          </Text>
          <Text position={[1.8, 0, 0]} fontSize={0.11} color="#6b8aad" anchorX="right" font={CARD_FONT}>
            {item.desc}
          </Text>
        </group>
      ))}
      <Text position={[0, -1.3, 0.1]} fontSize={0.12} color="#1793D1" anchorX="center" font={CARD_FONT}>
        AUR: 80,000+ community packages
      </Text>
    </group>
  )
}

function CommunityContent() {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center" font={CARD_FONT}>
        {'< community />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center" font={CARD_FONT}>
        Join the Community
      </Text>
      {communityLinks.map((link, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        return (
          <group key={i} position={[col === 0 ? -1.2 : 1.2, 0.5 - row * 0.65, 0.1]}>
            <Text position={[0, 0.08, 0]} fontSize={0.16} color="#e8f0f8" anchorX="center" font={CARD_FONT}>{link.title}</Text>
            <Text position={[0, -0.12, 0]} fontSize={0.1} color="#00d4ff" anchorX="center" font={CARD_FONT}>{link.url}</Text>
          </group>
        )
      })}
    </group>
  )
}

function GameContent() {
  return (
    <group>
      <Text position={[0, 1.6, 0.1]} fontSize={0.3} color="#1793D1" anchorX="center" font={CARD_FONT}>
        {'< game />'}
      </Text>
      <Text position={[0, 1.2, 0.1]} fontSize={0.22} color="#6b8aad" anchorX="center" font={CARD_FONT}>
        Beat the Ghosts
      </Text>
      <Text position={[0, 0.65, 0.1]} fontSize={0.45} color="#00d4ff" anchorX="center" font={CARD_FONT} outlineWidth={0.03} outlineColor="#1793D1">
        PAC-MAN
      </Text>
      {gameControls.map((item, i) => (
        <group key={i} position={[0, 0.0 - i * 0.5, 0.1]}>
          <Text position={[-2, 0, 0]} fontSize={item.size} color="#00d4ff" anchorX="left" font={CARD_FONT}>
            {item.cmd}
          </Text>
          <Text position={[1.8, 0, 0]} fontSize={0.12} color="#6b8aad" anchorX="right" font={CARD_FONT}>
            {item.desc}
          </Text>
        </group>
      ))}
      <Text position={[0, -1.25, 0.1]} fontSize={0.12} color="#1793D1" anchorX="center" font={CARD_FONT}>
        80,000+ dots to eat
      </Text>
    </group>
  )
}

const contentMap = {
  features: FeaturesContent,
  install: InstallContent,
  pacman: PacmanContent,
  community: CommunityContent,
  game: GameContent,
}

export default function FloatingPanel({ position, active, type }) {
  const groupRef = useRef()
  const Content = contentMap[type]
  const _scaleTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    groupRef.current.position.y = position.y + Math.sin(t * 0.4 + position.x) * 0.08
    groupRef.current.rotation.y = Math.sin(t * 0.2 + position.z) * 0.03
    const s = active ? 1 : 0.85
    groupRef.current.scale.lerp(_scaleTarget.set(s, s, s), 0.05)
  })

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <PanelBackground width={5} height={4} active={active} />
      <PanelBorder width={5} height={4} active={active} />
      {Content && <Content active={active} />}
      {active && <pointLight position={[0, 0, 2]} intensity={0.5} color="#1793D1" distance={8} />}
    </group>
  )
}
