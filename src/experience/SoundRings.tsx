import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Color, type Mesh, type MeshBasicMaterial } from 'three'
import { rtAt, tone } from '../lib/acoustics'
import { speakerX, speakerZ } from './palette'
import type { Progress } from './Treatments'

const POOL = 36
const PULSE_EVERY = 1.8
const SPEED = 3.2 // metres per second, slowed down from 343 so the eye can follow it
const VISUAL_STRETCH = 3 // makes decay readable at walking pace

// Reflections that arrive after the direct sound in a bare room: [delay in s, relative level].
const ECHOES = [
  [0.22, 0.6],
  [0.45, 0.4],
  [0.7, 0.26],
] as const

type Ring = { born: number; x: number; level: number; active: boolean }

const untreated = new Color(tone.untreated)
const treated = new Color(tone.treated)

/** Pulses spreading across the floor from both speakers; how long they linger follows the room's RT60. */
export function SoundRings({ progress }: { progress: Progress }) {
  const meshes = useRef<(Mesh | null)[]>([])
  const rings = useMemo<Ring[]>(() => Array.from({ length: POOL }, () => ({ born: 0, x: 0, level: 0, active: false })), [])
  const nextPulse = useRef(0.4)
  // own running time, because the renderer's clock jumps when the loop pauses off screen
  const time = useRef(0)
  const color = useMemo(() => new Color(), [])

  const emit = (born: number, x: number, level: number) => {
    const ring = rings.find((r) => !r.active)
    if (ring) Object.assign(ring, { born, x, level, active: true })
  }

  useFrame((_, delta) => {
    time.current += Math.min(delta, 0.1)
    const now = time.current
    const p = progress.current
    const rt = rtAt(p) * VISUAL_STRETCH

    if (now >= nextPulse.current) {
      nextPulse.current = now + PULSE_EVERY
      for (const x of [-speakerX, speakerX]) {
        emit(now, x, 1)
        // treatment removes most of the reflections, so their echo rings fade away with it
        for (const [delay, level] of ECHOES) emit(now + delay, x, level * (1 - p) ** 1.5)
      }
    }

    color.copy(untreated).lerp(treated, p)

    rings.forEach((ring, i) => {
      const mesh = meshes.current[i]
      if (!mesh) return
      const age = now - ring.born
      const opacity = ring.active && age >= 0 ? ring.level * Math.exp((-6.9 * age) / rt) * 0.8 : 0
      if (ring.active && age > 0 && opacity < 0.004) ring.active = false
      mesh.visible = opacity > 0.004
      if (!mesh.visible) return
      mesh.position.x = ring.x
      mesh.scale.setScalar(0.2 + age * SPEED)
      const material = mesh.material as MeshBasicMaterial
      material.opacity = opacity
      material.color.copy(color)
    })
  })

  return (
    <group position={[0, 0.03, speakerZ + 0.3]}>
      {rings.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m
          }}
          rotation-x={-Math.PI / 2}
          visible={false}
        >
          <ringGeometry args={[0.9, 1, 96, 1, Math.PI * 1.02, Math.PI * 0.96]} />
          <meshBasicMaterial transparent depthWrite={false} blending={AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}
