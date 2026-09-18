import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { RoomSection } from './sections/RoomSection'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RoomSection />
      </main>
      <Footer />
    </>
  )
}
