import { useGSAP } from '@gsap/react'
import { useEffect, useRef, useState } from 'react'
import { gsap, smoothScroll } from '../lib/motion'
import { nav, site } from '../lib/site'
import './Header.css'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)

  // a hairline along the bottom of the header that fills as you read down the page
  useGSAP(
    () => {
      gsap.fromTo(
        '.header-progress',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
      )
    },
    { scope: header },
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    // the smooth scroller keeps moving the page under an open menu unless it is paused too
    if (open) smoothScroll()?.stop()
    else smoothScroll()?.start()
  }, [open])

  const close = () => setOpen(false)

  return (
    <header ref={header} className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="wordmark" onClick={close}>
          {site.name}
          <span>{site.tagline}</span>
        </a>
        <nav className="header-nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <a href="#consult" className="btn btn-primary header-cta" onClick={close}>
            Book a consultation
          </a>
        </nav>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
      <span className="header-progress" aria-hidden="true" />
    </header>
  )
}
