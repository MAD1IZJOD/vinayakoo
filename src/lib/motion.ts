import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null

/** The page's smooth scroller, if one is running (not with reduced motion). */
export const smoothScroll = () => lenis

/**
 * Smooth wheel scrolling driven by GSAP's ticker, so ScrollTrigger animations and the scroll
 * position always agree. Touch devices keep native scrolling.
 */
export function startSmoothScroll() {
  if (lenis || reducedMotion()) return () => {}
  const instance = new Lenis({ autoRaf: false, anchors: { offset: -72 } })
  lenis = instance
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    lenis = null
  }
}

export { gsap, ScrollTrigger, SplitText }
