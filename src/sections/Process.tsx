import type { CSSProperties } from 'react'
import { process } from '../lib/content'
import './Process.css'

export function Process() {
  return (
    <section className="section process" id="process">
      <div className="container">
        <div className="section-head" data-reveal>
          <p className="eyebrow">Process</p>
          <h2>Measured before, measured after.</h2>
          <p>
            Good acoustics isn&apos;t guesswork. Every project follows the same four steps, and you see the numbers at
            each one.
          </p>
        </div>

        <ol className="process-steps">
          {process.map((item, i) => (
            <li key={item.step} data-reveal style={{ '--reveal-order': i } as CSSProperties}>
              <span className="process-num">{i + 1}</span>
              <h3>{item.step}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
