import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { gsap, reducedMotion, SplitText } from '../lib/motion'
import { site } from '../lib/site'
import './Footer.css'

export function Footer() {
  const footer = useRef<HTMLElement>(null)

  // the oversized wordmark rises letter by letter, tipping up out of the floor
  useGSAP(
    () => {
      if (reducedMotion()) return
      const mark = SplitText.create('.footer-giant', { type: 'chars', mask: 'chars' })
      gsap.from(mark.chars, {
        yPercent: 110,
        rotateX: -90,
        transformOrigin: '50% 100%',
        duration: 1.4,
        ease: 'expo.out',
        stagger: 0.05,
        scrollTrigger: { trigger: '.footer-giant', start: 'top 95%', once: true },
      })
    },
    { scope: footer },
  )

  return (
    <footer ref={footer} className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-note">Rooms that sound as good as they look.</p>
          <a href="#consult" className="footer-cta">
            Start with a conversation <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="footer-links">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
        </div>
      </div>
      <p className="footer-giant" aria-hidden="true">
        {site.name}
      </p>
      <p className="container footer-copy">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </footer>
  )
}
