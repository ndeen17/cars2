import { useState, useEffect, useRef } from 'react'
import { HERO_VIDEOS } from '../data/cars'

// How long the crossfade lasts — must match the CSS transition below
const FADE = 0.9

export default function Hero() {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)   // sync ref so timeUpdate handlers see current value
  const refs     = useRef([])   // video element refs
  const busy     = useRef(false) // guard against double-triggers mid-transition

  // Play first video on mount
  useEffect(() => {
    refs.current[0]?.play().catch(() => {})
  }, [])

  // Whenever active changes, preload the upcoming video so it's buffered & ready
  useEffect(() => {
    const next = (active + 1) % HERO_VIDEOS.length
    const vid  = refs.current[next]
    if (vid) { vid.preload = 'auto'; vid.load() }
  }, [active])

  function transition(to) {
    if (busy.current) return
    busy.current = true

    // Start the incoming video playing NOW — it will be audibly/visually
    // fading in from opacity 0, so the playback is already running during the fade
    const incoming = refs.current[to]
    if (incoming) {
      incoming.currentTime = 0
      incoming.play().catch(() => {})
    }

    // Swap the visible layer — CSS opacity transition handles the dissolve
    activeRef.current = to
    setActive(to)

    // Unlock after the fade fully completes
    setTimeout(() => { busy.current = false }, FADE * 1000 + 100)
  }

  // Called on every timeUpdate — fires ~4–60× per second depending on browser
  function handleTimeUpdate(i) {
    return (e) => {
      // Only the active video drives the transition trigger
      if (i !== activeRef.current || busy.current) return
      const vid = e.currentTarget
      if (!vid.duration || isNaN(vid.duration)) return

      // Begin the crossfade exactly FADE seconds before the end —
      // the outgoing video is still playing while the incoming one fades in
      if (vid.duration - vid.currentTime <= FADE) {
        transition((i + 1) % HERO_VIDEOS.length)
      }
    }
  }

  function handleDotClick(i) {
    if (i === activeRef.current) return
    transition(i)
  }

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
      {/* All videos stacked; only the active one is opaque */}
      <div style={s.mediaSlot}>
        {HERO_VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={el => { refs.current[i] = el }}
            src={src}
            muted
            playsInline
            preload={i === 0 ? 'auto' : 'none'}
            onTimeUpdate={handleTimeUpdate(i)}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload nofullscreen"
            disablePictureInPicture
            className="hero-video"
            style={{
              opacity: active === i ? 1 : 0,
              transition: `opacity ${FADE}s ease`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      <div style={s.overlay} />

      <div style={s.contentOuter}>
        <div className="hero-content hero-content-wrap" style={s.contentInner}>
          <h1 className="hero-h1">Drive Electric.<br />Drive Nigeria Forward.</h1>
          <p className="hero-lead">
            Road-ready premium EVs. Duties cleared, papers complete, every vehicle
            inspected before it reaches you.
          </p>

          <div className="hero-ctas">
            <a href="#catalog" className="btn-dark">Browse the lineup <span aria-hidden="true">→</span></a>
            <a href="#enquiry" className="btn-ghost">Book a test drive</a>
          </div>

          {HERO_VIDEOS.length > 1 && (
            <div style={s.dots}>
              {HERO_VIDEOS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Video ${i + 1}`}
                  onClick={() => handleDotClick(i)}
                  style={{
                    ...s.dot,
                    width: active === i ? 28 : 8,
                    background: active === i
                      ? 'rgba(24,24,28,0.75)'
                      : 'rgba(24,24,28,0.22)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const s = {
  mediaSlot:    { position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 },
  overlay:      { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, background: 'linear-gradient(180deg, rgba(244,243,240,0.35) 0%, rgba(244,243,240,0) 30%, rgba(244,243,240,0.15) 62%, #f4f3f0 100%)' },
  contentOuter: { position: 'relative', zIndex: 3, maxWidth: 1280, margin: '0 auto', width: '100%', marginTop: 'auto' },
  contentInner: { padding: '0 32px 72px' },
  dots:         { display: 'flex', alignItems: 'center', gap: 8, marginTop: 32 },
  dot:          { height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, transition: `width ${FADE}s ease, background ${FADE}s ease` },
}
