import { palette, room } from './palette'

const halfW = room.width / 2
const halfD = room.depth / 2

function Shell() {
  return (
    <group>
      {/* floor runs past the open front edge so it reaches the camera */}
      <mesh rotation-x={-Math.PI / 2} position-z={2} receiveShadow>
        <planeGeometry args={[room.width, room.depth + 4]} />
        <meshStandardMaterial color={palette.floor} roughness={0.55} />
      </mesh>
      <mesh position={[0, room.height / 2, -halfD]} receiveShadow>
        <planeGeometry args={[room.width, room.height]} />
        <meshStandardMaterial color={palette.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-halfW, room.height / 2, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[room.depth, room.height]} />
        <meshStandardMaterial color={palette.wallSide} roughness={0.9} />
      </mesh>
      <mesh position={[halfW, room.height / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[room.depth, room.height]} />
        <meshStandardMaterial color={palette.wallSide} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Screen() {
  return (
    <group position={[0, 1.75, -halfD + 0.04]}>
      <mesh castShadow>
        <boxGeometry args={[3.3, 1.86, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>
      <mesh position-z={0.031}>
        <planeGeometry args={[3.2, 1.78]} />
        <meshStandardMaterial
          color={palette.screen}
          emissive={palette.screenGlow}
          emissiveIntensity={0.55}
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}

function Speaker({ x }: { x: number }) {
  return (
    <group position={[x, 0, -halfD + 0.7]}>
      <mesh position-y={0.6} castShadow>
        <boxGeometry args={[0.36, 1.2, 0.38]} />
        <meshStandardMaterial color={palette.speaker} roughness={0.35} />
      </mesh>
      {[0.95, 0.62, 0.32].map((y, i) => (
        <mesh key={y} position={[0, y, 0.191]}>
          <circleGeometry args={[i === 0 ? 0.06 : 0.12, 32]} />
          <meshStandardMaterial color={palette.cone} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Sofa() {
  const fabric = <meshStandardMaterial color={palette.fabric} roughness={0.95} />
  return (
    <group position={[0, 0, 1.6]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.48, 1.05]} />
        {fabric}
      </mesh>
      <mesh position={[0, 0.7, 0.42]} castShadow>
        <boxGeometry args={[3, 0.5, 0.22]} />
        {fabric}
      </mesh>
      {[-1.58, 1.58].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} castShadow>
          <boxGeometry args={[0.18, 0.72, 1.05]} />
          <meshStandardMaterial color={palette.fabricDark} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function Rug() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0.4]} receiveShadow>
      <planeGeometry args={[4.4, 3.4]} />
      <meshStandardMaterial color={palette.rug} roughness={1} />
    </mesh>
  )
}

export function Room() {
  return (
    <group>
      <Shell />
      <Rug />
      <Screen />
      <Speaker x={-2.3} />
      <Speaker x={2.3} />
      <Sofa />
    </group>
  )
}
