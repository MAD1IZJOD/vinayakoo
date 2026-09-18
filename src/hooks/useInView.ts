import { useEffect, useRef, useState } from 'react'

/** Tracks whether an element is on screen. With `once`, it stays true after the first time. */
export function useInView<T extends Element>(rootMargin = '0px', once = false) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (once && entry.isIntersecting) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, once])

  return [ref, inView] as const
}
