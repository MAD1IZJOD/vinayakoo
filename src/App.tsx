import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { useScrollMotion } from './hooks/useScrollMotion'
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
        <Services />
        <Process />
        <Consultation />
      </main>
      <Footer />
    </>
  )
}
