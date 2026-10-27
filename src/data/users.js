// Demo accounts + role permissions. This is client-side only: it demonstrates the
// sign-in flow and role-based UI, it is NOT real security. Replace with server auth.
export const DEMO_PASSWORD = 'demo123'

export const ROLES = {
  admin: {
    label: 'Administrator',
    blurb: 'Full access, team view and data reset.',
    tabs: ['Overview', 'Inventory', 'Leads', 'Team'],
    perms: { editLeads: true, editStatus: true, addUnit: true, exportCsv: true, editBattery: true, seeFinance: true, seePrices: true, reset: true, evOnly: false },
  },
  sales: {
    label: 'Sales Executive',
    blurb: 'Works the lead pipeline; can view stock but not change it.',
    tabs: ['Overview', 'Inventory', 'Leads'],
    perms: { editLeads: true, editStatus: false, addUnit: false, exportCsv: false, editBattery: false, seeFinance: false, seePrices: true, reset: false, evOnly: false },
  },
  inventory: {
    label: 'Inventory Manager',
    blurb: 'Owns stock, customs and logistics; no access to leads.',
    tabs: ['Overview', 'Inventory'],
    perms: { editLeads: false, editStatus: true, addUnit: true, exportCsv: true, editBattery: false, seeFinance: true, seePrices: true, reset: false, evOnly: false },
  },
  technician: {
    label: 'Service Technician',
    blurb: 'EV units only; records battery health and wallbox fitting.',
    tabs: ['Inventory'],
    perms: { editLeads: false, editStatus: false, addUnit: false, exportCsv: false, editBattery: true, seeFinance: false, seePrices: false, reset: false, evOnly: true },
  },
}

export const USERS = [
  { id: 'u1', name: 'Ngozi Adeyemi',  email: 'admin@vanta.demo',     role: 'admin' },
  { id: 'u2', name: 'Tunde Bakare',   email: 'sales@vanta.demo',     role: 'sales' },
  { id: 'u3', name: 'Halima Yusuf',   email: 'inventory@vanta.demo', role: 'inventory' },
  { id: 'u4', name: 'Emeka Obi',      email: 'tech@vanta.demo',      role: 'technician' },
]
