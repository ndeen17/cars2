import { useState } from 'react'
import { signIn } from '../lib/auth'
import { USERS, ROLES, DEMO_PASSWORD } from '../data/users'

// Full-screen, standalone sign-in — deliberately unlike the public site.
export default function SignIn() {
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [error, setError]   = useState('')
  const [busy, setBusy]     = useState(false)

  function attempt(e, p) {
    setError('')
    setBusy(true)
    // short delay so the flow feels like a real round-trip
    setTimeout(() => {
      const r = signIn(e, p)
      if (r.error) { setError(r.error); setBusy(false) }
    }, 500)
  }

  return (
    <div className="erp erp-login">
      <section className="erp-login-art">
        <div className="erp-brand"><i /> VANTA <span>OPS</span></div>
        <div>
          <h2>Run the showroom,<br />the yard and the pipeline.</h2>
          <p>EV inventory, battery health, customs clearance and customer leads — one console for the whole dealership.</p>
        </div>
        <a className="erp-back" href="#">← Back to website</a>
      </section>

      <section className="erp-login-panel">
        <div className="erp-login-box">
          <h1>Staff sign in</h1>
          <form onSubmit={e => { e.preventDefault(); attempt(email, password) }}>
            <label>Work email
              <input className="erp-input" type="email" required autoComplete="username" placeholder="you@vanta.demo" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>Password
              <input className="erp-input" type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPass(e.target.value)} />
            </label>
            {error && <div className="erp-error" role="alert">{error}</div>}
            <button className="erp-btn primary erp-wide" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>

          <div className="erp-divider"><span>or continue as a demo role</span></div>
          <div className="erp-roles">
            {USERS.map(u => (
              <button key={u.id} disabled={busy} onClick={() => { setEmail(u.email); setPass(DEMO_PASSWORD); attempt(u.email, DEMO_PASSWORD) }}>
                <strong>{ROLES[u.role].label}</strong>
                <span>{u.name}</span>
                <small>{ROLES[u.role].blurb}</small>
              </button>
            ))}
          </div>
          <p className="erp-fine">Demo only. Accounts share the password <code>{DEMO_PASSWORD}</code>; this is not real authentication.</p>
        </div>
      </section>
    </div>
  )
}
