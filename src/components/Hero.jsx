import MediaAsset from './MediaAsset'
import { HERO_ASSET } from '../data/cars'

export default function Hero() {
  return (
    <section style={s.section}>
      {/* hero media */}
      <div style={s.mediaSlot}>
        <MediaAsset src={HERO_ASSET} alt="Hero" style={s.mediaFill} />
      </div>

      {/* gradient overlay */}
      <div style={s.overlay} />

      {/* content */}
      <div className="hero-content" style={s.content}>
        <h1 style={s.h1}>Find the one you'll<br />actually want to drive.</h1>
        <p style={s.lead}>
          Browse, compare, and enquire across electric, hybrid, and performance
          models — every modern marque, in one place.
        </p>
        <div className="hero-ctas" style={s.ctas}>
          <a href="#catalog" className="btn-dark">Browse the lineup <span aria-hidden="true">→</span></a>
          <a href="#enquiry" className="btn-ghost">Book a test drive</a>
        </div>
      </div>
    </section>
  )
}

const s = {
  section: {
    position: 'relative',
    minHeight: 660,
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#eceae5',
    backgroundImage: `
      radial-gradient(120% 100% at 72% 30%, rgba(0,0,0,0.045) 0%, rgba(236,234,229,0) 55%),
      repeating-linear-gradient(118deg, rgba(0,0,0,0.022) 0 1px, transparent 1px 22px)
    `,
  },
  mediaSlot: { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 },
  mediaFill: { width: '100%', height: '100%', objectFit: 'cover' },
  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
    background: 'linear-gradient(180deg, rgba(244,243,240,0.4) 0%, rgba(244,243,240,0) 32%, rgba(244,243,240,0.2) 64%, #f4f3f0 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 3,
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px 72px',
    width: '100%',
  },
  h1: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: 68,
    lineHeight: 0.98,
    letterSpacing: -2,
    margin: '0 0 22px',
    maxWidth: 760,
  },
  lead: {
    fontSize: 18,
    lineHeight: 1.55,
    color: '#5a5a62',
    maxWidth: 520,
    margin: '0 0 34px',
  },
  ctas: { display: 'flex', gap: 14, alignItems: 'center' },
}
