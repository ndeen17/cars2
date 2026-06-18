import MediaAsset from './MediaAsset'
import { HERO_ASSET } from '../data/cars'

export default function Hero() {
  return (
    <section
      className="hero-section"
      style={{
        backgroundColor: '#eceae5',
        backgroundImage: `
          radial-gradient(120% 100% at 72% 30%, rgba(0,0,0,0.045) 0%, rgba(236,234,229,0) 55%),
          repeating-linear-gradient(118deg, rgba(0,0,0,0.022) 0 1px, transparent 1px 22px)
        `,
      }}
    >
      {/* hero video/image */}
      <div style={s.mediaSlot}>
        <MediaAsset src={HERO_ASSET} alt="" className="hero-video" eager />
      </div>

      {/* gradient overlay */}
      <div style={s.overlay} />

      {/* content */}
      <div style={s.contentOuter}>
        <div className="hero-content hero-content-wrap" style={s.contentInner}>
          <h1 className="hero-h1">Drive Electric.
<br />Drive Nigeria Forward.</h1>
          <p className="hero-lead">
            Road-ready premium EVs. Duties cleared, papers complete, every vehicle inspected before it reaches you.
          </p>
          <div className="hero-ctas">
            <a href="#catalog" className="btn-dark">Browse the lineup <span aria-hidden="true">→</span></a>
            <a href="#enquiry" className="btn-ghost">Book a test drive</a>
          </div>
        </div>
      </div>
    </section>
  )
}

const s = {
  mediaSlot: { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 },
  overlay: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
    background: 'linear-gradient(180deg, rgba(244,243,240,0.35) 0%, rgba(244,243,240,0) 30%, rgba(244,243,240,0.15) 62%, #f4f3f0 100%)',
  },
  contentOuter: {
    position: 'relative', zIndex: 3,
    maxWidth: 1280, margin: '0 auto',
    width: '100%', marginTop: 'auto',
  },
  contentInner: {
    padding: '0 32px 72px',
  },
}
