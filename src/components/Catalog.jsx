import { useState } from 'react'
import { CARS, FILTERS } from '../data/cars'
import MediaAsset from './MediaAsset'

export default function Catalog({ onEnquire }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery]   = useState('')

  const visible = CARS
    .filter(c => filter === 'All' || c.tags.includes(filter))
    .filter(c => {
      if (!query) return true
      const q = query.toLowerCase()
      return c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
    })

  return (
    <section id="catalog" style={s.section}>
      <div className="catalog-header" style={s.header}>
        <div>
          <div style={s.mono}>The lineup</div>
          <h2 className="catalog-title" style={s.title}>Showing {visible.length} models</h2>
        </div>
        <div className="search-wrap" style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Search models, brands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={s.searchInput}
          />
        </div>
      </div>

      <div style={s.chips}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`chip${f === filter ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="car-grid" style={s.grid}>
        {visible.length === 0 ? (
          <div style={s.empty}>No models match your search.</div>
        ) : (
          visible.map(car => <CarCard key={car.id} car={car} onEnquire={onEnquire} />)
        )}
      </div>
    </section>
  )
}

function CarCard({ car, onEnquire }) {
  return (
    <article className="car-card" style={s.card} onClick={() => onEnquire(car.name)}>
      <div style={s.thumb}>
        <div style={s.badge}>{car.body}</div>
        <MediaAsset src={car.asset} alt={car.name} style={s.thumbMedia} />
      </div>
      <div style={s.info}>
        <h3 style={s.name}>{car.name}</h3>
        <div style={s.tx}>
          <span style={s.txIcon} />
          {car.transmission}
        </div>
        <div style={s.meta}>
          <span>{car.seats} Seats</span>
          <span style={s.dot}>·</span>
          <span>{car.bags} Bags</span>
          <span style={s.dot}>·</span>
          <span><span style={{ color: '#18181c' }}>★</span>{car.rating}</span>
        </div>
        <div>
          <div style={s.priceLabel}>Start from</div>
          <div style={s.price}>{car.price}</div>
        </div>
      </div>
    </article>
  )
}

const s = {
  section:     { maxWidth: 1280, margin: '0 auto', padding: '86px 32px 40px' },
  header:      { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 30 },
  mono:        { fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3, color: '#4a5b73', textTransform: 'uppercase', marginBottom: 12 },
  title:       { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: -1, margin: 0 },
  searchWrap:  { position: 'relative', width: 300 },
  searchIcon:  { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9a9aa0', fontSize: 16, pointerEvents: 'none' },
  searchInput: { width: '100%', background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 999, padding: '13px 18px 13px 38px', color: '#18181c', fontSize: 14, outline: 'none' },
  chips:       { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20 },
  empty:       { gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#9a9aa0', fontSize: 15 },
  card:        { display: 'flex', flexDirection: 'column' },
  thumb:       { position: 'relative', background: '#f0efec', borderRadius: 14, aspectRatio: '16/10', overflow: 'hidden' },
  thumbMedia:  { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  badge:       { position: 'absolute', top: 14, left: 14, zIndex: 3, background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 999, padding: '5px 13px', fontSize: 11, fontWeight: 600, color: '#44444c' },
  info:        { padding: '16px 4px 0', display: 'flex', flexDirection: 'column', gap: 9 },
  name:        { fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 19, margin: 0 },
  tx:          { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#5a5a62' },
  txIcon:      { display: 'inline-block', width: 10, height: 10, border: '1.5px solid #9a9aa0', borderRadius: 2, flex: 'none' },
  meta:        { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6c6c74' },
  dot:         { color: '#cfcdc7' },
  priceLabel:  { fontSize: 11, color: '#9a9aa0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 1 },
  price:       { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20 },
}
