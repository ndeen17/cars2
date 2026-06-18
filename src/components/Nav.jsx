export default function Nav() {
  return (
    <header style={s.header}>
      <nav style={s.nav}>
        <div style={s.left}>
          <div style={s.logo}>
            <div style={s.logoMark} />
            <span style={s.logoText}>VANTA</span>
          </div>
          <div className="nav-links" style={s.links}>
            <a href="#catalog" className="nav-link" style={s.link}>Models</a>
            <a href="#catalog" className="nav-link" style={s.link}>Electric</a>
            <a href="#spotlight" className="nav-link" style={s.link}>Performance</a>
            <a href="#enquiry" className="nav-link" style={s.link}>About</a>
          </div>
        </div>
        <a href="#enquiry" className="btn-pill">Enquire</a>
      </nav>
    </header>
  )
}

const s = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    background: 'rgba(244,243,240,0.78)',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  nav: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { display: 'flex', alignItems: 'center', gap: 48 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { width: 26, height: 26, borderRadius: 7, background: '#4a5b73' },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: 19,
    letterSpacing: 2,
  },
  links: { display: 'flex', alignItems: 'center', gap: 30, fontSize: 14, fontWeight: 500 },
  link: { fontSize: 14, fontWeight: 500 },
}
