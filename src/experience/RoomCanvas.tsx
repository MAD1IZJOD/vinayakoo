import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type ComponentRef } from 'react'
import { MathUtils, type SpotLight } from 'three'
import { CameraRig } from './CameraRig'
import { Room } from './Room'
import { SoundRings } from './SoundRings'
import { Treatments, type Progress } from './Treatments'
import { palette } from './palette'

function WallWash({ x }: { x: number }) {
  const light = useRef<SpotLight>(null)

  useLayoutEffect(() => {
    if (!light.current) return
    light.current.target.position.set(x * 1.2, 0, -1)
    light.current.target.updateMatrixWorld()
  }, [x])

  return (
    <spotLight ref={light} position={[x, 3.3, 0.5]} angle={0.8} penumbra={1} intensity={28} color="#ffcf98" />
  )
}

function Scene({ treated }: { treated: boolean }) {
  const progress = useRef(treated ? 1 : 0) as Progress

  useFrame((_, delta) => {
    const target = treated ? 1 : 0
    // capped delta keeps the transition smooth after the tab has been in the background
    progress.current = MathUtils.damp(progress.current, target, 2.4, Math.min(delta, 0.1))
    if (Math.abs(progress.current - target) < 0.0005) progress.current = target
  })

  return (
    <>
      <Room />
      <Treatments progress={progress} />
      <SoundRings progress={progress} />
    </>
  )
}

function Controls() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const released = useRef(false)

  // OrbitControls claims every touch when it connects; once it has, let vertical swipes scroll the
  // page again and keep sideways drags for looking around
  useFrame(() => {
    const el = controls.current?.domElement
    if (released.current || !el) return
    el.style.touchAction = 'pan-y'
    released.current = true
  })

  return (
    <OrbitControls
      ref={controls}
      target={[0, 1.1, -0.6]}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      minAzimuthAngle={-0.6}
      maxAzimuthAngle={0.6}
      minPolarAngle={1.05}
      maxPolarAngle={1.45}
      rotateSpeed={0.5}
    />
  )
}

// phones and tablets get a lighter render
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

type Props = {
  treated: boolean
  active: boolean
}

export default function RoomCanvas({ treated, active }: Props) {
  return (
    <Canvas
      shadows="percentage"
      dpr={coarse ? [1, 1.5] : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 2.6, 8.6], fov: 42 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#16130f']} />
      <fog attach="fog" args={['#16130f', 11, 20]} />

      <ambientLight intensity={0.9} color="#fff1dc" />
      <hemisphereLight args={['#f3dfbf', '#1a1410', 1.1]} />
      <spotLight
        position={[0, 3.3, 2]}
        angle={1}
        penumbra={0.9}
        intensity={60}
        color="#ffdcae"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <WallWash x={-3.4} />
      <WallWash x={3.4} />
      <pointLight position={[0, 1.8, -2.6]} intensity={6} distance={6} color={palette.screenGlow} />

      <Scene treated={treated} />

      <CameraRig />
      <Controls />
    </Canvas>
  )
}
