import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { Process } from './sections/Process'
import { RoomSection } from './sections/RoomSection'
import { Services } from './sections/Services'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RoomSection />
        <Services />
        <Process />
      </main>
      <Footer />
    </>
  )
}
