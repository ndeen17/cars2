import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Catalog from './components/Catalog'
import Spotlight from './components/Spotlight'
import Enquiry from './components/Enquiry'
import Footer from './components/Footer'

export default function App() {
  const [selectedModel, setSelectedModel] = useState('Lumen GT')

  function enquireAbout(name) {
    setSelectedModel(name)
    const el = document.getElementById('enquiry')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 30
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      <Nav />
      <Hero />
      <Catalog onEnquire={enquireAbout} />
      <Spotlight onEnquire={enquireAbout} />
      <Enquiry selectedModel={selectedModel} onModelChange={setSelectedModel} />
      <Footer />
    </>
  )
}
