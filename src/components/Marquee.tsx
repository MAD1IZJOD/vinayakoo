import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, reducedMotion, ScrollTrigger } from '../lib/motion'
import './Marquee.css'

/** A band of oversized type that drifts sideways, surges with scroll speed and follows scroll direction. */
export function Marquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reducedMotion()) return
      const loop = gsap.to('.marquee-track', { xPercent: -50, duration: 36, ease: 'none', repeat: -1 })
      // start deep into the repeats so the loop can also run backwards when scrolling up
      loop.totalTime(loop.duration() * 100)
      const skew = gsap.quickTo('.marquee-track', 'skewX', { duration: 0.5, ease: 'power3' })

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const velocity = self.getVelocity()
          const boost = 1 + Math.min(Math.abs(velocity) / 250, 6)
          skew(gsap.utils.clamp(-8, 8, velocity / -300))
          gsap.to(loop, {
            timeScale: self.direction * boost,
            duration: 0.2,
            overwrite: true,
            onComplete: () => {
              gsap.to(loop, { timeScale: self.direction, duration: 1.2, ease: 'power2.out' })
              skew(0)
            },
          })
        },
      })
    },
    { scope: root },
  )

  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <span key={`${item}${hidden}`} className={i % 2 ? 'marquee-outline' : undefined} aria-hidden={hidden || undefined}>
        {item}
        <i aria-hidden="true" />
      </span>
    ))

  return (
    <div ref={root} className="marquee">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
