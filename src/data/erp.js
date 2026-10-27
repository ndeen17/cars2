import { CARS } from './cars'
import { priceUsd } from './config'

const COLORS = ['Glacier White', 'Obsidian', 'Slate Blue', 'Sandstone', 'Midnight Green']
const LOCATIONS = ['Lagos · VI Showroom', 'Lagos · Ikeja Yard', 'Abuja · Maitama', 'In transit · Apapa Port']

// Seed inventory: 3 units per model with varied state. Deterministic (no Math.random).
export function seedInventory() {
  const statuses = ['In stock', 'In stock', 'Reserved', 'In transit', 'Sold', 'In stock']
  const units = []
  CARS.forEach((c, ci) => {
    for (let k = 0; k < 3; k++) {
      const n = ci * 3 + k
      const status = statuses[n % statuses.length]
      const ev = c.type === 'Electric'
      units.push({
        id: `U${1001 + n}`,
        vin: `VNT${c.id.slice(0, 3).toUpperCase()}${884000 + n * 137}`,
        modelId: c.id,
        model: c.name,
        color: COLORS[(n + k) % COLORS.length],
        status,
        location: status === 'In transit' ? LOCATIONS[3] : LOCATIONS[n % 3],
        priceUsd: priceUsd(c.price) + k * 1500,
        daysInStock: status === 'In transit' ? 0 : 6 + (n * 7) % 70,
        ev,
        soh: ev ? 97 + (n % 4) : null,            // battery state of health %
        customs: status === 'In transit' ? 'Pending clearance' : 'Duties cleared',
        homeCharger: ev && n % 2 === 0,            // wallbox included
      })
    }
  })
  return units
}

export const UNIT_STATUSES = ['In stock', 'Reserved', 'In transit', 'Sold']
export const LEAD_STAGES = ['New', 'Contacted', 'Test drive', 'Negotiating', 'Won', 'Lost']

export function seedLeads() {
  const now = Date.now(), d = 86400000
  return [
    { id: 'L-201', name: 'Tunde Adebayo', phone: '0803 555 0142', email: 'tunde@example.com',   model: 'Lumen GT', stage: 'Negotiating', source: 'Website',      note: 'Wants trade-in on a 2019 Range Rover.', created: now - 2 * d },
    { id: 'L-202', name: 'Amaka Okafor',  phone: '0816 555 0177', email: 'amaka@example.com',   model: 'Atlas',    stage: 'Test drive',  source: 'AI Concierge', note: 'Family of 6, needs 7 seats.',            created: now - 1 * d },
    { id: 'L-203', name: 'Ibrahim Musa',  phone: '0907 555 0108', email: 'ibrahim@example.com', model: 'Ion',      stage: 'New',         source: 'Website',      note: '',                                      created: now - 0.2 * d },
    { id: 'L-204', name: 'Chioma Eze',    phone: '0701 555 0163', email: 'chioma@example.com',  model: 'Nova',     stage: 'Contacted',   source: 'Instagram',    note: 'Prefers weekend viewing, Lekki.',       created: now - 3 * d },
    { id: 'L-205', name: 'Segun Balogun', phone: '0802 555 0119', email: 'segun@example.com',   model: 'Marque S', stage: 'Won',         source: 'Referral',     note: 'Wallbox install booked.',               created: now - 6 * d },
    { id: 'L-206', name: 'Fatima Bello',  phone: '0813 555 0190', email: 'fatima@example.com',  model: 'Vesper',   stage: 'Lost',        source: 'Website',      note: 'Went with a competitor.',               created: now - 9 * d },
  ]
}

// Last 8 weeks of units sold, for the overview chart.
export const SALES_WEEKS = [
  { w: 'W1', units: 3 }, { w: 'W2', units: 5 }, { w: 'W3', units: 4 }, { w: 'W4', units: 7 },
  { w: 'W5', units: 6 }, { w: 'W6', units: 9 }, { w: 'W7', units: 8 }, { w: 'W8', units: 11 },
]
