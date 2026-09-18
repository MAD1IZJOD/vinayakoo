import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { Color, MathUtils, Object3D, Plane, Raycaster, Vector2, Vector3, type Group, type InstancedMesh, type PointLight } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// phones and tablets get a smaller wall and no shadows
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const COLS = coarse ? 20 : 34
const ROWS = coarse ? 26 : 22
const CELL = 0.2
const BLOCK_LENGTH = 0.9
// Well depths follow a 2D quadratic residue sequence, (i² + j²) mod N, the pattern real
// "skyline" diffusers are cut to.
const PRIME = 13
const MAX_DEPTH = 0.55

const SPEED = 2.6 // how fast a ripple spreads across the wall, in metres per second
const RING = 0.26 // thickness of each ripple
const DECAY = 1.5 // a treated room: pulses die away quickly
const MAX_RIPPLES = 16
const IDLE_CLAP = 2.8 // seconds between claps when nobody is interacting

type Ripple = { x: number; y: number; born: number; amp: number }

const woods = ['#5c4330', '#6d5038', '#4c3727', '#7a5a3d'].map((c) => new Color(c))
const crest = new Color('#f3cf93')

const ZERO = new Vector2()

const smoothstep = (t: number) => t * t * (3 - 2 * t)

type Pointer = { ndc: Vector2; tap: Vector2; moved: number; down: number; inside: boolean }

/** Tracks the pointer over the hero (the canvas itself ignores events so the page stays scrollable). */
function usePointer(target: RefObject<HTMLElement | null>) {
  const gl = useThree((s) => s.gl)
  const pointer = useRef<Pointer>({ ndc: new Vector2(), tap: new Vector2(), moved: -1, down: -1, inside: false })

  useEffect(() => {
    const el = target.current
    if (!el) return
    const toNdc = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      pointer.current.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      pointer.current.inside = true
    }
    const move = (e: PointerEvent) => {
      toNdc(e)
      pointer.current.moved = performance.now()
    }
    const down = (e: PointerEvent) => {
      // taps on links and buttons shouldn't clap
      if ((e.target as Element).closest('a, button')) return
      toNdc(e)
      // kept apart from the hover position, because on touch screens the pointer has usually
      // left again by the next frame
      pointer.current.tap.copy(pointer.current.ndc)
      pointer.current.down = performance.now()
    }
    const leave = () => {
      pointer.current.inside = false
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerleave', leave)
    }
  }, [gl, target])

  return pointer
}

const createWallState = () => ({
      time: 0,
      ripples: [] as Ripple[],
      lastSpawn: { x: 0, y: 0, at: -10 },
      lastDown: -1,
      nextIdle: 0.9, // the wall wakes up with a clap shortly after it appears
      flash: 0,
      tilt: new Vector2(),
      hit: new Vector3(),
      local: new Vector3(),
      plane: new Plane(),
      normal: new Vector3(),
      raycaster: new Raycaster(),
      dummy: new Object3D(),
      color: new Color(),
    })

function Wall({ target, still }: { target: RefObject<HTMLElement | null>; still: boolean }) {
  const group = useRef<Group>(null)
  const mesh = useRef<InstancedMesh>(null)
  const glow = useRef<PointLight>(null)
  const size = useThree((s) => s.size)
  const pointer = usePointer(target)

  const cells = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, (_, n) => {
        const i = n % COLS
        const j = Math.floor(n / COLS)
        return {
          x: (i - (COLS - 1) / 2) * CELL,
          y: (j - (ROWS - 1) / 2) * CELL,
          depth: 0.05 + (((i * i + j * j) % PRIME) / PRIME) * MAX_DEPTH,
          wood: woods[(i * 7 + j * 13) % woods.length],
        }
      }),
    [],
  )

  const geometry = useMemo(() => new RoundedBoxGeometry(CELL * 0.92, CELL * 0.92, BLOCK_LENGTH, 2, 0.018), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const stateRef = useRef(createWallState())

  const clap = (x: number, y: number, amp: number, now: number) => {
    const { ripples } = stateRef.current
    if (ripples.length >= MAX_RIPPLES) ripples.shift()
    ripples.push({ x, y, born: now, amp })
  }

  // lay the wall out once, so it looks right even before (or without) animation
  useLayoutEffect(() => {
    const state = stateRef.current
    const m = mesh.current
    if (!m) return
    cells.forEach((cell, n) => {
      state.dummy.position.set(cell.x, cell.y, cell.depth - BLOCK_LENGTH / 2)
      state.dummy.updateMatrix()
      m.setMatrixAt(n, state.dummy.matrix)
      m.setColorAt(n, cell.wood)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [cells])

  useFrame(({ camera }, delta) => {
    const g = group.current
    const m = mesh.current
    if (!g || !m) return
    const state = stateRef.current
    const dt = Math.min(delta, 0.1)
    // the wall keeps its own time: the renderer's clock jumps when the loop pauses off screen,
    // which would give ripples a negative age
    state.time += dt
    const now = state.time
    const wide = size.width / size.height > 1

    // framing: on wide screens the wall recedes to the right of the headline, on tall ones it
    // lies back beneath it like a floor seen at a raking angle
    const intro = still ? 1 : smoothstep(Math.min(1, now / 2.4))
    const scroll = Math.min(1.2, window.scrollY / window.innerHeight)
    const p = pointer.current
    state.tilt.lerp(p.inside ? p.ndc : ZERO, 1 - Math.exp(-dt * 3))

    if (wide) {
      g.position.set(3, -0.2 - scroll * 0.9, -1.6 - 1.4 * (1 - intro))
      g.rotation.set(0.1 + scroll * 0.45 - state.tilt.y * 0.06, -0.62 + (1 - intro) * 0.5 + state.tilt.x * 0.1, 0)
    } else {
      g.position.set(0, -1.9 - scroll * 0.8, -1 - 1.4 * (1 - intro))
      g.rotation.set(-0.95 + scroll * 0.3 + (1 - intro) * 0.4, -0.35 + state.tilt.x * 0.08, 0)
    }
    g.updateMatrixWorld()

    const halfW = (COLS * CELL) / 2
    const halfH = (ROWS * CELL) / 2
    state.normal.set(0, 0, 1).transformDirection(g.matrixWorld)
    state.plane.setFromNormalAndCoplanarPoint(state.normal, g.getWorldPosition(state.hit))

    /** Where a screen position meets the blocks, in the wall's own coordinates. */
    const onWall = (ndc: Vector2) => {
      state.raycaster.setFromCamera(ndc, camera)
      if (!state.raycaster.ray.intersectPlane(state.plane, state.hit)) return null
      const local = g.worldToLocal(state.local.copy(state.hit))
      return Math.abs(local.x) < halfW && Math.abs(local.y) < halfH ? local : null
    }

    const perfNow = performance.now()

    if (!still && p.down !== state.lastDown) {
      // clicking or tapping claps where the pointer is
      state.lastDown = p.down
      const at = onWall(p.tap)
      if (at) {
        clap(at.x, at.y, 0.75, now)
        state.flash = 1
        glow.current?.position.copy(state.hit).addScaledVector(state.normal, 0.9)
      }
    }

    const local = p.inside ? onWall(p.ndc) : null
    const onGrid = local !== null
    if (local && glow.current) glow.current.position.copy(state.hit).addScaledVector(state.normal, 0.9)

    if (!still) {
      // moving across the wall leaves a trail of small pulses
      if (onGrid && local && perfNow - p.moved < 100) {
        const d = Math.hypot(local.x - state.lastSpawn.x, local.y - state.lastSpawn.y)
        if (d > 0.45 || (d > 0.1 && now - state.lastSpawn.at > 0.25)) {
          clap(local.x, local.y, 0.22, now)
          Object.assign(state.lastSpawn, { x: local.x, y: local.y, at: now })
        }
      }
      // when nobody is playing with it, the room claps on its own
      const idle = perfNow - Math.max(p.moved, p.down) > 2500
      if (idle && now > state.nextIdle) {
        state.nextIdle = now + IDLE_CLAP
        clap(MathUtils.randFloatSpread(halfW * 1.2), MathUtils.randFloatSpread(halfH * 1.2), 0.55, now)
      }
    }

    state.ripples = state.ripples.filter((r) => now - r.born < 4)
    state.flash = Math.max(0, state.flash - dt * 2.5)
    if (glow.current) {
      glow.current.intensity = MathUtils.damp(glow.current.intensity, (onGrid ? 3 : 0) + state.flash * 14, 6, dt)
    }

    cells.forEach((cell, n) => {
      let lift = 0
      for (const r of state.ripples) {
        const age = now - r.born
        const off = Math.hypot(cell.x - r.x, cell.y - r.y) - age * SPEED
        lift += r.amp * Math.exp(-age * DECAY) * Math.exp(-(off * off) / (2 * RING * RING))
      }
      state.dummy.position.set(cell.x, cell.y, cell.depth + lift * 0.45 - BLOCK_LENGTH / 2)
      state.dummy.updateMatrix()
      m.setMatrixAt(n, state.dummy.matrix)
      m.setColorAt(n, state.color.copy(cell.wood).lerp(crest, Math.min(1, lift * 1.8)))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })

  return (
    <>
      <group ref={group}>
        {/* backing board the blocks are mounted on */}
        <mesh receiveShadow>
          <planeGeometry args={[COLS * CELL + 0.24, ROWS * CELL + 0.24]} />
          <meshStandardMaterial color="#1c1611" roughness={1} />
        </mesh>
        <instancedMesh ref={mesh} args={[geometry, undefined, COLS * ROWS]} castShadow={!coarse} receiveShadow={!coarse}>
          <meshStandardMaterial roughness={0.62} />
        </instancedMesh>
      </group>
      <pointLight ref={glow} intensity={0} distance={3.2} decay={1.6} color="#ffcf8a" />
    </>
  )
}

type Props = {
  /** Element whose pointer events drive the wall, usually the whole hero. */
  target: RefObject<HTMLElement | null>
  active: boolean
  still: boolean
}

export default function DiffuserCanvas({ target, active, still }: Props) {
  return (
    <Canvas
      shadows={!coarse}
      dpr={coarse ? [1, 1.5] : [1, 2]}
      frameloop={still ? 'demand' : active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6.5], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <color attach="background" args={['#16130f']} />
      <fog attach="fog" args={['#16130f', 6, 12.5]} />

      <ambientLight intensity={0.18} color="#fff1dc" />
      {/* a low, raking key light so every block throws a shadow across its neighbours */}
      <directionalLight
        position={[-5, 3.2, 3]}
        intensity={2}
        color="#ffd6a3"
        castShadow={!coarse}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[5, -2, 2]} intensity={0.45} color="#6f8db0" />

      <Wall target={target} still={still} />
    </Canvas>
  )
}
