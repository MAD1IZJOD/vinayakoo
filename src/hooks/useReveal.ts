import { useEffect } from 'react'

/**
 * Fades `[data-reveal]` elements up as they scroll into view. Content is only hidden once this
 * has run (via the `reveal-ready` class), so nothing stays invisible if scripts fail.
 */
export function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    // anything already on screen shows immediately rather than animating in on load
    for (const el of targets) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-revealed')
      else observer.observe(el)
    }
    root.classList.add('reveal-ready')

    return () => {
      observer.disconnect()
      root.classList.remove('reveal-ready')
    }
  }, [])
}
