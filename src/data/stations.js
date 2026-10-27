// Demo network. Station names/locations are illustrative, not real operators.
// Availability is simulated live in ChargingMap (see simulateTick).
export const STATIONS = [
  { id: 's1',  name: 'VANTA Charge · Victoria Island',  area: 'Victoria Island, Lagos', city: 'Lagos',  lat: 6.4281, lng: 3.4219, kw: 150, ports: 6, free: 4, price: 290, hours: '24/7',       connectors: ['CCS2', 'Type 2'],   amenities: ['Lounge', 'Café', 'Wi-Fi'] },
  { id: 's2',  name: 'Lekki Phase 1 Hub',               area: 'Lekki Phase 1, Lagos',   city: 'Lagos',  lat: 6.4474, lng: 3.4723, kw: 120, ports: 4, free: 1, price: 270, hours: '24/7',       connectors: ['CCS2', 'CHAdeMO'],  amenities: ['Café', 'Security'] },
  { id: 's3',  name: 'Ikoyi Waterfront Charge',         area: 'Ikoyi, Lagos',           city: 'Lagos',  lat: 6.4549, lng: 3.4351, kw: 60,  ports: 4, free: 3, price: 250, hours: '6am – 11pm', connectors: ['CCS2', 'Type 2'],   amenities: ['Restaurant'] },
  { id: 's4',  name: 'Ikeja City Mall Chargers',        area: 'Alausa, Ikeja, Lagos',   city: 'Lagos',  lat: 6.6137, lng: 3.3580, kw: 50,  ports: 8, free: 5, price: 240, hours: '8am – 10pm', connectors: ['Type 2', 'CCS2'],   amenities: ['Mall', 'Food court'] },
  { id: 's5',  name: 'Lekki–Epe Expressway Fast Stop',  area: 'Ajah, Lagos',            city: 'Lagos',  lat: 6.4698, lng: 3.5852, kw: 180, ports: 4, free: 2, price: 310, hours: '24/7',       connectors: ['CCS2'],             amenities: ['Convenience store'] },
  { id: 's6',  name: 'Surulere Community Charger',      area: 'Surulere, Lagos',        city: 'Lagos',  lat: 6.5009, lng: 3.3567, kw: 22,  ports: 2, free: 0, price: 200, hours: '7am – 9pm',  connectors: ['Type 2'],           amenities: [] },
  { id: 's7',  name: 'Maitama Central Charge',          area: 'Maitama, Abuja',         city: 'Abuja',  lat: 9.0872, lng: 7.4934, kw: 120, ports: 6, free: 3, price: 280, hours: '24/7',       connectors: ['CCS2', 'Type 2'],   amenities: ['Lounge', 'Wi-Fi'] },
  { id: 's8',  name: 'Wuse II Plaza Charge',            area: 'Wuse II, Abuja',         city: 'Abuja',  lat: 9.0765, lng: 7.4720, kw: 50,  ports: 4, free: 2, price: 245, hours: '7am – 10pm', connectors: ['CCS2', 'CHAdeMO'],  amenities: ['Café'] },
  { id: 's9',  name: 'Abuja–Kaduna Highway Stop',       area: 'Kubwa Axis, Abuja',      city: 'Abuja',  lat: 9.1500, lng: 7.3300, kw: 150, ports: 4, free: 4, price: 300, hours: '24/7',       connectors: ['CCS2'],             amenities: ['Rest stop', 'Food'] },
  { id: 's10', name: 'GRA Port Harcourt Charge',        area: 'GRA Phase 2, Port Harcourt', city: 'Port Harcourt', lat: 4.8156, lng: 7.0498, kw: 60, ports: 4, free: 2, price: 260, hours: '24/7', connectors: ['CCS2', 'Type 2'],   amenities: ['Security'] },
  { id: 's11', name: 'Ibadan Ring Road Charger',        area: 'Ring Road, Ibadan',      city: 'Ibadan', lat: 7.3775, lng: 3.9470, kw: 50,  ports: 2, free: 1, price: 235, hours: '8am – 8pm',  connectors: ['CCS2'],             amenities: [] },
]

export const CITIES = ['All', ...new Set(STATIONS.map(s => s.city))]

// Nudge availability to mimic a live feed.
export function simulateTick(stations) {
  return stations.map(s => {
    const r = Math.random()
    let free = s.free
    if (r < 0.28) free = Math.min(s.ports, free + 1)
    else if (r < 0.56) free = Math.max(0, free - 1)
    return { ...s, free }
  })
}

export function distanceKm(aLat, aLng, bLat, bLng) {
  const R = 6371, rad = d => d * Math.PI / 180
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function stationState(s) {
  if (s.free === 0) return 'busy'
  if (s.free <= 1) return 'limited'
  return 'free'
}
