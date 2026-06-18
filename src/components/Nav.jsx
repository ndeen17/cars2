import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Models',      href: '#catalog'   },
  { label: 'Electric',    href: '#catalog'   },
  { label: 'Performance', href: '#spotlight' },
  { label: 'About',       href: '#enquiry'   },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header style={s.header}>
        <nav style={s.nav}>
          <a href="#" style={s.logoWrap} onClick={close}>
            <div style={s.logoMark} />
            <span style={s.logoText}>VANTA</span>
          </a>

          <div className="nav-links">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </div>

          <div style={s.right}>
            <a href="#enquiry" className="btn-pill nav-enquire" onClick={close}>Enquire</a>
            <button
              className={`hamburger${open ? ' open' : ''}`}
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span className="hb-line" />
              <span className="hb-line" />
              <span className="hb-line" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        {NAV_LINKS.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            className="mobile-nav-link"
            style={{ transitionDelay: open ? `${i * 0.055}s` : '0s' }}
            onClick={close}
          >
            <span className="mobile-nav-num">0{i + 1}</span>
            {l.label}
          </a>
        ))}
        <a
          href="#enquiry"
          className="mobile-enquire-btn"
          onClick={close}
        >
          Enquire now <span aria-hidden="true">→</span>
        </a>
      </div>
    </>
  )
}

const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    background: 'rgba(244,243,240,0.78)',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  nav: {
    maxWidth: 1280, margin: '0 auto',
    padding: '0 32px', height: 68,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { width: 26, height: 26, borderRadius: 7, background: '#4a5b73' },
  logoText: {
    fontFamily: "'Sora', sans-serif", fontWeight: 700,
    fontSize: 19, letterSpacing: 2, color: '#18181c',
  },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
}
