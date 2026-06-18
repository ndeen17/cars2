import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Catalog from './components/Catalog'
import Spotlight from './components/Spotlight'
import Enquiry from './components/Enquiry'
import Footer from './components/Footer'
import CarDetail from './components/CarDetail'
import AskAI from './components/AskAI'

export default function App() {
  const [selectedModel, setSelectedModel] = useState('Lumen GT')
  const [detailCar,     setDetailCar]     = useState(null)

  function openDetail(car) {
    setDetailCar(car)
  }

  function closeDetail() {
    setDetailCar(null)
  }

  // Called when user clicks Enquire inside CarDetail.
  // The second arg (nextCar) is used when clicking a similar-car card — opens that car's detail.
  function enquireAbout(name, nextCar) {
    if (nextCar) {
      setDetailCar(nextCar)
      return
    }
    setDetailCar(null)
    if (name) setSelectedModel(name)
    setTimeout(() => {
      const el = document.getElementById('enquiry')
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 30
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, 320)
  }

  return (
    <>
      <Nav />
      <Hero />
      <Catalog onEnquire={enquireAbout} onCarSelect={openDetail} />
      <Spotlight onEnquire={enquireAbout} />
      <Enquiry selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <Footer />

      {detailCar && (
        <>
          <CarDetail
            car={detailCar}
            onClose={closeDetail}
            onEnquire={enquireAbout}
          />
          <AskAI car={detailCar} />
        </>
      )}
    </>
  )
}
