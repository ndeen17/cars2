// Simulated telematics for the owner's garage. A real build would stream this
// from the vehicle OEM or a telematics provider.
export const GARAGE = [
  { id: 'lumen', name: 'Lumen GT', plate: 'LND-482-KJ', kwhPer100: 17.5, battery: 120, soc: 78, odometer: 12430 },
  { id: 'ion',   name: 'Ion',      plate: 'ABJ-117-QX', kwhPer100: 13.8, battery: 62,  soc: 54, odometer: 8915 },
]

// Deterministic pseudo-random so the week is stable per car.
function rng(seed) {
  let t = seed
  return () => { t = (t * 1664525 + 1013904223) % 4294967296; return t / 4294967296 }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function weekFor(carId) {
  const rand = rng([...carId].reduce((a, c) => a + c.charCodeAt(0), 7))
  return DAYS.map((day, i) => {
    const weekend = i >= 5
    const km = Math.round((weekend ? 22 : 38) + rand() * (weekend ? 60 : 55))
    // share of energy bought at public chargers (pricier) vs. home
    const publicShare = 0.15 + rand() * 0.35
    return { day, km, publicShare }
  })
}

export const RECENT_TRIPS = [
  { from: 'Lekki Phase 1',   to: 'Victoria Island', km: 17.4, time: 'Today · 08:12',     traffic: 'Heavy' },
  { from: 'Victoria Island', to: 'Ikoyi',           km: 6.1,  time: 'Today · 13:40',     traffic: 'Moderate' },
  { from: 'Ikoyi',           to: 'Lekki Phase 1',   km: 14.9, time: 'Yesterday · 19:05', traffic: 'Heavy' },
  { from: 'Lekki Phase 1',   to: 'Ajah',            km: 21.3, time: 'Yesterday · 10:22', traffic: 'Light' },
]
