import { FEATURED } from '../data/cars'

export default function Spotlight({ onEnquire }) {
  return (
    <section id="spotlight" style={s.section}>
      <div style={s.card}>
        <div className="spotlight-inner" style={s.inner}>

          {/* image column */}
          <div className="spotlight-img-col" style={s.imgCol}>
            <div style={s.imgOverlay} />
            <div style={s.spotLabel}>Spotlight</div>
            <div style={s.carLabel}>[ {FEATURED.name} · profile ]</div>
          </div>

          {/* details column */}
          <div style={s.details}>
            <div style={s.typeBadge}>{FEATURED.type}</div>
            <h2 style={s.name}>{FEATURED.name}</h2>
            <p style={s.desc}>{FEATURED.desc}</p>

            <div style={s.specsGrid}>
              {FEATURED.specs.map(spec => (
                <div key={spec.k} style={s.specCell}>
                  <div style={s.specVal}>{spec.v}</div>
                  <div style={s.specKey}>{spec.k}</div>
                </div>
              ))}
            </div>

            <div style={s.ctas}>
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
  inner:     { display: 'grid', gridTemplateColumns: '1.15fr 1fr', minHeight: 480 },
  imgCol:    { position: 'relative', backgroundColor: '#eeede9', backgroundImage: 'repeating-linear-gradient(125deg, rgba(0,0,0,0.03) 0 1px, transparent 1px 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(0,0,0,0.06)' },
  imgOverlay:{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 60% at 50% 50%, rgba(0,0,0,0.045) 0%, rgba(238,237,233,0) 65%)' },
  spotLabel: { position: 'absolute', left: 32, top: 32, fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3, color: '#4a5b73', textTransform: 'uppercase' },
  carLabel:  { fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 2, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', position: 'relative', zIndex: 1 },
  details:   { padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  typeBadge: { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 5, padding: '4px 10px', fontSize: 10.5, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#44444c', width: 'fit-content', marginBottom: 20 },
  name:      { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, margin: '0 0 10px' },
  desc:      { fontSize: 16, lineHeight: 1.6, color: '#5a5a62', margin: '0 0 32px', maxWidth: 420 },
  specsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 },
  specCell:  { background: '#ffffff', padding: '18px 20px' },
  specVal:   { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 },
  specKey:   { fontSize: 12, color: '#8a8a90', marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 },
  ctas:      { display: 'flex', gap: 12, flexWrap: 'wrap' },
}
