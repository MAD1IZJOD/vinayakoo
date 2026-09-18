import { useEffect, useRef } from 'react'
import { RT60 } from '../lib/acoustics'
import './Waveform.css'

const CYCLE = 6 // seconds: a clap in a bare room, then the same clap once it has been treated

/**
 * A slow oscilloscope trace across the hero. Each clap rings out for the untreated RT60,
 * then the next one dies away at the treated RT60, drawn in brass.
 */
export function Waveform() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = el.clientWidth
      height = el.clientHeight
      el.width = width * dpr
      el.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // amplitude of the trace at a given time within the cycle
    const signal = (t: number) => {
      const half = CYCLE / 2
      const treated = t >= half
      const local = treated ? t - half : t
      const rt = (treated ? RT60.treated : RT60.untreated) * 1.6
      if (local < 0.25) return 0
      const age = local - 0.25
      const envelope = Math.exp((-6.9 * age) / rt)
      return envelope * (Math.sin(age * 64) * 0.7 + Math.sin(age * 150 + 1.3) * 0.3)
    }

    const draw = (now: number) => {
      const time = reduced ? 0.9 : (now / 1000) % CYCLE
      ctx.clearRect(0, 0, width, height)
      const mid = height / 2
      const amp = height * 0.42
      const span = 1.4 // seconds of signal visible across the width

      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, 'rgba(201, 164, 106, 0)')
      gradient.addColorStop(0.35, 'rgba(201, 164, 106, 0.55)')
      gradient.addColorStop(1, 'rgba(224, 189, 130, 0.9)')
      ctx.strokeStyle = gradient

      ctx.beginPath()
      for (let x = 0; x <= width; x += 2) {
        const t = time - span + (x / width) * span
        const y = mid - signal(((t % CYCLE) + CYCLE) % CYCLE) * amp
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      if (!reduced) frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(() => {
      resize()
      if (reduced) draw(0)
    })
    observer.observe(el)
    resize()

    // only animate while the hero is on screen
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry.isIntersecting) frame = requestAnimationFrame(draw)
    })
    visibility.observe(el)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      visibility.disconnect()
    }
  }, [])

  return <canvas ref={canvas} className="waveform" aria-hidden="true" />
}
