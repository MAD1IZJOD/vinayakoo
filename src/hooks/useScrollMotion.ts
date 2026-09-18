import { useGSAP } from '@gsap/react'
import { gsap, reducedMotion, ScrollTrigger, SplitText, startSmoothScroll } from '../lib/motion'

/**
 * Page-wide scroll motion: smooth scrolling, `[data-split]` headings whose lines rise out of a
 * mask and tip forward, and `[data-reveal]` blocks that fade up as they arrive. Everything is set
 * up from script, so content stays visible if JavaScript or motion is off.
 */
export function useScrollMotion() {
  useGSAP(() => {
    const stopScroll = startSmoothScroll()
    if (reducedMotion()) return stopScroll

    for (const el of gsap.utils.toArray<HTMLElement>('[data-split]')) {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            rotateX: -50,
            transformOrigin: '50% 100%',
            duration: 1.2,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }),
      })
    }

    gsap.set('[data-reveal]', { autoAlpha: 0, y: 48 })
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    })

    return stopScroll
  })
}
