import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { MathUtils, type PerspectiveCamera } from 'three'

const BASE_FOV = 42
const MAX_FOV = 74
// tan of the half-angle that keeps both side walls in frame from the default camera spot
const WALLS_IN_VIEW = 0.52

/** Widens the lens on tall, narrow screens so the side walls, where the treatment goes, stay in view. */
export function CameraRig() {
  const get = useThree((s) => s.get)
  const size = useThree((s) => s.size)

  useLayoutEffect(() => {
    const camera = get().camera as PerspectiveCamera
    const aspect = size.width / Math.max(size.height, 1)
    const base = Math.tan(MathUtils.degToRad(BASE_FOV / 2))
    const needed = Math.max(base, WALLS_IN_VIEW / aspect)
    camera.fov = Math.min(MAX_FOV, MathUtils.radToDeg(2 * Math.atan(needed)))
    camera.updateProjectionMatrix()
  }, [get, size])

  return null
}
