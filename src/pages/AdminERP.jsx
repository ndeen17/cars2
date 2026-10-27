import { useMemo, useState } from 'react'
import { useErp, setLeadStage, setUnitStatus, addUnit, resetErp } from '../lib/store'
import { LEAD_STAGES, UNIT_STATUSES, SALES_WEEKS } from '../data/erp'
import { CARS } from '../data/cars'
import { FX_NGN_PER_USD, naira, priceUsd } from '../data/config'

const TABS = ['Overview', 'Inventory', 'Leads']
const usd = n => '$' + Math.round(n).toLocaleString('en-US')
const ago = ts => {
  const h = (Date.now() - ts) / 3600000
  return h < 1 ? 'just now' : h < 24 ? `${Math.floor(h)}h ago` : `${Math.floor(h / 24)}d ago`
}

export default function AdminERP() {
  const [tab, setTab] = useState('Overview')
  const { inventory, leads } = useErp()

  return (
    <main className="pg pg--wide">
      <div className="pg-head">
        <div className="pg-eyebrow">Staff console</div>
        <h1 className="pg-title">Dealership ERP</h1>
        <p className="pg-sub">EV-focused inventory, battery health, customs status and lead pipeline in one place.</p>
        <div className="pg-note">
          Demo — no sign-in, data is stored in this browser only. Enquiries and concierge bookings from the public site land in Leads.{' '}
          <button className="ad-link" onClick={() => { if (confirm('Reset all demo data?')) resetErp() }}>Reset demo data</button>
        </div>
      </div>

      <div className="ad-tabs">
        {TABS.map(t => (
          <button key={t} className={`ad-tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
            {t}{t === 'Leads' && <span className="ad-count">{leads.filter(l => l.stage === 'New').length}</span>}
          </button>
        ))}
      </div>

      {tab === 'Overview'  && <Overview inventory={inventory} leads={leads} goto={setTab} />}
      {tab === 'Inventory' && <Inventory inventory={inventory} />}
      {tab === 'Leads'     && <Leads leads={leads} />}
    </main>
  )
}

/* ───────── Overview ───────── */
function Overview({ inventory, leads, goto }) {
  const inStock   = inventory.filter(u => u.status === 'In stock')
  const transit   = inventory.filter(u => u.status === 'In transit')
  const value     = inStock.reduce((a, u) => a + u.priceUsd, 0)
  const avgDays   = inStock.length ? inStock.reduce((a, u) => a + u.daysInStock, 0) / inStock.length : 0
  const open      = leads.filter(l => !['Won', 'Lost'].includes(l.stage))
  const won       = leads.filter(l => l.stage === 'Won').length
  const closed    = leads.filter(l => ['Won', 'Lost'].includes(l.stage)).length
  const conv      = closed ? Math.round(won / closed * 100) : 0
  const maxU      = Math.max(...SALES_WEEKS.map(w => w.units))
  const evShare   = Math.round(inventory.filter(u => u.ev).length / inventory.length * 100)

  const alerts = [
    ...inStock.filter(u => u.daysInStock > 45).map(u => ({ k: 'age-' + u.id, text: `${u.model} ${u.id} has been in stock ${u.daysInStock} days`, to: 'Inventory' })),
    ...transit.filter(u => u.customs !== 'Duties cleared').map(u => ({ k: 'cus-' + u.id, text: `${u.model} ${u.id}: ${u.customs}`, to: 'Inventory' })),
    ...leads.filter(l => l.stage === 'New' && Date.now() - l.created > 86400000).map(l => ({ k: 'ld-' + l.id, text: `${l.name} (${l.model}) hasn't been contacted in over 24h`, to: 'Leads' })),
  ].slice(0, 6)

  return (
    <>
      <div className="ad-kpis">
        <Kpi label="Units in stock" value={inStock.length} sub={`${transit.length} in transit`} />
        <Kpi label="Stock value" value={usd(value)} sub={`≈ ${naira(value * FX_NGN_PER_USD)}`} />
        <Kpi label="Open leads" value={open.length} sub={`${conv}% close rate`} />
        <Kpi label="Avg days in stock" value={avgDays.toFixed(0)} sub={`${evShare}% of range is EV`} />
      </div>

      <div className="ad-two">
        <section className="ns-card">
          <h3 className="ns-h">Units sold per week</h3>
          <div className="ad-chart">
            {SALES_WEEKS.map(w => (
              <div key={w.w} className="ad-bar-col">
                <span>{w.units}</span>
                <div className="ad-bar" style={{ height: `${w.units / maxU * 100}%` }} />
                <small>{w.w}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="ns-card">
          <h3 className="ns-h">Needs attention</h3>
          {alerts.length === 0 && <p className="ad-muted">All clear.</p>}
          {alerts.map(a => (
            <button key={a.k} className="ad-alert" onClick={() => goto(a.to)}>
              <i /> {a.text}
            </button>
          ))}
        </section>
      </div>
    </>
  )
}

function Kpi({ label, value, sub }) {
  return <div className="ad-kpi"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>
}

/* ───────── Inventory ───────── */
function Inventory({ inventory }) {
  const [q, setQ]           = useState('')
  const [status, setStatus] = useState('All')
  const [adding, setAdding] = useState(false)

  const rows = useMemo(() => inventory.filter(u =>
    (status === 'All' || u.status === status) &&
    (`${u.model} ${u.vin} ${u.color} ${u.location}`.toLowerCase().includes(q.toLowerCase()))
  ), [inventory, q, status])

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
      <div className="ad-toolbar">
        <input className="ad-search" placeholder="Search model, VIN, colour, location…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="cm-group">
          {['All', ...UNIT_STATUSES].map(s => (
            <button key={s} className={`cm-chip${status === s ? ' on' : ''}`} onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
        <div className="cm-group">
          <button className="cm-chip" onClick={exportCsv}>Export CSV</button>
          <button className="cm-chip on" onClick={() => setAdding(a => !a)}>{adding ? 'Cancel' : '+ Add unit'}</button>
        </div>
      </div>

      {adding && <AddUnit onDone={() => setAdding(false)} />}

      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>ID</th><th>Model</th><th>Colour</th><th>Location</th><th>Price</th><th>Days</th><th>Battery</th><th>Customs</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td><strong>{u.id}</strong><small>{u.vin}</small></td>
                <td>{u.model}{u.ev && <span className="ad-ev">EV</span>}</td>
                <td>{u.color}</td>
                <td>{u.location}</td>
                <td>{usd(u.priceUsd)}<small>{naira(u.priceUsd * FX_NGN_PER_USD)}</small></td>
                <td className={u.daysInStock > 45 ? 'ad-warn' : ''}>{u.daysInStock}</td>
                <td>{u.ev ? <span className={u.soh < 98 ? 'ad-warn' : ''}>{u.soh}% SoH{u.homeCharger ? ' · wallbox' : ''}</span> : '—'}</td>
                <td className={u.customs !== 'Duties cleared' ? 'ad-warn' : ''}>{u.customs}</td>
                <td>
                  <select className={`ad-status st-${u.status.replace(' ', '')}`} value={u.status} onChange={e => setUnitStatus(u.id, e.target.value)}>
                    {UNIT_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="ad-muted">No units match.</td></tr>}
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
    <form className="ad-add" onSubmit={submit}>
      <label>Model
        <select value={f.modelId} onChange={e => { const c = CARS.find(x => x.id === e.target.value); setF({ ...f, modelId: c.id, price: priceUsd(c.price) }) }}>
          {CARS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <label>Colour<input required value={f.color} onChange={e => setF({ ...f, color: e.target.value })} /></label>
      <label>Location<input required value={f.location} onChange={e => setF({ ...f, location: e.target.value })} /></label>
      <label>Price (USD)<input required type="number" min="0" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></label>
      <button className="btn-dark" type="submit">Add to inventory</button>
    </form>
  )
}

/* ───────── Leads ───────── */
function Leads({ leads }) {
  return (
    <div className="ad-board">
      {LEAD_STAGES.map(stage => {
        const col = leads.filter(l => l.stage === stage)
        return (
          <div key={stage} className="ad-col">
            <div className="ad-col-head">{stage}<span>{col.length}</span></div>
            {col.map(l => (
              <div key={l.id} className="ad-lead">
                <strong>{l.name}</strong>
                <div>{l.model} · {l.source}</div>
                <div className="ad-muted">{l.phone}{l.email && ` · ${l.email}`}</div>
                {l.note && <p>{l.note}</p>}
                <div className="ad-lead-foot">
                  <small>{ago(l.created)}</small>
                  <select value={l.stage} onChange={e => setLeadStage(l.id, e.target.value)}>
                    {LEAD_STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {col.length === 0 && <div className="ad-empty">—</div>}
          </div>
        )
      })}
    </div>
  )
}
