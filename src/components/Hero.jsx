import { useState, useEffect, useRef } from 'react'
import { HERO_VIDEOS } from '../data/cars'

export default function Hero() {
  const [active, setActive] = useState(0)
  const refs = useRef([])

  // When active index changes: reset & play new video, pause all others
  useEffect(() => {
    refs.current.forEach((vid, i) => {
      if (!vid) return
      if (i === active) {
        vid.currentTime = 0
        vid.play().catch(() => {})
      } else {
        vid.pause()
        vid.currentTime = 0
      }
    })
  }, [active])

  function advance() {
    setActive(i => (i + 1) % HERO_VIDEOS.length)
  }

  function goTo(i) {
    setActive(i)
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
      {/* stacked videos — CSS opacity crossfade between them */}
      <div style={s.mediaSlot}>
        {HERO_VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={el => { refs.current[i] = el }}
            src={src}
            muted
            playsInline
            preload={i === 0 ? 'auto' : i === 1 ? 'metadata' : 'none'}
            onEnded={advance}
            className="hero-video"
            style={{
              opacity: active === i ? 1 : 0,
              transition: 'opacity 0.9s ease',
            }}
          />
        ))}
      </div>

      {/* gradient overlay */}
      <div style={s.overlay} />

      {/* content */}
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

          {/* video indicator dots — only shown when more than one video */}
          {HERO_VIDEOS.length > 1 && (
            <div style={s.dots}>
              {HERO_VIDEOS.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Video ${i + 1}`}
                  onClick={() => goTo(i)}
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
  mediaSlot: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%', zIndex: 1,
  },
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
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'width 0.35s ease, background 0.35s ease',
  },
}
