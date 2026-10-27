import { useEffect, useMemo, useRef, useState } from 'react'
import { GARAGE, RECENT_TRIPS, weekFor } from '../data/telematics'
import { PETROL_NGN_PER_L, HOME_NGN_PER_KWH, ICE_L_PER_100KM, naira } from '../data/config'

const PUBLIC_NGN_PER_KWH = 280
const CO2_KG_PER_L = 2.31

function useCountUp(target) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = from.current, t0 = performance.now(), dur = 700
    let raf
    const step = now => {
      const p = Math.min(1, (now - t0) / dur)
      setV(start + (target - start) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = target
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return v
}

export default function NairaSaver() {
  const [carId, setCarId]       = useState(GARAGE[0].id)
  const [petrol, setPetrol]     = useState(PETROL_NGN_PER_L)
  const [home, setHome]         = useState(HOME_NGN_PER_KWH)
  const [iceL, setIceL]         = useState(ICE_L_PER_100KM)
  const [liveKm, setLiveKm]     = useState(0)       // extra km driven today since page load
  const [syncedAt, setSyncedAt] = useState(new Date())
  const [syncing, setSyncing]   = useState(false)

  const car = GARAGE.find(c => c.id === carId)
  const todayIdx = (new Date().getDay() + 6) % 7   // Mon = 0

  // Simulated telematics stream: odometer creeps up while "driving"
  useEffect(() => {
    setLiveKm(0)
    const t = setInterval(() => { setLiveKm(k => k + 0.2 + Math.random() * 0.5); setSyncedAt(new Date()) }, 3000)
    return () => clearInterval(t)
  }, [carId])

  function syncNow() {
    setSyncing(true)
    setTimeout(() => { setSyncing(false); setSyncedAt(new Date()) }, 900)
  }

  const week = useMemo(() => weekFor(carId).map((d, i) => {
    const km = i > todayIdx ? 0 : d.km + (i === todayIdx ? liveKm : 0)
    const kwh = km / 100 * car.kwhPer100
    const evCost = kwh * ((1 - d.publicShare) * home + d.publicShare * PUBLIC_NGN_PER_KWH)
    const litres = km / 100 * iceL
    const petrolCost = litres * petrol
    return { ...d, km, kwh, evCost, litres, petrolCost, saved: petrolCost - evCost }
  }), [carId, todayIdx, liveKm, car, home, petrol, iceL])

  const tot = week.reduce((a, d) => ({
    km: a.km + d.km, kwh: a.kwh + d.kwh, ev: a.ev + d.evCost,
    petrol: a.petrol + d.petrolCost, litres: a.litres + d.litres, saved: a.saved + d.saved,
  }), { km: 0, kwh: 0, ev: 0, petrol: 0, litres: 0, saved: 0 })

  const savedAnim = useCountUp(tot.saved)
  const maxCost = Math.max(...week.map(d => d.petrolCost), 1)
  const odometer = car.odometer + tot.km
  const rangeKm = Math.round(car.battery * (car.soc / 100) / car.kwhPer100 * 100)

  return (
    <main className="pg">
      <div className="pg-head">
        <div className="pg-eyebrow">Owner dashboard</div>
        <h1 className="pg-title">Naira Saver</h1>
        <p className="pg-sub">What your EV saved you this week versus a comparable petrol car, calculated from your car's own telematics.</p>
        <div className="pg-note">Demo — telematics are simulated and fuel prices are editable reference values, not a live pump-price feed.</div>
      </div>

      <div className="ns-top">
        <div className="ns-tabs">
          {GARAGE.map(g => (
            <button key={g.id} className={`cm-chip${carId === g.id ? ' on' : ''}`} onClick={() => setCarId(g.id)}>{g.name} · {g.plate}</button>
          ))}
        </div>
        <div className="ns-sync">
          <span className="pg-dot" /> Telematics connected · synced {syncedAt.toLocaleTimeString()}
          <button className="ns-sync-btn" onClick={syncNow} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync now'}</button>
        </div>
      </div>

      <div className="ns-grid">
        <section className="ns-hero">
          <div className="ns-hero-label">Saved this week</div>
          <div className="ns-hero-num">{naira(savedAnim)}</div>
          <div className="ns-hero-sub">
            {naira(tot.petrol)} on petrol vs <strong>{naira(tot.ev)}</strong> on electricity
          </div>
          <div className="ns-proj">
            <div><span>Monthly pace</span><strong>{naira(tot.saved * 52 / 12)}</strong></div>
            <div><span>Yearly pace</span><strong>{naira(tot.saved * 52)}</strong></div>
          </div>
        </section>

        <section className="ns-stats">
          <Stat label="Distance" value={`${tot.km.toFixed(0)} km`} />
          <Stat label="Petrol not burnt" value={`${tot.litres.toFixed(0)} L`} />
          <Stat label="Energy used" value={`${tot.kwh.toFixed(0)} kWh`} />
          <Stat label="CO₂ avoided" value={`${(tot.litres * CO2_KG_PER_L).toFixed(0)} kg`} />
        </section>

        <section className="ns-card">
          <h3 className="ns-h">Daily cost: petrol vs electric</h3>
          <div className="ns-chart">
            {week.map((d, i) => (
              <div key={d.day} className={`ns-col${i > todayIdx ? ' future' : ''}`}>
                <div className="ns-bars">
                  <div className="ns-bar ns-bar--petrol" style={{ height: `${d.petrolCost / maxCost * 100}%` }} title={`Petrol ${naira(d.petrolCost)}`} />
                  <div className="ns-bar ns-bar--ev" style={{ height: `${d.evCost / maxCost * 100}%` }} title={`Electric ${naira(d.evCost)}`} />
                </div>
                <div className="ns-day">{d.day}{i === todayIdx && <i className="ns-live-tag">live</i>}</div>
                <div className="ns-saved">{i > todayIdx ? '—' : naira(d.saved)}</div>
              </div>
            ))}
          </div>
          <div className="ns-key"><span><i className="k-petrol" /> Petrol equivalent</span><span><i className="k-ev" /> Your EV</span></div>
        </section>

        <section className="ns-card">
          <h3 className="ns-h">Live from your {car.name}</h3>
          <div className="ns-soc">
            <div className="ns-soc-bar"><div style={{ width: `${car.soc}%` }} /></div>
            <div className="ns-soc-meta"><strong>{car.soc}%</strong> charge · ~{rangeKm} km range</div>
          </div>
          <div className="ns-rows">
            <div><span>Odometer</span><strong>{odometer.toFixed(1)} km</strong></div>
            <div><span>Efficiency</span><strong>{car.kwhPer100} kWh/100 km</strong></div>
            <div><span>Today</span><strong>{week[todayIdx].km.toFixed(1)} km</strong></div>
          </div>
          <h4 className="ns-h2">Recent trips</h4>
          {RECENT_TRIPS.map((t, i) => (
            <div key={i} className="ns-trip">
              <div>{t.from} → {t.to}<small>{t.time} · {t.traffic} traffic</small></div>
              <strong>{t.km} km</strong>
            </div>
          ))}
        </section>

        <section className="ns-card ns-assume">
          <h3 className="ns-h">Assumptions <small>(edit to match today's prices)</small></h3>
          <label>Petrol price (₦/litre)
            <input type="number" min="0" value={petrol} onChange={e => setPetrol(+e.target.value || 0)} />
          </label>
          <label>Home electricity (₦/kWh)
            <input type="number" min="0" value={home} onChange={e => setHome(+e.target.value || 0)} />
          </label>
          <label>Petrol-car consumption (L/100 km)
            <input type="number" min="1" step="0.5" value={iceL} onChange={e => setIceL(+e.target.value || 1)} />
          </label>
          <p>Public charging is priced at {naira(PUBLIC_NGN_PER_KWH)}/kWh and blended in using each day's share of public vs home charging.</p>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }) {
  return <div className="ns-stat"><span>{label}</span><strong>{value}</strong></div>
}
