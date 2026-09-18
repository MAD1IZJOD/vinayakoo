import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { room } from './palette'

export type Progress = { current: number }

const halfW = room.width / 2
const halfD = room.depth / 2

const smooth = (x: number) => x * x * (3 - 2 * x)

/** Maps overall progress to this element's own 0..1, so pieces arrive one after another. */
const windowed = (p: number, from: number, to: number) => smooth(Math.min(1, Math.max(0, (p - from) / (to - from))))

// Quadratic residue sequence for N = 7, which sets the well depths of a QRD diffuser.
const QRD = [0, 1, 4, 2, 2, 4, 1]

function useReveal(progress: Progress, from: number, to: number, apply: (group: Group, t: number) => void) {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const group = ref.current
    if (!group) return
    const t = windowed(progress.current, from, to)
    group.visible = t > 0.001
    apply(group, t)
  })
  return ref
}

function Panel({ side, z, index, progress }: { side: -1 | 1; z: number; index: number; progress: Progress }) {
  const from = 0.05 + index * 0.06
  const ref = useReveal(progress, from, from + 0.3, (g, t) => g.scale.set(1, Math.max(t, 0.001), 1))
  const tone = index % 2 ? '#7a6048' : '#6b5541'

  return (
    <group ref={ref} position={[side * (halfW - 0.06), 1.55, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.1, 1.4, 1.05]} />
        <meshStandardMaterial color={tone} roughness={1} />
      </mesh>
      <mesh position={[-side * 0.052, -0.72, 0]}>
        <boxGeometry args={[0.01, 0.025, 1.05]} />
        <meshStandardMaterial color="#c9a46a" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Diffuser({ x, progress }: { x: number; progress: Progress }) {
  const ref = useRef<Group>(null)
  const well = 0.13

  useFrame(() => {
    const group = ref.current
    if (!group) return
    group.visible = progress.current > 0.25
    group.children.forEach((slat, i) => {
      const t = windowed(progress.current, 0.3 + i * 0.03, 0.55 + i * 0.03)
      slat.scale.z = Math.max(t, 0.001)
    })
  })

  return (
    <group ref={ref} position={[x, 1.6, -halfD]}>
      {QRD.map((depth, i) => {
        const d = 0.06 + depth * 0.06
        // each slat's group sits on the wall, so scaling it grows the slat out into the room
        return (
          <group key={i} position-x={(i - 3) * well} scale-z={0.001}>
            <mesh position-z={d / 2} castShadow>
              <boxGeometry args={[well - 0.012, 2.2, d]} />
              <meshStandardMaterial color={i % 2 ? '#8d6b48' : '#7d5e3f'} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function BassTrap({ side, progress }: { side: -1 | 1; progress: Progress }) {
  const ref = useReveal(progress, 0.45, 0.75, (g, t) => g.scale.set(Math.max(t, 0.001), 1, Math.max(t, 0.001)))

  return (
    <group ref={ref} position={[side * halfW, room.height / 2, -halfD]}>
      <mesh rotation-y={Math.PI / 4} castShadow>
        <boxGeometry args={[0.95, room.height, 0.95]} />
        <meshStandardMaterial color="#56463a" roughness={1} />
      </mesh>
    </group>
  )
}

function Cloud({ progress }: { progress: Progress }) {
  const ref = useReveal(progress, 0.6, 1, (g, t) => {
    g.position.y = 3.9 - 0.85 * t
  })

  return (
    <group ref={ref} position={[0, 3.9, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[3.2, 0.12, 2.2]} />
        <meshStandardMaterial color="#6b5541" roughness={1} />
      </mesh>
      {[-1.4, 1.4].map((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.23, z]}>
            <cylinderGeometry args={[0.006, 0.006, 0.35]} />
            <meshStandardMaterial color="#c9a46a" metalness={0.8} roughness={0.35} />
          </mesh>
        )),
      )}
    </group>
  )
}

export function Treatments({ progress }: { progress: Progress }) {
  return (
    <group>
      {([-1, 1] as const).map((side) =>
        [-1.9, -0.4, 1.1].map((z, i) => (
          <Panel key={`${side}${z}`} side={side} z={z} index={i + (side > 0 ? 3 : 0)} progress={progress} />
        )),
      )}
      <Diffuser x={-3.1} progress={progress} />
      <Diffuser x={3.1} progress={progress} />
      <BassTrap side={-1} progress={progress} />
      <BassTrap side={1} progress={progress} />
      <Cloud progress={progress} />
    </group>
  )
}
