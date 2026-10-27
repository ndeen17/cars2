import { CARS } from '../data/cars'
import { STATIONS, stationState } from '../data/stations'
import { naira, priceUsd, FX_NGN_PER_USD, PETROL_NGN_PER_L, HOME_NGN_PER_KWH, ICE_L_PER_100KM } from '../data/config'
import { getErp } from './store'
import { ROLES } from '../data/users'

// Rule-based demo concierge. Same interface a real LLM backend would expose:
// reply(text, ctx) -> { text, chips? }. Swap the bodies for an API call later.

const has = (q, re) => re.test(q)
const usd = n => '$' + Math.round(n).toLocaleString('en-US')

function parseBudgetUsd(q) {
  const m = q.match(/(?:under|below|less than|budget(?: of)?|max(?:imum)?|up to|around)\s*\$?\s*([\d,.]+)\s*(k|m|million)?/i)
  if (!m) return null
  let n = parseFloat(m[1].replace(/,/g, ''))
  if (m[2]?.toLowerCase() === 'k') n *= 1000
  if (m[2] && /m/i.test(m[2])) n *= 1_000_000
  if (/₦|naira|ngn/i.test(q) || n > 1_000_000) n = n / FX_NGN_PER_USD
  return n
}

function weeklySaving(kmPerWeek = 250, kwhPer100 = 16) {
  const petrol = kmPerWeek / 100 * ICE_L_PER_100KM * PETROL_NGN_PER_L
  const ev     = kmPerWeek / 100 * kwhPer100 * HOME_NGN_PER_KWH
  return { petrol, ev, saved: petrol - ev }
}

function stationsReply(q) {
  const cityMatch = ['lagos', 'abuja', 'port harcourt', 'ibadan'].find(c => q.includes(c))
  const areaMatch = q.match(/lekki|victoria island|\bvi\b|ikoyi|ikeja|ajah|surulere|maitama|wuse|kubwa|gra|ring road/)
  let list = STATIONS
  if (areaMatch) {
    const a = areaMatch[0] === 'vi' ? 'victoria island' : areaMatch[0]
    list = STATIONS.filter(s => s.area.toLowerCase().includes(a) || s.name.toLowerCase().includes(a))
  } else if (cityMatch) {
    list = STATIONS.filter(s => s.city.toLowerCase() === cityMatch)
  }
  if (!list.length) list = STATIONS
  const top = [...list]
    .sort((a, b) => b.free - a.free || b.kw - a.kw)
    .slice(0, 3)
  const lines = top.map(s => {
    const st = stationState(s)
    const tag = st === 'busy' ? 'busy right now' : `${s.free}/${s.ports} free`
    return `• ${s.name} — ${s.kw} kW, ${naira(s.price)}/kWh, ${tag}`
  })
  return {
    text: `Here are the best-availability chargers${areaMatch || cityMatch ? ' there' : ' across the network'}:\n${lines.join('\n')}\n\nOpen the live map for the full picture.`,
    chips: [{ label: 'Open charging map', href: '#/charging' }],
  }
}

export function customerReply(text, ctx = {}) {
  const q = text.toLowerCase()

  if (has(q, /station|charger|charging point|where.*charge|nearest|near me|ev map|map/)) {
    return stationsReply(q)
  }

  if (has(q, /sav(e|ing)|naira|fuel|petrol|pms|running cost|cost to run|cheaper/)) {
    const km = parseInt(q.match(/(\d{2,4})\s*km/)?.[1] || '250', 10)
    const { petrol, ev, saved } = weeklySaving(km)
    return {
      text: `At roughly ${km} km a week: a comparable petrol car burns about ${naira(petrol)} in fuel (at ${naira(PETROL_NGN_PER_L)}/L), while charging an EV at home costs around ${naira(ev)}. That's about ${naira(saved)} saved weekly — ${naira(saved * 52)} a year.`,
      chips: [{ label: 'Open Naira Saver', href: '#/saver' }],
    }
  }

  if (has(q, /book|test.?drive|appointment|schedule|visit/)) {
    return { text: '__START_BOOKING__' }
  }

  if (has(q, /recommend|suggest|which car|best car|looking for|family|suv|sedan|coupe|hatch|cheapest|budget|under|affordable|electric|hybrid|seat/)
      && !(ctx.car && has(q, /range|battery|0.60|power|torque|charg/))) {
    let pool = [...CARS]
    const budget = parseBudgetUsd(q)
    if (budget) pool = pool.filter(c => priceUsd(c.price) <= budget)
    if (has(q, /suv/)) pool = pool.filter(c => c.body === 'SUV')
    if (has(q, /sedan/)) pool = pool.filter(c => c.body === 'Sedan')
    if (has(q, /coupe/)) pool = pool.filter(c => c.body === 'Coupe')
    if (has(q, /hatch/)) pool = pool.filter(c => c.body === 'Hatchback')
    if (has(q, /electric|ev\b|naira|save/)) pool = pool.filter(c => c.type === 'Electric')
    if (has(q, /hybrid/)) pool = pool.filter(c => c.type === 'Hybrid')
    const seats = q.match(/(\d)\s*(?:seat|people|passenger)/)
    if (seats) pool = pool.filter(c => c.seats >= +seats[1])
    if (has(q, /family|kids|children/)) pool = pool.filter(c => c.seats >= 5)
    if (has(q, /cheap|afford/)) pool.sort((a, b) => priceUsd(a.price) - priceUsd(b.price))
    if (!pool.length) {
      return { text: "I couldn't find an exact match for that — try loosening the budget or body type, or tell me what matters most (range, seats, price) and I'll narrow it down." }
    }
    const lines = pool.slice(0, 3).map(c => `• ${c.name} — ${c.body}, ${c.type}, ${c.seats} seats, ${c.price} (~${naira(priceUsd(c.price) * FX_NGN_PER_USD)})`)
    return {
      text: `Based on what you've told me:\n${lines.join('\n')}`,
      chips: pool.slice(0, 2).map(c => ({ label: `Book ${c.name}`, book: c.name })),
    }
  }

  if (has(q, /price|how much|cost|₦/) && !ctx.car) {
    const lines = CARS.map(c => `• ${c.name} — ${c.price} (~${naira(priceUsd(c.price) * FX_NGN_PER_USD)})`)
    return { text: `Current line-up (₦ shown at a demo rate of ${naira(FX_NGN_PER_USD)}/$):\n${lines.join('\n')}` }
  }

  if (ctx.car && ctx.fallback) return { text: ctx.fallback(text, ctx.car) }

  return {
    text: "I'm the VANTA concierge. I can find you the right car, show live charging stations, work out how much you'd save versus petrol, or book a test drive. What would you like?",
    chips: [
      { label: 'Charging near Lekki', ask: 'Where can I charge near Lekki?' },
      { label: 'How much will I save?', ask: 'How much will I save on fuel per week?' },
      { label: 'EV under $60k', ask: 'Recommend an electric car under $60k' },
    ],
  }
}

const DENIED = label => ({ text: `That's outside your ${label} access — ask an administrator.` })

export function staffReply(text, roleKey = 'admin') {
  const q = text.toLowerCase()
  const role = ROLES[roleKey] ?? ROLES.admin
  const canLeads = role.tabs.includes('Leads'), canFinance = role.perms.seeFinance
  const erp = getErp()
  const inventory = role.perms.evOnly ? erp.inventory.filter(u => u.ev) : erp.inventory
  const leads = canLeads ? erp.leads : []
  const avail = inventory.filter(u => u.status === 'In stock')

  if (has(q, /summary|brief|today|overview|how are we doing/)) {
    const hot = leads.filter(l => ['Test drive', 'Negotiating'].includes(l.stage)).length
    const fresh = leads.filter(l => l.stage === 'New').length
    return { text: `Snapshot: ${avail.length} units in stock, ${inventory.filter(u => u.status === 'In transit').length} in transit, ${inventory.filter(u => u.status === 'Reserved').length} reserved.${canLeads ? ` Pipeline has ${fresh} new and ${hot} hot leads.` : ''} Ask me about ageing stock, customs, battery health${canLeads ? ', or who to call next' : ''}.` }
  }

  if (has(q, /ageing|aging|old stock|slow|stale|days in stock/)) {
    const old = avail.filter(u => u.daysInStock > 45).sort((a, b) => b.daysInStock - a.daysInStock).slice(0, 5)
    if (!old.length) return { text: 'No in-stock unit has been sitting longer than 45 days.' }
    return { text: `Units sitting over 45 days:\n${old.map(u => `• ${u.id} ${u.model} (${u.color}) — ${u.daysInStock} days, ${u.location}`).join('\n')}\nConsider a promo or a trade-in push on these.` }
  }

  if (has(q, /customs|duty|duties|clearance|port|transit|apapa/)) {
    const t = inventory.filter(u => u.status === 'In transit')
    return { text: t.length ? `${t.length} units still moving or pending clearance:\n${t.map(u => `• ${u.id} ${u.model} — ${u.customs}`).join('\n')}` : 'Nothing in transit — all units cleared.' }
  }

  if (has(q, /battery|soh|health/)) {
    const evs = inventory.filter(u => u.ev && u.status !== 'Sold').sort((a, b) => a.soh - b.soh).slice(0, 4)
    return { text: `Lowest battery state-of-health in the yard:\n${evs.map(u => `• ${u.id} ${u.model} — ${u.soh}% SoH`).join('\n')}` }
  }

  if (has(q, /lead|follow|call next|who|pipeline|new enquir/)) {
    if (!canLeads) return DENIED(role.label)
    const next = leads.filter(l => ['New', 'Contacted', 'Test drive', 'Negotiating'].includes(l.stage))
      .sort((a, b) => ['Negotiating', 'Test drive', 'New', 'Contacted'].indexOf(a.stage) - ['Negotiating', 'Test drive', 'New', 'Contacted'].indexOf(b.stage))
      .slice(0, 4)
    return { text: next.length ? `Priority follow-ups:\n${next.map(l => `• ${l.name} — ${l.model} (${l.stage}) · ${l.phone}`).join('\n')}` : 'No open leads right now.' }
  }

  if (has(q, /stock|inventory|available|how many|units/)) {
    const m = CARS.find(c => q.includes(c.name.toLowerCase()))
    if (m) {
      const n = avail.filter(u => u.modelId === m.id).length
      return { text: `${n} ${m.name} unit${n === 1 ? '' : 's'} in stock (${inventory.filter(u => u.modelId === m.id && u.status === 'Reserved').length} reserved).` }
    }
    const by = CARS.map(c => `${c.name}: ${avail.filter(u => u.modelId === c.id).length}`).join(' · ')
    return { text: `${avail.length} units available — ${by}` }
  }

  if (has(q, /revenue|sales|sold|worth|value|margin/)) {
    if (!canFinance) return DENIED(role.label)
    const sold = inventory.filter(u => u.status === 'Sold')
    const rev = sold.reduce((a, u) => a + u.priceUsd, 0)
    const pipe = inventory.filter(u => u.status === 'Reserved').reduce((a, u) => a + u.priceUsd, 0)
    return { text: `Sold: ${sold.length} units, ${usd(rev)} (~${naira(rev * FX_NGN_PER_USD)}). Reserved pipeline worth ${usd(pipe)}.` }
  }

  return {
    text: "I'm the staff assistant. Ask me for a daily summary, stock by model, ageing inventory, customs status, battery health, or who to follow up with.",
    chips: [
      { label: 'Daily summary', ask: 'Give me a daily summary' },
      { label: 'Ageing stock', ask: 'Which stock is ageing?' },
      { label: 'Who to call next?', ask: 'Which leads should I follow up with?' },
    ],
  }
}
