import { useState, useEffect, useRef } from 'react'
import { CARS } from '../data/cars'
import MediaAsset from './MediaAsset'
import AskAI from './AskAI'

const SPEC_TABS = [
  { id: 'performance', label: 'Performance' },
  { id: 'energy',      label: 'Energy / Fuel' },
  { id: 'dimensions',  label: 'Dimensions' },
]

// --- Gallery slot with placeholder fallback ---
function GallerySlot({ src, label, className, style }) {
  const [missing, setMissing] = useState(false)

  return (
    <div className={`cd-gslot ${className || ''}`} style={style}>
      {!missing && (
        <img
          src={src}
          alt={label}
          onError={() => setMissing(true)}
          className="cd-gslot-img"
        />
      )}
      {missing && (
        <div className="cd-gslot-ph">
          <span className="cd-gslot-ph-name">{label}</span>
          <span className="cd-gslot-ph-path">{src.split('/').slice(-1)[0]}</span>
        </div>
      )}
      <div className="cd-gslot-badge">{label}</div>
    </div>
  )
}

// --- Mini car card for "You might also like" ---
function SimilarCard({ car, onSelect }) {
  return (
    <article className="cd-sim-card" onClick={() => onSelect(car)}>
      <div className="cd-sim-thumb">
        <span className="cd-sim-badge">{car.body}</span>
        <MediaAsset src={car.asset} alt={car.name} className="cd-sim-media" />
      </div>
      <div className="cd-sim-info">
        <div className="cd-sim-type">{car.type}</div>
        <div className="cd-sim-name">{car.name}</div>
        <div className="cd-sim-price">{car.price}</div>
      </div>
    </article>
  )
}

// --- Main component ---
export default function CarDetail({ car, onClose, onEnquire }) {
  const [visible, setVisible]   = useState(false)
  const [specTab, setSpecTab]   = useState('performance')
  const scrollRef                = useRef(null)

  // Slide-in on mount, slide-out on close
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
    }
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 280)
  }

  function handleEnquire() {
    setVisible(false)
    setTimeout(() => { onClose(); onEnquire(car.name) }, 280)
  }

  // Similar cars: same type or tags, up to 3
  const similar = CARS
    .filter(c => c.id !== car.id)
    .map(c => ({ ...c, _score: c.tags.filter(t => car.tags.includes(t)).length }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 3)

  const activeSpecs = car.specs[specTab] || []

  return (
    <div
      className={`cd-overlay${visible ? ' cd-visible' : ''}`}
      ref={scrollRef}
    >
      {/* ── Sticky top nav ───────────────────────────── */}
      <header className="cd-nav">
        <button className="cd-nav-back" onClick={handleClose} aria-label="Go back">
          <span className="cd-nav-back-arrow">←</span>
          <span className="cd-nav-back-label">Back</span>
        </button>
        <div className="cd-nav-center">
          <span className="cd-nav-name">{car.name}</span>
          <span className="cd-nav-dot">·</span>
          <span className="cd-nav-price">{car.price}</span>
        </div>
        <button className="cd-nav-enquire" onClick={handleEnquire}>
          Enquire
        </button>
      </header>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="cd-hero">
        <MediaAsset src={car.asset} alt={car.name} className="cd-hero-media" eager />
        <div className="cd-hero-gradient" />
        <div className="cd-hero-content">
          <div className="cd-hero-inner">
            <div className="cd-hero-left">
              <div className="cd-hero-badge">
                <span className="cd-hero-dot" />
                {car.type} · {car.body}
              </div>
              <h1 className="cd-hero-name">{car.name}</h1>
              <p className="cd-hero-sub">{car.desc}</p>
              <div className="cd-hero-ctas">
                <button className="cd-cta-primary" onClick={handleEnquire}>
                  Book test drive
                </button>
                <button
                  className="cd-cta-ghost"
                  onClick={() => {
                    document.getElementById('cd-gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  View gallery ↓
                </button>
              </div>
            </div>
            <div className="cd-hero-right">
              <div className="cd-hero-price-label">Starting from</div>
              <div className="cd-hero-price">{car.price}</div>
              <div className="cd-hero-price-note">Before taxes and fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick stats bar ───────────────────────────── */}
      <div className="cd-stats-bar">
        {car.specs.quick.map(stat => (
          <div key={stat.k} className="cd-stat-cell">
            <div className="cd-stat-val">{stat.v}</div>
            <div className="cd-stat-key">{stat.k}</div>
          </div>
        ))}
      </div>

      {/* ── Gallery ───────────────────────────────────── */}
      <section id="cd-gallery" className="cd-gallery-section">
        <div className="cd-section-label">Gallery</div>
        <h2 className="cd-section-title">Every angle</h2>

        {/* Row 1: large left (front-34) + 2 stacked right (rear-34 + profile) */}
        <div className="cd-gallery-row1">
          <GallerySlot
            src={car.gallery[0].src}
            label={car.gallery[0].label}
            className="cd-gslot-large"
          />
          <div className="cd-gallery-stack">
            <GallerySlot src={car.gallery[1].src} label={car.gallery[1].label} />
            <GallerySlot src={car.gallery[2].src} label={car.gallery[2].label} />
          </div>
        </div>

        {/* Row 2: 3 equal (interior + detail + rear) */}
        <div className="cd-gallery-row2">
          {car.gallery.slice(3).map(shot => (
            <GallerySlot key={shot.label} src={shot.src} label={shot.label} />
          ))}
        </div>
      </section>

      {/* ── Specs ─────────────────────────────────────── */}
      <section className="cd-specs-section">
        <div className="cd-section-label">Specifications</div>
        <h2 className="cd-section-title">What it does</h2>

        <div className="cd-tabs">
          {SPEC_TABS.map(tab => (
            <button
              key={tab.id}
              className={`cd-tab${specTab === tab.id ? ' active' : ''}`}
              onClick={() => setSpecTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="cd-specs-table">
          {activeSpecs.map((row, i) => (
            <div key={row.k} className={`cd-spec-row${i % 2 === 0 ? ' even' : ''}`}>
              <div className="cd-spec-k">{row.k}</div>
              <div className="cd-spec-v">{row.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Similar models ────────────────────────────── */}
      <section className="cd-similar-section">
        <div className="cd-similar-inner">
          <div className="cd-section-label">Explore more</div>
          <h2 className="cd-section-title">You might also like</h2>
          <div className="cd-similar-grid">
            {similar.map(c => (
              <SimilarCard
                key={c.id}
                car={c}
                onSelect={next => {
                  // Replace current detail with the new car (reset scroll)
                  scrollRef.current?.scrollTo({ top: 0 })
                  onClose()
                  setTimeout(() => onEnquire(null, next), 10)
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Floating AI chat ─────────────────────────── */}
      <AskAI car={car} />

      {/* ── Bottom enquiry CTA ────────────────────────── */}
      <section className="cd-bottom-cta">
        <div className="cd-bottom-cta-inner">
          <h2 className="cd-bottom-cta-title">Ready to drive the {car.name}?</h2>
          <p className="cd-bottom-cta-sub">
            Duties cleared. Papers complete. Every vehicle inspected before delivery.
          </p>
          <button className="cd-cta-primary cd-cta-large" onClick={handleEnquire}>
            Send an enquiry
          </button>
        </div>
      </section>
    </div>
  )
}
