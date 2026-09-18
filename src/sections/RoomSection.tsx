import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { DecayChart } from '../components/DecayChart'
import { useInView } from '../hooks/useInView'
import { useTween } from '../hooks/useTween'
import { rtAt, treatments } from '../lib/acoustics'
import { RoomAudio } from '../lib/roomAudio'
import './RoomSection.css'

const RoomCanvas = lazy(() => import('../experience/RoomCanvas'))

export function RoomSection() {
  const [treated, setTreated] = useState(false)
  const [listening, setListening] = useState(false)
  const [stageRef, stageInView] = useInView<HTMLDivElement>('200px')
  const [sectionRef, sectionInView] = useInView<HTMLElement>('0px')
  const audio = useRef<RoomAudio | null>(null)
  const progress = useTween(treated ? 1 : 0)
  const rt = rtAt(progress)

  useEffect(() => {
    audio.current?.setTreatment(progress)
  }, [progress])

  // stop the demo once the visitor scrolls away from it
  useEffect(() => {
    if (!sectionInView && audio.current?.playing) {
      audio.current.stop()
      setListening(false)
    }
  }, [sectionInView])

  useEffect(() => () => audio.current?.dispose(), [])

  const toggleListening = async () => {
    audio.current ??= new RoomAudio()
    if (audio.current.playing) {
      audio.current.stop()
      setListening(false)
    } else {
      audio.current.setTreatment(progress)
      await audio.current.start()
      setListening(true)
    }
  }

  return (
    <section ref={sectionRef} className="section room-section" id="room">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">The room</p>
          <h2>Step inside a room before we build it.</h2>
          <p>
            Every project starts as a model like this one. Here is a typical media room with hard walls, a smooth
            floor and a screen that deserves better sound. Drag to look around, then treat it and listen to what
            changes.
          </p>
        </div>
      </div>

      <div ref={stageRef} className="room-stage">
        <Suspense fallback={<div className="room-loading">Loading the room…</div>}>
          <RoomCanvas treated={treated} active={stageInView} />
        </Suspense>

        <p className="room-hint" aria-hidden="true">
          Drag to look around
        </p>

        <div className="room-controls">
          <div className="room-toggle" role="group" aria-label="Room treatment">
            <button aria-pressed={!treated} onClick={() => setTreated(false)}>
              Untreated
            </button>
            <button aria-pressed={treated} onClick={() => setTreated(true)}>
              Treated
            </button>
            <span className="room-toggle-thumb" style={{ transform: `translateX(${progress * 100}%)` }} />
          </div>

          <div className="room-readout" aria-live="polite">
            <span className="room-readout-label">Reverb time</span>
            <span className="room-readout-value">
              {rt.toFixed(2)}
              <small> s</small>
            </span>
          </div>

          <button className={`room-listen${listening ? ' is-on' : ''}`} onClick={toggleListening}>
            <span className="room-listen-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {listening ? 'Stop' : 'Listen'}
          </button>
        </div>
      </div>

      <div className="container room-detail">
        <div className="room-treatments">
          <h3>What changed</h3>
          <ol>
            {treatments.map((t) => (
              <li key={t.name}>
                <strong>{t.name}</strong>
                <span className="room-where">{t.where}</span>
                <p>{t.what}</p>
              </li>
            ))}
          </ol>
        </div>
        <DecayChart treated={treated} />
      </div>
    </section>
  )
}
