import { useEffect, useRef, useState } from 'react'

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

/** Eases a number towards `target` over `duration` ms, starting from wherever it currently is. */
export function useTween(target: number, duration = 1400) {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    const from = current.current
    if (from === target) return
    const ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms)
      current.current = from + (target - from) * easeInOut(t)
      setValue(current.current)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
