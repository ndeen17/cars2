import { useState, useEffect, useRef } from 'react'
import { customerReply, staffReply } from '../lib/concierge'
import { generateResponse } from '../lib/carQa'
import { addLead } from '../lib/store'
import { CARS } from '../data/cars'
import { ROLES } from '../data/users'

const COPY = {
  customer: {
    title: 'VANTA Concierge',
    trigger: 'Ask the Concierge',
    placeholder: 'Find a car, chargers, savings…',
    greeting: car => car
      ? `Hi! I'm your concierge. Ask me about the ${car.name}, nearby charging, fuel savings, or book a test drive.`
      : "Hi! I'm your VANTA concierge. I can match you with a car, find charging stations, estimate your fuel savings in ₦, or book a test drive.",
    chips: [
      { label: 'Find me an EV', ask: 'Recommend an electric car under $60k' },
      { label: 'Charging near Lekki', ask: 'Where can I charge near Lekki?' },
      { label: 'Fuel savings', ask: 'How much will I save on fuel per week?' },
      { label: 'Book a test drive', ask: 'I want to book a test drive' },
    ],
  },
  staff: {
    title: 'Ops Assistant',
    trigger: 'Ops Assistant',
    placeholder: 'Ask about stock, leads, customs…',
    greeting: () => "Hi — I can read live inventory and the lead pipeline. Try a summary, ageing stock or follow-ups.",
    chips: [
      { label: 'Daily summary', ask: 'Give me a daily summary' },
      { label: 'Ageing stock', ask: 'Which stock is ageing?' },
      { label: 'Customs status', ask: 'What is stuck in customs?' },
      { label: 'Follow-ups', ask: 'Which leads should I follow up with?' },
    ],
  },
}

export default function Concierge({ mode = 'customer', car = null, roleKey }) {
  const copy = mode === 'staff' && !ROLES[roleKey]?.tabs.includes('Leads')
    ? { ...COPY.staff, chips: COPY.staff.chips.filter(c => c.label !== 'Follow-ups') }
    : COPY[mode]
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [flow, setFlow]         = useState(null) // booking: { step, model, name }
  const msgsRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  const say = (role, content, chips) => setMessages(p => [...p, { role, content, chips }])

  function startBooking(model) {
    const m = model || car?.name
    if (m) {
      setFlow({ step: 'name', model: m })
      say('assistant', `Great choice — let's book a test drive of the ${m}. What's your full name?`)
    } else {
      setFlow({ step: 'model' })
      say('assistant', 'Which model would you like to test drive?', CARS.slice(0, 4).map(c => ({ label: c.name, book: c.name })))
    }
  }

  function continueBooking(text) {
    if (flow.step === 'model') {
      const m = CARS.find(c => text.toLowerCase().includes(c.name.toLowerCase()))
      if (!m) return say('assistant', "I didn't catch the model — tell me one of: " + CARS.map(c => c.name).join(', ') + '.')
      setFlow({ step: 'name', model: m.name })
      return say('assistant', `Lovely — the ${m.name}. What's your full name?`)
    }
    if (flow.step === 'name') {
      setFlow({ ...flow, step: 'phone', name: text })
      return say('assistant', `Thanks ${text.split(' ')[0]}. What's the best phone number to reach you on?`)
    }
    if (flow.step === 'phone') {
      addLead({ name: flow.name, phone: text, email: '', model: flow.model, source: 'AI Concierge', note: 'Booked via concierge chat.' })
      say('assistant', `Done — a specialist will call you on ${text} within 24 hours to confirm your ${flow.model} test drive. It's also now in our team's pipeline.`)
      setFlow(null)
    }
  }

  async function send(raw) {
    const text = (raw ?? input).trim()
    if (!text || loading) return
    say('user', text)
    setInput('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
    setLoading(false)

    if (flow) return continueBooking(text)

    const r = mode === 'staff'
      ? staffReply(text, roleKey)
      : customerReply(text, { car, fallback: generateResponse })

    if (r.text === '__START_BOOKING__') return startBooking()
    say('assistant', r.text, r.chips)
  }

  function onChip(chip) {
    if (chip.href) { window.location.hash = chip.href; setOpen(false) }
    else if (chip.book) { say('user', chip.label); startBooking(chip.book) }
    else if (chip.ask) send(chip.ask)
  }

  const Chips = ({ items }) => (
    <div className="ai-chips">
      {items.map(c => (
        <button key={c.label} className="ai-chip" onClick={() => onChip(c)}>{c.label}</button>
      ))}
    </div>
  )

  return (
    <div className="ai-widget">
      {open && (
        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-icon">✦</div>
              <div>
                <div className="ai-title">{copy.title}</div>
                <div className="ai-subtitle">{mode === 'staff' ? 'Reads live ERP data' : car ? `Viewing the ${car.name}` : 'Cars · Charging · Savings'}</div>
              </div>
            </div>
            <button className="ai-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="ai-messages" ref={msgsRef}>
            <div className="ai-msg ai-msg--ai">
              <div className="ai-avatar">✦</div>
              <div className="ai-bubble ai-bubble--ai">{copy.greeting(car)}</div>
            </div>
            {messages.length === 0 && <Chips items={copy.chips} />}

            {messages.map((m, i) => (
              <div key={i}>
                <div className={`ai-msg ${m.role === 'user' ? 'ai-msg--user' : 'ai-msg--ai'}`}>
                  {m.role === 'assistant' && <div className="ai-avatar">✦</div>}
                  <div className={`ai-bubble ${m.role === 'user' ? 'ai-bubble--user' : 'ai-bubble--ai'}`} style={{ whiteSpace: 'pre-line' }}>
                    {m.content}
                  </div>
                </div>
                {m.chips && i === messages.length - 1 && <Chips items={m.chips} />}
              </div>
            ))}

            {loading && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-avatar">✦</div>
                <div className="ai-bubble ai-bubble--ai ai-bubble--typing">
                  <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                </div>
              </div>
            )}
          </div>

          <div className="ai-input-row">
            <input
              ref={inputRef}
              className="ai-input"
              type="text"
              placeholder={flow ? 'Type your answer…' : copy.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              disabled={loading}
            />
            <button className="ai-send" onClick={() => send()} disabled={!input.trim() || loading}>
              {loading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <button className="ai-trigger" onClick={() => setOpen(o => !o)}>
        <span className="ai-trigger-icon">✦</span>
        {copy.trigger}
      </button>
    </div>
  )
}
