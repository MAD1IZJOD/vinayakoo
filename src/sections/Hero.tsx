import { useGSAP } from '@gsap/react'
import { lazy, Suspense, useRef, useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Waveform } from '../components/Waveform'
import { useInView } from '../hooks/useInView'
import { gsap, reducedMotion, SplitText } from '../lib/motion'
import { hasWebGL } from '../lib/webgl'
import './Hero.css'

const DiffuserCanvas = lazy(() => import('../experience/DiffuserCanvas'))

export function Hero() {
  const hero = useRef<HTMLElement>(null)
  const [stageRef, inView] = useInView<HTMLDivElement>('0px')
  const [webgl] = useState(hasWebGL)
  const [still] = useState(reducedMotion)

  useGSAP(
    () => {
      if (still) return
      const title = SplitText.create('.hero h1', { type: 'words', mask: 'words' })
      // room in each mask for the italic overhang and descenders, which would otherwise be clipped
      gsap.set(title.masks, { padding: '0 0.12em 0.14em 0', margin: '0 -0.12em -0.14em 0' })
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15, onComplete: () => title.revert() })
      intro
        .from('.hero .eyebrow', { autoAlpha: 0, y: 20, duration: 1 })
        .from(title.words, { yPercent: 120, rotateX: -70, duration: 1.4, stagger: 0.06 }, '<0.1')
        .from(['.hero-lede', '.hero-actions', '.hero-caption', '.hero-cue'], { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.08 }, '-=1')

      // the copy drifts up and away as the page scrolls, while the wall tilts back behind it
      gsap.to('.hero-inner', {
        yPercent: -30,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: hero },
  )

  return (
    <section ref={hero} className="hero" id="top">
      <div ref={stageRef} className="hero-stage" aria-hidden="true">
        {webgl ? (
          <ErrorBoundary fallback={<Waveform />}>
            <Suspense fallback={null}>
              <DiffuserCanvas target={hero} active={inView} still={still} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <Waveform />
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div className="container hero-inner">
        <p className="eyebrow">Acoustic interiors · Design &amp; build</p>
        <h1>
          Rooms that <em>sound</em>
          <br />
          as good as they look.
        </h1>
        <p className="hero-lede">
          We design and build home theatres, studios and workspaces where every surface is tuned, so voices stay
          clear, music stays whole and quiet actually feels quiet.
        </p>
        <div className="hero-actions">
          <a href="#consult" className="btn btn-primary">
            Book a consultation
          </a>
          <a href="#room" className="btn">
            Hear the difference
          </a>
        </div>
      </div>

      {webgl && !still && (
        <p className="hero-caption" aria-hidden="true">
          <span className="hero-caption-fine">Move across the wall to send sound through it · click to clap</span>
          <span className="hero-caption-touch">Tap the wall to clap</span>
        </p>
      )}
      <a href="#room" className="hero-cue" aria-label="Scroll to the room">
        <span />
      </a>
    </section>
  )
}
