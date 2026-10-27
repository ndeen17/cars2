import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Catalog from './components/Catalog'
import Spotlight from './components/Spotlight'
import Enquiry from './components/Enquiry'
import Footer from './components/Footer'
import CarDetail from './components/CarDetail'
import Concierge from './components/Concierge'
import ZipLoader from './components/ZipLoader'
import ChargingMap from './pages/ChargingMap'
import NairaSaver from './pages/NairaSaver'
import AdminERP from './pages/AdminERP'

// Hash routes: '#/charging', '#/saver', '#/admin'. Anything else is the home page
// (including plain anchors like '#catalog').
const PAGES = { '/charging': ChargingMap, '/saver': NairaSaver }

function useRoute() {
  const read = () => (window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : '/')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const [loaderDone,    setLoaderDone]    = useState(false)
  const [selectedModel, setSelectedModel] = useState('Lumen GT')
  const [detailCar,     setDetailCar]     = useState(null)
  const route = useRoute()
  const Page = PAGES[route]

  // Entering a sub-page starts at the top; returning home via an anchor link
  // ('#catalog' etc.) scrolls to that section once Home has mounted.
  useEffect(() => {
    setDetailCar(null)
    if (Page) { window.scrollTo(0, 0); return }
    const id = window.location.hash.slice(1)
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 0)
  }, [route]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // The staff console is its own app: no public nav, footer, intro loader or customer chat.
  if (route === '/admin') return <AdminERP />

  return (
    <>
      {!loaderDone && <ZipLoader onComplete={() => setLoaderDone(true)} />}
      <Nav />

      {Page ? (
        <Page />
      ) : (
        <>
          <Hero />
          <Catalog onEnquire={enquireAbout} onCarSelect={openDetail} />
          <Spotlight onEnquire={enquireAbout} />
          <Enquiry selectedModel={selectedModel} onModelChange={setSelectedModel} />
        </>
      )}
      <Footer />

      {!Page && detailCar && (
        <CarDetail car={detailCar} onClose={closeDetail} onEnquire={enquireAbout} />
      )}

      <Concierge car={Page ? null : detailCar} />
    </>
  )
}
