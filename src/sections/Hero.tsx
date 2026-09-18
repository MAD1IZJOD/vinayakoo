import './Hero.css'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <p className="eyebrow">Acoustic interiors · Design &amp; build</p>
        <h1>
          Rooms that <em>sound</em> as good as they look.
        </h1>
        <p className="hero-lede">
          We design and build home theatres, studios and workspaces where every surface is tuned, so voices
          stay clear, music stays whole and quiet actually feels quiet.
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
    </section>
  )
}
