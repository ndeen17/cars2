import { useSyncExternalStore } from 'react'
import { seedInventory, seedLeads } from '../data/erp'

// Tiny localStorage-backed store so the ERP, enquiry form and concierge share state.
// Demo only — a real build would talk to an API.
const KEY = 'vanta-erp-v1'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* storage blocked — fall through to seed */ }
  return { inventory: seedInventory(), leads: seedLeads() }
}

let state = load()
const listeners = new Set()

function commit(next) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  listeners.forEach(l => l())
}

const subscribe = l => { listeners.add(l); return () => listeners.delete(l) }
const getSnapshot = () => state

export const useErp = () => useSyncExternalStore(subscribe, getSnapshot)
export const getErp = () => state

export function addLead(lead) {
  const id = 'L-' + (201 + state.leads.length)
  commit({ ...state, leads: [{ id, stage: 'New', created: Date.now(), note: '', source: 'Website', ...lead }, ...state.leads] })
  return id
}
export function setLeadStage(id, stage) {
  commit({ ...state, leads: state.leads.map(l => l.id === id ? { ...l, stage } : l) })
}
export function setUnitStatus(id, status) {
  commit({ ...state, inventory: state.inventory.map(u => u.id === id ? { ...u, status } : u) })
}
export function addUnit(unit) {
  const id = 'U' + (1001 + state.inventory.length)
  commit({ ...state, inventory: [{ id, status: 'In stock', daysInStock: 0, customs: 'Duties cleared', ...unit }, ...state.inventory] })
}
export function resetErp() {
  commit({ inventory: seedInventory(), leads: seedLeads() })
}
export function setUnitField(id, patch) {
  commit({ ...state, inventory: state.inventory.map(u => u.id === id ? { ...u, ...patch } : u) })
}
