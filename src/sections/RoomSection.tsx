import { lazy, Suspense } from 'react'
import './RoomSection.css'

const RoomCanvas = lazy(() => import('../experience/RoomCanvas'))

export function RoomSection() {
  return (
    <section className="section room-section" id="room">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">The room</p>
          <h2>Step inside a room before we build it.</h2>
          <p>
            Every project starts as a model like this one. Drag to look around a typical media room: hard walls,
            a glass-smooth floor and a screen that deserves better sound.
          </p>
        </div>
      </div>
      <div className="room-stage">
        <Suspense fallback={<div className="room-loading">Loading the room…</div>}>
          <RoomCanvas />
        </Suspense>
        <p className="room-hint" aria-hidden="true">
          Drag to look around
        </p>
      </div>
    </section>
  )
}
