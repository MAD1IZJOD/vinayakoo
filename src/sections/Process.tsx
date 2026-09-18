import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { process } from '../lib/content'
import { gsap } from '../lib/motion'
import './Process.css'

export function Process() {
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // wide screens: the steps become a track that slides sideways while the section is pinned
      mm.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
        const root = section.current!
        const track = root.querySelector<HTMLElement>('.process-track')!
        root.classList.add('is-horizontal')
        const distance = () => track.scrollWidth - window.innerWidth

        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.process-pin',
            pin: true,
            start: 'top top',
            end: () => `+=${distance()}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        gsap.fromTo('.process-progress i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.process-pin', start: 'top top', end: () => `+=${distance()}`, scrub: 0.8 } })

        // each card swings round to face the viewer as it slides into the middle
        for (const card of gsap.utils.toArray<HTMLElement>('.process-step')) {
          gsap.fromTo(
            card,
            { rotateY: -38, z: -160, autoAlpha: 0.35 },
            {
              rotateY: 0,
              z: 0,
              autoAlpha: 1,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, containerAnimation: slide, start: 'left 100%', end: 'center 60%', scrub: true },
            },
          )
        }

        return () => root.classList.remove('is-horizontal')
      })

      // narrow screens: a line draws down the timeline as you read
      mm.add('(max-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.process-steps',
          { '--line': 0 },
          { '--line': 1, ease: 'none', scrollTrigger: { trigger: '.process-steps', start: 'top 70%', end: 'bottom 70%', scrub: true } },
        )
      })
    },
    { scope: section },
  )

  return (
    <section ref={section} className="section process" id="process">
      <div className="process-pin">
        <div className="process-track">
          <div className="section-head process-head">
            <p className="eyebrow" data-reveal>Process</p>
            <h2 data-split>Measured before, measured after.</h2>
            <p data-reveal>
              Good acoustics isn&apos;t guesswork. Every project follows the same four steps, and you see the numbers at
              each one.
            </p>
          </div>

          <ol className="process-steps">
            {process.map((item, i) => (
              <li key={item.step} className="process-step">
                <span className="process-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>
                  <span className="visually-hidden">Step {i + 1}: </span>
                  {item.step}
                </h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="process-progress" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  )
}
