import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, reducedMotion } from '../lib/motion'
import './Cursor.css'

/**
 * A ring that trails the mouse, swells over anything clickable and offers a clap over the hero
 * wall. Mouse only; the native cursor stays visible underneath.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const el = ring.current
    if (!el || reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

    const last = { x: 0, y: 0 }
    const describe = (target: Element | null) => {
      const link = target?.closest('a, button, label, input, textarea, select')
      el.classList.toggle('is-link', Boolean(link))
      el.classList.toggle('is-clap', !link && Boolean(target?.closest('.hero[data-over-wall]')))
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      Object.assign(last, { x: e.clientX, y: e.clientY })
      x(e.clientX)
      y(e.clientY)
      el.classList.add('is-visible')
      describe(e.target as Element)
    }
    // the page can scroll under a resting mouse, so look again at what is beneath it
    const scroll = () => describe(document.elementFromPoint(last.x, last.y))
    const down = () => gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
    const leave = () => el.classList.remove('is-visible')

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    window.addEventListener('scroll', scroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('scroll', scroll)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  })

  return (
    <div ref={ring} className="cursor" aria-hidden="true">
      <span>Clap</span>
    </div>
  )
}
