import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { STATIONS, CITIES, simulateTick, stationState, distanceKm } from '../data/stations'
import { naira } from '../data/config'

const CONNECTOR_FILTERS = ['Any', 'CCS2', 'Type 2', 'CHAdeMO']
const STATE_COLOR = { free: '#2f8f5b', limited: '#d08a1e', busy: '#c0463a' }
const CITY_VIEW = {
  All: { center: [7.6, 5.2], zoom: 6 },
  Lagos: { center: [6.5, 3.45], zoom: 11 },
  Abuja: { center: [9.08, 7.45], zoom: 11 },
  'Port Harcourt': { center: [4.82, 7.05], zoom: 12 },
  Ibadan: { center: [7.38, 3.95], zoom: 12 },
}

function markerIcon(s, selected) {
  const c = STATE_COLOR[stationState(s)]
  return L.divIcon({
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `<div class="cm-pin${selected ? ' sel' : ''}" style="background:${c}">${s.free}</div>`,
  })
}

export default function ChargingMap() {
  const [stations, setStations] = useState(STATIONS)
  const [city, setCity]         = useState('All')
  const [connector, setConn]    = useState('Any')
  const [onlyFree, setOnlyFree] = useState(false)
  const [fastOnly, setFastOnly] = useState(false)
  const [selectedId, setSel]    = useState(null)
  const [me, setMe]             = useState(null)
  const [geoErr, setGeoErr]     = useState('')
  const [updated, setUpdated]   = useState(new Date())

  const mapEl     = useRef(null)
  const map       = useRef(null)
  const markers   = useRef(new Map())
  const meMarker  = useRef(null)

  // Simulated live feed
  useEffect(() => {
    const t = setInterval(() => { setStations(s => simulateTick(s)); setUpdated(new Date()) }, 6000)
    return () => clearInterval(t)
  }, [])

  const visible = useMemo(() => {
    let list = stations.filter(s =>
      (city === 'All' || s.city === city) &&
      (connector === 'Any' || s.connectors.includes(connector)) &&
      (!onlyFree || s.free > 0) &&
      (!fastOnly || s.kw >= 100))
    if (me) {
      list = list.map(s => ({ ...s, dist: distanceKm(me.lat, me.lng, s.lat, s.lng) }))
        .sort((a, b) => a.dist - b.dist)
    }
    return list
  }, [stations, city, connector, onlyFree, fastOnly, me])

  // Init map once
  useEffect(() => {
    map.current = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: true })
      .setView(CITY_VIEW.All.center, CITY_VIEW.All.zoom)
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19,
    }).addTo(map.current)
    return () => { map.current.remove(); map.current = null; markers.current.clear() }
  }, [])

  // Sync markers with visible stations
  useEffect(() => {
    const m = map.current
    if (!m) return
    const ids = new Set(visible.map(s => s.id))
    markers.current.forEach((mk, id) => { if (!ids.has(id)) { mk.remove(); markers.current.delete(id) } })
    visible.forEach(s => {
      const icon = markerIcon(s, s.id === selectedId)
      let mk = markers.current.get(s.id)
      if (!mk) {
        mk = L.marker([s.lat, s.lng], { icon }).addTo(m).on('click', () => setSel(s.id))
        markers.current.set(s.id, mk)
      } else mk.setIcon(icon)
    })
  }, [visible, selectedId])

  // Fly to city
  useEffect(() => {
    const v = CITY_VIEW[city]
    map.current?.flyTo(v.center, v.zoom, { duration: 0.8 })
  }, [city])

  function select(s) {
    setSel(s.id)
    map.current?.flyTo([s.lat, s.lng], 14, { duration: 0.8 })
  }

  function locate() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Location is not supported in this browser.')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMe(p)
        meMarker.current?.remove()
        meMarker.current = L.circleMarker([p.lat, p.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#4a5b73', fillOpacity: 1 }).addTo(map.current)
        map.current.flyTo([p.lat, p.lng], 12, { duration: 0.8 })
      },
      () => setGeoErr('Could not get your location — allow access or pick a city.'),
      { timeout: 8000 },
    )
  }

  const totals = useMemo(() => ({
    free: visible.reduce((a, s) => a + s.free, 0),
    ports: visible.reduce((a, s) => a + s.ports, 0),
  }), [visible])

  const selected = visible.find(s => s.id === selectedId)

  return (
    <main className="pg">
      <div className="pg-head">
        <div className="pg-eyebrow">Charging network</div>
        <h1 className="pg-title">Live charging map</h1>
        <p className="pg-sub">Find an available charger across Nigeria's main EV corridors. Availability refreshes every few seconds.</p>
        <div className="pg-live"><span className="pg-dot" /> Live · updated {updated.toLocaleTimeString()} · {totals.free}/{totals.ports} ports free</div>
        <div className="pg-note">Demo data — stations and availability are simulated.</div>
      </div>

      <div className="cm-filters">
        <div className="cm-group">
          {CITIES.map(c => (
            <button key={c} className={`cm-chip${city === c ? ' on' : ''}`} onClick={() => setCity(c)}>{c}</button>
          ))}
        </div>
        <div className="cm-group">
          {CONNECTOR_FILTERS.map(c => (
            <button key={c} className={`cm-chip${connector === c ? ' on' : ''}`} onClick={() => setConn(c)}>{c}</button>
          ))}
          <button className={`cm-chip${onlyFree ? ' on' : ''}`} onClick={() => setOnlyFree(v => !v)}>Available now</button>
          <button className={`cm-chip${fastOnly ? ' on' : ''}`} onClick={() => setFastOnly(v => !v)}>Fast (100 kW+)</button>
          <button className="cm-chip cm-locate" onClick={locate}>◎ Near me</button>
        </div>
        {geoErr && <div className="cm-err">{geoErr}</div>}
      </div>

      <div className="cm-layout">
        <div className="cm-list">
          {visible.length === 0 && <div className="cm-empty">No stations match these filters.</div>}
          {visible.map(s => {
            const st = stationState(s)
            return (
              <button key={s.id} className={`cm-card${s.id === selectedId ? ' sel' : ''}`} onClick={() => select(s)}>
                <div className="cm-card-top">
                  <div className="cm-name">{s.name}</div>
                  <span className="cm-badge" style={{ background: STATE_COLOR[st] }}>
                    {st === 'busy' ? 'Busy' : `${s.free}/${s.ports} free`}
                  </span>
                </div>
                <div className="cm-meta">{s.area}{s.dist != null && ` · ${s.dist.toFixed(1)} km away`}</div>
                <div className="cm-meta">{s.kw} kW · {naira(s.price)}/kWh · {s.hours}</div>
                {s.id === selectedId && (
                  <div className="cm-detail">
                    <div>Connectors: {s.connectors.join(', ')}</div>
                    {s.amenities.length > 0 && <div>Amenities: {s.amenities.join(', ')}</div>}
                    <div>Est. 20→80% on a 62 kWh pack: ~{Math.round(62 * 0.6 / Math.min(s.kw, 120) * 60 * 1.15)} min</div>
                    <a
                      className="cm-dir"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                      target="_blank" rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                    >Get directions →</a>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="cm-map-wrap">
          <div ref={mapEl} className="cm-map" />
          <div className="cm-legend">
            <span><i style={{ background: STATE_COLOR.free }} /> Available</span>
            <span><i style={{ background: STATE_COLOR.limited }} /> Limited</span>
            <span><i style={{ background: STATE_COLOR.busy }} /> Busy</span>
          </div>
          {selected && <div className="cm-selected-bar">{selected.name}</div>}
        </div>
      </div>
    </main>
  )
}
