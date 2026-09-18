import { services } from '../lib/content'
import './Services.css'

export function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Services</p>
          <h2>Any room where sound matters.</h2>
          <p>
            We handle the acoustics end to end, from the first measurement to the last panel, and work alongside your
            architect or interior designer when there is one.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, i) => (
            <article key={service.title} className="service-card">
              <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              <ul>
                {service.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
