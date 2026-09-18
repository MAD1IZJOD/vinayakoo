import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Marquee } from './components/Marquee'
import { useScrollMotion } from './hooks/useScrollMotion'
import { services } from './lib/content'
import { Consultation } from './sections/Consultation'
import { Hero } from './sections/Hero'
import { Process } from './sections/Process'
import { RoomSection } from './sections/RoomSection'
import { Services } from './sections/Services'

export default function App() {
  useScrollMotion()

  return (
    <>
      <Header />
      <main>
        <Hero />
        <RoomSection />
        <Marquee items={services.map((s) => s.title)} />
        <Services />
        <Process />
        <Consultation />
      </main>
      <Footer />
      <Cursor />
    </>
  )
}
