import { Waveform } from '../components/Waveform'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="top">
      <Waveform />
      <div className="container hero-inner">
        <p className="eyebrow hero-rise">Acoustic interiors · Design &amp; build</p>
        <h1 className="hero-rise">
          Rooms that <em>sound</em>
          <br />
          as good as they look.
        </h1>
        <p className="hero-lede hero-rise">
          We design and build home theatres, studios and workspaces where every surface is tuned, so voices
          stay clear, music stays whole and quiet actually feels quiet.
        </p>
        <div className="hero-actions hero-rise">
          <a href="#consult" className="btn btn-primary">
            Book a consultation
          </a>
          <a href="#room" className="btn">
            Hear the difference
          </a>
        </div>
      </div>
      <p className="hero-caption" aria-hidden="true">
        A clap in a bare room, then in a treated one
      </p>
    </section>
  )
}
