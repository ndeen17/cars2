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
      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q)
      )
    })

  return (
    <section id="catalog" style={s.section}>
      <div className="catalog-header">
        <div>
          <div className="catalog-mono">The lineup</div>
          <h2 className="catalog-title">Showing {visible.length} models</h2>
        </div>
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search models, brands…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-chips">
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

      <div className="car-grid">
        {visible.length === 0 ? (
          <div className="car-empty">No models match your search.</div>
        ) : (
          visible.map(car => <CarCard key={car.id} car={car} onEnquire={onEnquire} />)
        )}
      </div>
    </section>
  )
}

function CarCard({ car, onEnquire }) {
  return (
    <article className="car-card" onClick={() => onEnquire(car.name)}>
      <div className="car-thumb">
        <span className="car-badge">{car.body}</span>
        <MediaAsset src={car.asset} alt={car.name} className="car-thumb-media" />

        {/* Mobile luxury overlay */}
        <div className="car-overlay">
          <div className="car-overlay-type">{car.type}</div>
          <h3 className="car-overlay-name">{car.name}</h3>
          <div className="car-overlay-bottom">
            <div>
              <div className="car-overlay-price-label">From</div>
              <div className="car-overlay-price">{car.price}</div>
            </div>
            <div className="car-overlay-cta" aria-hidden="true">→</div>
          </div>
        </div>
      </div>

      {/* Desktop info below card */}
      <div className="car-info">
        <h3 className="car-name">{car.name}</h3>
        <div className="car-tx">
          <span className="tx-icon" />
          {car.transmission}
        </div>
        <div className="car-meta">
          <span>{car.seats} Seats</span>
          <span className="car-dot">·</span>
          <span>{car.bags} Bags</span>
          <span className="car-dot">·</span>
          <span><span style={{ color: '#18181c' }}>★</span>{car.rating}</span>
        </div>
        <div>
          <div className="car-price-label">Start from</div>
          <div className="car-price">{car.price}</div>
        </div>
      </div>
    </article>
  )
}

const s = {
  section: { maxWidth: 1280, margin: '0 auto', padding: '86px 32px 40px' },
}
