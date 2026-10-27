import { useMemo, useState } from 'react'
import { useErp, setLeadStage, setUnitStatus, setUnitField, addUnit, resetErp } from '../lib/store'
import { useSession, signOut } from '../lib/auth'
import { LEAD_STAGES, UNIT_STATUSES, SALES_WEEKS } from '../data/erp'
import { USERS, ROLES } from '../data/users'
import { CARS } from '../data/cars'
import { FX_NGN_PER_USD, naira, priceUsd } from '../data/config'
import Concierge from '../components/Concierge'
import SignIn from './SignIn'

const usd = n => '$' + Math.round(n).toLocaleString('en-US')
const ago = ts => {
  const h = (Date.now() - ts) / 3600000
  return h < 1 ? 'just now' : h < 24 ? `${Math.floor(h)}h ago` : `${Math.floor(h / 24)}d ago`
}
const TAB_ICON = { Overview: '▦', Inventory: '▤', Leads: '◔', Team: '◍' }

// Standalone app: renders its own chrome, no public nav/footer.
export default function AdminERP() {
  const session = useSession()
  if (!session) return <SignIn />
  return <Console key={session.user.id} session={session} />
}

function Console({ session }) {
  const { user, role } = session
  const [tab, setTab] = useState(role.tabs[0])
  const { inventory, leads } = useErp()
  const newLeads = role.tabs.includes('Leads') ? leads.filter(l => l.stage === 'New').length : 0

  return (
    <div className="erp">
      <aside className="erp-side">
        <div className="erp-brand"><i /> VANTA <span>OPS</span></div>

        <nav className="erp-nav">
          {role.tabs.map(t => (
            <button key={t} className={`erp-nav-item${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              <b aria-hidden="true">{TAB_ICON[t]}</b>{t}
              {t === 'Leads' && newLeads > 0 && <em>{newLeads}</em>}
            </button>
          ))}
        </nav>

        <div className="erp-side-foot">
          <a className="erp-back" href="#">← Back to website</a>
          <div className="erp-user">
            <div className="erp-avatar">{user.name.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <strong>{user.name}</strong>
              <small>{role.label}</small>
            </div>
          </div>
          <button className="erp-signout" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <div className="erp-main">
        <header className="erp-top">
          <h1>{tab}</h1>
          <div className="erp-top-right">
            <span className="erp-date">{new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <span className={`erp-role r-${user.role}`}>{role.label}</span>
          </div>
        </header>

        <div className="erp-body">
          {tab === 'Overview'  && <Overview inventory={inventory} leads={leads} role={role} goto={setTab} />}
          {tab === 'Inventory' && <Inventory inventory={inventory} perms={role.perms} />}
          {tab === 'Leads'     && <Leads leads={leads} perms={role.perms} />}
          {tab === 'Team'      && <Team perms={role.perms} />}
          <p className="erp-foot">Demo environment — data lives in this browser only.</p>
        </div>
      </div>

      <Concierge mode="staff" roleKey={user.role} />
    </div>
  )
}

/* ───────── Overview ───────── */
function Overview({ inventory, leads, role, goto }) {
  const { perms, tabs } = role
  const inStock = inventory.filter(u => u.status === 'In stock')
  const transit = inventory.filter(u => u.status === 'In transit')
  const value   = inStock.reduce((a, u) => a + u.priceUsd, 0)
  const avgDays = inStock.length ? inStock.reduce((a, u) => a + u.daysInStock, 0) / inStock.length : 0
  const open    = leads.filter(l => !['Won', 'Lost'].includes(l.stage))
  const won     = leads.filter(l => l.stage === 'Won').length
  const closed  = leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length
  const conv    = closed ? Math.round(won / closed * 100) : 0
  const maxU    = Math.max(...SALES_WEEKS.map(w => w.units))
  const canLeads = tabs.includes('Leads')

  const kpis = [
    { label: 'Units in stock', value: inStock.length, sub: `${transit.length} in transit` },
    perms.seeFinance && { label: 'Stock value', value: usd(value), sub: `≈ ${naira(value * FX_NGN_PER_USD)}` },
    canLeads && { label: 'Open leads', value: open.length, sub: `${conv}% close rate` },
    { label: 'Avg days in stock', value: avgDays.toFixed(0), sub: 'in-stock units' },
  ].filter(Boolean)

  const alerts = [
    ...inStock.filter(u => u.daysInStock > 45).map(u => ({ k: 'age-' + u.id, text: `${u.model} ${u.id} has been in stock ${u.daysInStock} days`, to: 'Inventory' })),
    ...transit.filter(u => u.customs !== 'Duties cleared').map(u => ({ k: 'cus-' + u.id, text: `${u.model} ${u.id}: ${u.customs}`, to: 'Inventory' })),
    ...(canLeads ? leads.filter(l => l.stage === 'New' && Date.now() - l.created > 86400000).map(l => ({ k: 'ld-' + l.id, text: `${l.name} (${l.model}) not contacted in 24h+`, to: 'Leads' })) : []),
  ].filter(a => tabs.includes(a.to)).slice(0, 6)

  return (
    <>
      <div className="erp-kpis">
        {kpis.map(k => (
          <div key={k.label} className="erp-kpi"><span>{k.label}</span><strong>{k.value}</strong><small>{k.sub}</small></div>
        ))}
      </div>
      <div className="erp-two">
        <section className="erp-panel">
          <h3>Units sold per week</h3>
          <div className="erp-chart">
            {SALES_WEEKS.map(w => (
              <div key={w.w} className="erp-bar-col">
                <span>{w.units}</span>
                <div style={{ height: `${w.units / maxU * 100}%` }} />
                <small>{w.w}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="erp-panel">
          <h3>Needs attention</h3>
          {alerts.length === 0 && <p className="erp-muted">All clear.</p>}
          {alerts.map(a => (
            <button key={a.k} className="erp-alert" onClick={() => goto(a.to)}><i />{a.text}</button>
          ))}
        </section>
      </div>
    </>
  )
}

/* ───────── Inventory ───────── */
function Inventory({ inventory, perms }) {
  const [q, setQ]           = useState('')
  const [status, setStatus] = useState('All')
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => inventory.filter(u =>
    (!perms.evOnly || u.ev) &&
    (status === 'All' || u.status === status) &&
    `${u.model} ${u.vin} ${u.color} ${u.location}`.toLowerCase().includes(q.toLowerCase())
  ), [inventory, q, status, perms.evOnly])

  function exportCsv() {
    const head = ['ID', 'VIN', 'Model', 'Colour', 'Status', 'Location', 'Price USD', 'Days in stock', 'Battery SoH', 'Customs']
    const lines = rows.map(u => [u.id, u.vin, u.model, u.color, u.status, u.location, u.priceUsd, u.daysInStock, u.soh ?? '', u.customs]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const url = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'vanta-inventory.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {perms.evOnly && <div className="erp-banner">Showing electric vehicles only. You can record battery health and wallbox fitting.</div>}
      <div className="erp-toolbar">
        <input className="erp-input erp-search" placeholder="Search model, VIN, colour, location…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="erp-seg">
          {['All', ...UNIT_STATUSES].map(s => (
            <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
        {perms.exportCsv && <button className="erp-btn" onClick={exportCsv}>Export CSV</button>}
        {perms.addUnit && <button className="erp-btn primary" onClick={() => setAdding(a => !a)}>{adding ? 'Cancel' : '+ Add unit'}</button>}
      </div>

      {adding && <AddUnit onDone={() => setAdding(false)} />}

      <div className="erp-table-wrap">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Unit</th><th>Model</th><th>Colour</th><th>Location</th>
              {perms.seePrices && <th>Price</th>}
              <th>Days</th><th>Battery</th><th>Customs</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td><strong>{u.id}</strong><small>{u.vin}</small></td>
                <td>{u.model}{u.ev && <span className="erp-ev">EV</span>}</td>
                <td>{u.color}</td>
                <td>{u.location}</td>
                {perms.seePrices && <td>{usd(u.priceUsd)}{perms.seeFinance && <small>{naira(u.priceUsd * FX_NGN_PER_USD)}</small>}</td>}
                <td className={u.daysInStock > 45 ? 'warn' : ''}>{u.daysInStock}</td>
                <td>
                  {!u.ev ? '—' : perms.editBattery ? (
                    <div className="erp-batt">
                      <input className="erp-input" type="number" min="50" max="100" value={u.soh}
                        onChange={e => setUnitField(u.id, { soh: Math.max(0, Math.min(100, +e.target.value || 0)) })} aria-label={`${u.id} battery state of health`} />%
                      <label><input type="checkbox" checked={!!u.homeCharger} onChange={e => setUnitField(u.id, { homeCharger: e.target.checked })} /> wallbox</label>
                    </div>
                  ) : (
                    <span className={u.soh < 98 ? 'warn' : ''}>{u.soh}% SoH{u.homeCharger ? ' · wallbox' : ''}</span>
                  )}
                </td>
                <td className={u.customs !== 'Duties cleared' ? 'warn' : ''}>{u.customs}</td>
                <td>
                  {perms.editStatus ? (
                    <select className={`erp-pill st-${u.status.replace(' ', '')}`} value={u.status} onChange={e => setUnitStatus(u.id, e.target.value)}>
                      {UNIT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : <span className={`erp-pill st-${u.status.replace(' ', '')}`}>{u.status}</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="erp-muted">No units match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AddUnit({ onDone }) {
  const [f, setF] = useState({ modelId: CARS[0].id, color: 'Glacier White', location: 'Lagos · VI Showroom', price: priceUsd(CARS[0].price) })
  const car = CARS.find(c => c.id === f.modelId)

  function submit(e) {
    e.preventDefault()
    const ev = car.type === 'Electric'
    addUnit({
      vin: `VNT${car.id.slice(0, 3).toUpperCase()}${Math.floor(100000 + Math.random() * 899999)}`,
      modelId: car.id, model: car.name, color: f.color, location: f.location,
      priceUsd: +f.price, ev, soh: ev ? 100 : null, homeCharger: false,
    })
    onDone()
  }

  return (
    <form className="erp-add" onSubmit={submit}>
      <label>Model
        <select className="erp-input" value={f.modelId} onChange={e => { const c = CARS.find(x => x.id === e.target.value); setF({ ...f, modelId: c.id, price: priceUsd(c.price) }) }}>
          {CARS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>Colour<input className="erp-input" required value={f.color} onChange={e => setF({ ...f, color: e.target.value })} /></label>
      <label>Location<input className="erp-input" required value={f.location} onChange={e => setF({ ...f, location: e.target.value })} /></label>
      <label>Price (USD)<input className="erp-input" required type="number" min="0" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></label>
      <button className="erp-btn primary" type="submit">Add to inventory</button>
    </form>
  )
}

/* ───────── Leads ───────── */
function Leads({ leads, perms }) {
  return (
    <>
      {!perms.editLeads && <div className="erp-banner">Read-only access to the pipeline.</div>}
      <div className="erp-board">
        {LEAD_STAGES.map(stage => {
          const col = leads.filter(l => l.stage === stage)
          return (
            <div key={stage} className="erp-col">
              <div className="erp-col-head">{stage}<span>{col.length}</span></div>
              {col.map(l => (
                <div key={l.id} className="erp-lead">
                  <strong>{l.name}</strong>
                  <div>{l.model} · {l.source}</div>
                  <div className="erp-muted">{l.phone}{l.email && ` · ${l.email}`}</div>
                  {l.note && <p>{l.note}</p>}
                  <div className="erp-lead-foot">
                    <small>{ago(l.created)}</small>
                    {perms.editLeads && (
                      <select className="erp-input" value={l.stage} onChange={e => setLeadStage(l.id, e.target.value)}>
                        {LEAD_STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
              {col.length === 0 && <div className="erp-empty">—</div>}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ───────── Team (admin) ───────── */
const PERM_LABELS = [
  ['editLeads', 'Edit lead stages'], ['editStatus', 'Change unit status'], ['addUnit', 'Add units'],
  ['exportCsv', 'Export CSV'], ['editBattery', 'Record battery health'], ['seePrices', 'See prices'],
  ['seeFinance', 'See stock value / ₦'], ['reset', 'Reset demo data'],
]

function Team({ perms }) {
  return (
    <>
      <section className="erp-panel">
        <h3>Staff</h3>
        <table className="erp-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Sections</th></tr></thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`erp-role r-${u.role}`}>{ROLES[u.role].label}</span></td>
                <td>{ROLES[u.role].tabs.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="erp-panel" style={{ marginTop: 18 }}>
        <h3>Role permissions</h3>
        <div className="erp-table-wrap">
          <table className="erp-table erp-matrix">
            <thead><tr><th>Permission</th>{Object.values(ROLES).map(r => <th key={r.label}>{r.label}</th>)}</tr></thead>
            <tbody>
              {PERM_LABELS.map(([k, label]) => (
                <tr key={k}>
                  <td>{label}</td>
                  {Object.values(ROLES).map(r => <td key={r.label} className={r.perms[k] ? 'yes' : 'no'}>{r.perms[k] ? '✓' : '—'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {perms.reset && (
        <section className="erp-panel" style={{ marginTop: 18 }}>
          <h3>Danger zone</h3>
          <p className="erp-muted">Restore inventory and leads to the original demo data.</p>
          <button className="erp-btn danger" onClick={() => { if (confirm('Reset all demo data?')) resetErp() }}>Reset demo data</button>
        </section>
      )}
    </>
  )
}
