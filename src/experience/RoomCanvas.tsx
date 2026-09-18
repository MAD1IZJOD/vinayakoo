import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import type { SpotLight } from 'three'
import { Room } from './Room'
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

export default function RoomCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
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
      {/* warm grazing light along each side wall */}
      <WallWash x={-3.4} />
      <WallWash x={3.4} />
      <pointLight position={[0, 1.8, -2.6]} intensity={6} distance={6} color={palette.screenGlow} />

      <Room />

      <OrbitControls
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
    </Canvas>
  )
}
