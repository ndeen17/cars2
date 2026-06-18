import { Suspense } from 'react'
import { FEATURED } from '../data/cars'
import CarViewer3D from './CarViewer3D'

export default function Spotlight({ onEnquire }) {
  return (
    <section id="spotlight" className="spotlight-section-pad" style={s.section}>
      <div style={s.card}>
        <div className="spotlight-inner">

          {/* 3D viewer column */}
          <div className="spotlight-img-col" style={s.viewerCol}>
            <div style={s.spotLabel}>Spotlight · 3D</div>
            <div style={s.hint}>Drag to rotate</div>
            <Suspense fallback={<div style={s.fallback}>Loading…</div>}>
              <CarViewer3D />
            </Suspense>
          </div>

          {/* details column */}
          <div className="spotlight-details-pad" style={s.details}>
            <div style={s.typeBadge}>{FEATURED.type}</div>
            <h2 className="spotlight-name" style={s.name}>{FEATURED.name}</h2>
            <p style={s.desc}>{FEATURED.desc}</p>

            <div style={s.specsGrid}>
              {FEATURED.specs.map(spec => (
                <div key={spec.k} style={s.specCell}>
                  <div style={s.specVal}>{spec.v}</div>
                  <div style={s.specKey}>{spec.k}</div>
                </div>
              ))}
            </div>

            <div className="spotlight-ctas" style={s.ctas}>
              <button className="btn-dark" onClick={() => onEnquire(FEATURED.name)}>
                Enquire about {FEATURED.name}
              </button>
              <button className="btn-ghost">Configure</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

const s = {
  section:   { maxWidth: 1280, margin: '0 auto', padding: '70px 32px' },
  card:      { background: 'linear-gradient(160deg, #ffffff 0%, #f5f4f1 100%)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, overflow: 'hidden' },
  viewerCol: {
    position: 'relative',
    backgroundColor: '#eeede9',
    backgroundImage: 'repeating-linear-gradient(125deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 20px)',
    borderRight: '1px solid rgba(0,0,0,0.06)',
    minHeight: 480,
    overflow: 'hidden',
  },
  spotLabel: {
    position: 'absolute', left: 32, top: 32, zIndex: 4,
    fontFamily: "'Space Mono', monospace", fontSize: 12,
    letterSpacing: 3, color: '#4a5b73', textTransform: 'uppercase',
  },
  hint: {
    position: 'absolute', right: 20, bottom: 20, zIndex: 4,
    fontFamily: "'Space Mono', monospace", fontSize: 10,
    letterSpacing: 2, color: 'rgba(0,0,0,0.28)', textTransform: 'uppercase',
  },
  fallback: {
    position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Space Mono', monospace", fontSize: 12,
    color: '#9a9aa0', letterSpacing: 2, textTransform: 'uppercase',
  },
  details:   { padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  typeBadge: { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 5, padding: '4px 10px', fontSize: 10.5, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#44444c', width: 'fit-content', marginBottom: 20 },
  name:      { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, margin: '0 0 10px' },
  desc:      { fontSize: 16, lineHeight: 1.6, color: '#5a5a62', margin: '0 0 32px', maxWidth: 420 },
  specsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 },
  specCell:  { background: '#ffffff', padding: '18px 20px' },
  specVal:   { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 },
  specKey:   { fontSize: 12, color: '#8a8a90', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 },
  ctas:      { display: 'flex', gap: 12 },
}
