import { useState } from 'react'

export default function Footer() {
  const [email, setEmail]       = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe() {
    if (email) setSubscribed(true)
  }

  return (
    <footer style={s.footer}>
      <div className="footer-inner" style={s.inner}>

        {/* brand */}
        <div>
          <div style={s.logo}>
            <div style={s.logoMark} />
            <span style={s.logoText}>VANTA</span>
          </div>
          <p style={s.tagline}>
            Modern motoring. Browse, compare and enquire across every marque worth driving.
          </p>
        </div>

        {/* models */}
        <div>
          <h4 style={s.colHead}>Models</h4>
          <div style={s.links}>
            {['Electric', 'Hybrid', 'Performance', 'SUV'].map(l => (
              <a key={l} href="#catalog" className="footer-link" style={s.link}>{l}</a>
            ))}
          </div>
        </div>

        {/* company */}
        <div>
          <h4 style={s.colHead}>Company</h4>
          <div style={s.links}>
            {['About', 'Showrooms', 'Careers', 'Press'].map(l => (
              <span key={l} className="footer-link" style={s.link}>{l}</span>
            ))}
          </div>
        </div>

        {/* newsletter */}
        <div>
          <h4 style={s.colHead}>Stay in the loop</h4>
          <div style={s.newsletter}>
            {subscribed ? (
              <span style={s.subscribed}>Subscribed ✓</span>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={s.nlInput}
                />
                <button onClick={handleSubscribe} style={s.nlBtn}>Subscribe</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={s.bottom}>
        <span>© 2026 VANTA Motors. All rights reserved.</span>
        <div style={s.legal}>
          {['Privacy', 'Terms', 'Cookies'].map(l => (
            <span key={l} className="footer-link" style={{ cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}

const s = {
  footer:     { borderTop: '1px solid rgba(0,0,0,0.08)', background: '#eceae5' },
  inner:      { maxWidth: 1280, margin: '0 auto', padding: '56px 32px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1.3fr', gap: 40 },
  logo:       { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoMark:   { width: 20, height: 20, borderRadius: 6, background: '#4a5b73' },
  logoText:   { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 2 },
  tagline:    { fontSize: 14, lineHeight: 1.6, color: '#6c6c74', maxWidth: 260, margin: 0 },
  colHead:    { fontSize: 13, fontWeight: 700, color: '#18181c', margin: '0 0 14px' },
  links:      { display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#6c6c74' },
  link:       { color: '#6c6c74' },
  newsletter: { display: 'flex', gap: 8 },
  nlInput:    { flex: 1, background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 999, padding: '11px 16px', color: '#18181c', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  nlBtn:      { background: '#18181c', color: '#f5f4f1', fontWeight: 600, fontSize: 14, padding: '11px 18px', border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit' },
  subscribed: { fontSize: 14, color: '#4a5b73', fontWeight: 600, display: 'flex', alignItems: 'center' },
  bottom:     { maxWidth: 1280, margin: '0 auto', padding: '20px 32px 40px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#9a9aa0' },
  legal:      { display: 'flex', gap: 22 },
}
