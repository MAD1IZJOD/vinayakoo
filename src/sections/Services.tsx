import type { CSSProperties, PointerEvent } from 'react'
import { services } from '../lib/content'
import './Services.css'

// well depths from the same quadratic residue sequence as the hero wall, a different slice per card
const blockDepth = (card: number, i: number) => ((card + (i % 3)) ** 2 + (card + Math.floor(i / 3)) ** 2) % 7

/** Tilts the card towards the pointer and moves its glare; mouse only, so touch scrolling is untouched. */
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  el.style.setProperty('--rx', `${(0.5 - y) * 9}deg`)
  el.style.setProperty('--ry', `${(x - 0.5) * 11}deg`)
  el.style.setProperty('--gx', `${x * 100}%`)
  el.style.setProperty('--gy', `${y * 100}%`)
}

function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

export function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow" data-reveal>Services</p>
          <h2 data-split>Any room where sound matters.</h2>
          <p data-reveal>
            We handle the acoustics end to end, from the first measurement to the last panel, and work alongside your
            architect or interior designer when there is one.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, i) => (
            <article key={service.title} className="service-card" data-reveal onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="service-inner">
                <div className="service-top">
                  <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="service-blocks" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, b) => (
                      <i key={b} style={{ '--d': blockDepth(i + 1, b) } as CSSProperties} />
                    ))}
                  </span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
                <ul>
                  {service.scope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
