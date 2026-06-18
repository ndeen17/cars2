import { useState } from 'react'
import { CARS } from '../data/cars'

export default function Enquiry({ selectedModel, onModelChange }) {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="enquiry" style={s.section}>
      <div className="enquiry-inner" style={s.inner}>

        {/* left copy */}
        <div>
          <div style={s.mono}>Enquiry</div>
          <h2 style={s.heading}>Ready for a closer look?</h2>
          <p style={s.sub}>
            Tell us which model caught your eye and a specialist will reach out within
            24 hours to arrange a test drive — at a showroom or your door.
          </p>
          <div style={s.assurances}>
            {ASSURANCES.map(a => (
              <div key={a} style={s.assurance}>
                <div style={s.check}>✓</div>
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* form card */}
        <div style={s.card}>
          {submitted ? (
            <div style={s.success}>
              <div style={s.successIcon}>✓</div>
              <h3 style={s.successTitle}>Enquiry received</h3>
              <p style={s.successMsg}>
                Thanks — a VANTA specialist will be in touch about the{' '}
                <strong>{selectedModel}</strong> within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={s.form}>
              <div className="form-row" style={s.row}>
                <Field label="Full name">
                  <input required type="text" placeholder="Alex Morgan" style={s.input} />
                </Field>
                <Field label="Phone">
                  <input type="tel" placeholder="(555) 012 3456" style={s.input} />
                </Field>
              </div>

              <Field label="Email">
                <input required type="email" placeholder="you@email.com" style={s.input} />
              </Field>

              <div className="form-row" style={s.row}>
                <Field label="Model of interest">
                  <select
                    value={selectedModel}
                    onChange={e => onModelChange(e.target.value)}
                    style={{ ...s.input, appearance: 'none' }}
                  >
                    {CARS.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Preferred date">
                  <input type="date" style={s.input} />
                </Field>
              </div>

              <Field label="Anything else?">
                <textarea
                  rows={3}
                  placeholder="Trade-in, financing questions, preferred showroom…"
                  style={{ ...s.input, resize: 'vertical' }}
                />
              </Field>

              <button type="submit" style={s.submit}>Request test drive</button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label style={s.field}>
      {label}
      {children}
    </label>
  )
}

const ASSURANCES = [
  'Test drives at a showroom or delivered to you',
  'Transparent, all-in pricing — no surprises',
  'Trade-in valuation in under 5 minutes',
]

const s = {
  section:      { maxWidth: 1280, margin: '0 auto', padding: '70px 32px 90px' },
  inner:        { display: 'grid', gridTemplateColumns: '0.85fr 1fr', gap: 56, alignItems: 'start' },
  mono:         { fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: 3, color: '#4a5b73', textTransform: 'uppercase', marginBottom: 16 },
  heading:      { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: -1.5, margin: '0 0 18px', lineHeight: 1.04 },
  sub:          { fontSize: 16, lineHeight: 1.6, color: '#5a5a62', margin: '0 0 32px' },
  assurances:   { display: 'flex', flexDirection: 'column', gap: 16 },
  assurance:    { display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#44444c' },
  check:        { width: 24, height: 24, borderRadius: '50%', border: '1px solid #4a5b73', color: '#4a5b73', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flex: 'none' },
  card:         { background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 36 },
  form:         { display: 'flex', flexDirection: 'column', gap: 18 },
  row:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field:        { display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#6c6c74' },
  input:        { background: '#f4f3f0', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '13px 14px', color: '#18181c', fontSize: 15, outline: 'none', width: '100%', fontFamily: 'inherit' },
  submit:       { background: '#18181c', color: '#f5f4f1', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, padding: 15, border: 'none', borderRadius: 999, cursor: 'pointer', marginTop: 4, width: '100%' },
  success:      { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 20px' },
  successIcon:  { width: 56, height: 56, borderRadius: '50%', background: '#18181c', color: '#f5f4f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 22, boxShadow: '0 10px 24px rgba(0,0,0,0.14)' },
  successTitle: { fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, margin: '0 0 10px' },
  successMsg:   { fontSize: 15, color: '#6c6c74', margin: 0, maxWidth: 300 },
}
