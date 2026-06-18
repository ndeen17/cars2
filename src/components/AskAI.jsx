import { useState, useEffect, useRef } from 'react'

// Build a context-aware response from the car's real spec data
function generateResponse(input, car) {
  const q = input.toLowerCase()

  if (q.match(/range|battery|how far|miles|km|far can/)) {
    const range = car.specs.quick.find(s => s.k.toLowerCase().includes('range'))
    const batt  = car.specs.energy.find(s => s.k.toLowerCase().includes('battery'))
    return `The ${car.name} achieves ${range?.v ?? 'an impressive range'}${batt ? ` from its ${batt.v} battery` : ''}. Real-world range varies with speed, climate and driving style, but it's more than enough for most journeys.`
  }

  if (q.match(/charg|plug|kw|minute|fast charge|connector|port/)) {
    const dc = car.specs.energy.find(s => s.k.toLowerCase().includes('dc') || s.k.toLowerCase().includes('fast'))
    const ac = car.specs.energy.find(s => s.k.toLowerCase().includes('ac'))
    if (dc) return `The ${car.name} supports ${dc.v}${ac ? `, plus ${ac.v} for home or destination charging` : ''}. You can top up significantly during a short break.`
    const fuel = car.specs.energy.find(s => s.k.toLowerCase().includes('fuel') || s.k.toLowerCase().includes('tank'))
    return fuel
      ? `The ${car.name} runs on ${fuel.v}. Tank capacity and range information is listed in the specifications above.`
      : `Let me know if you'd like specific charging details for the ${car.name} — or book a test drive and we'll walk you through it in person.`
  }

  if (q.match(/0.60|zero.sixty|quick|fast|speed|acceleration|0-60|naught/)) {
    const accel = car.specs.quick.find(s => s.k.includes('0'))
    const top   = car.specs.quick.find(s => s.k.toLowerCase().includes('speed') || s.k.toLowerCase().includes('top'))
    return `The ${car.name} goes from 0–60 mph in ${accel?.v ?? 'a blistering time'}${top ? ` and reaches a top speed of ${top.v}` : ''}. The acceleration is felt immediately — it's genuinely impressive.`
  }

  if (q.match(/power|hp|horsepower|torque|engine|motor|drivetrain|drive/)) {
    const pwr    = car.specs.performance.find(s => s.k.toLowerCase().includes('power'))
    const torque = car.specs.performance.find(s => s.k.toLowerCase().includes('torque'))
    const drive  = car.specs.performance.find(s => s.k.toLowerCase().includes('drive'))
    return `The ${car.name} outputs ${pwr?.v ?? ''}${torque ? `, with ${torque.v} of torque` : ''}${drive ? `. Drive system: ${drive.v}` : ''}. It's built for confident performance in every situation.`
  }

  if (q.match(/price|cost|how much|afford|finance|payment|buy/)) {
    return `The ${car.name} starts from ${car.price} before taxes and fees. We offer financing options tailored to your situation — just send an enquiry below and our team will put together a personalised plan.`
  }

  if (q.match(/seat|passenger|people|family|kids|space|boot|cargo|trunk|bag|luggage/)) {
    const boot = car.specs.dimensions.find(s => s.k.toLowerCase().includes('boot') || s.k.toLowerCase().includes('cargo') || s.k.toLowerCase().includes('trunk'))
    return `The ${car.name} seats ${car.seats}${boot ? ` with ${boot.v} of cargo space` : ''}. ${car.seats >= 6 ? 'There\'s space for the whole family.' : car.seats <= 2 ? 'A focused, driver-first cabin.' : 'Comfortable for everyday use.'}`
  }

  if (q.match(/size|dimension|length|width|height|weight|big|small|how large/)) {
    const l = car.specs.dimensions.find(s => s.k === 'Length')
    const w = car.specs.dimensions.find(s => s.k === 'Width')
    const wt = car.specs.dimensions.find(s => s.k.toLowerCase().includes('weight'))
    return `${car.name} dimensions — Length: ${l?.v ?? 'N/A'}, Width: ${w?.v ?? 'N/A'}${wt ? `, Kerb weight: ${wt.v}` : ''}. It's a well-proportioned vehicle that's easy to live with daily.`
  }

  if (q.match(/test drive|visit|showroom|see|view|book|available|when|delivery|lead time/)) {
    return `We'd love to arrange a test drive of the ${car.name} for you. Fill out the enquiry form below — our team will reach out within 24 hours to get everything confirmed.`
  }

  if (q.match(/colour|color|finish|paint|spec|trim|option|configure|variant/)) {
    return `The ${car.name} is available in a curated selection of premium finishes. Use the enquiry form below and our specialist will walk you through every available option for your region.`
  }

  if (q.match(/warrant|service|maintain|repair|support|after.sale/)) {
    return `Every VANTA vehicle arrives fully inspected — duties cleared, papers complete. We offer comprehensive warranty and service packages. Your specialist can detail the coverage in full.`
  }

  if (q.match(/duty|customs|clearance|import|tax|document|paper/)) {
    return `All VANTA vehicles have duties fully cleared and documentation complete before they reach you. No hidden surprises — what you see is what you get.`
  }

  if (q.match(/compare|vs |versus|better|difference|between|or the/)) {
    const highlights = car.specs.quick.map(s => `${s.v} ${s.k}`).join(', ')
    return `The ${car.name} stands out with ${highlights}. Tell me which model you're comparing it to and I can highlight the key differences.`
  }

  return `The ${car.name} is a ${car.type} ${car.body} starting from ${car.price}. Is there something specific I can help with — range, performance, charging, pricing, or arranging a test drive?`
}

export default function AskAI({ car }) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const msgsRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulated thinking delay (feels natural, not instant)
    await new Promise(r => setTimeout(r, 700 + Math.random() * 700))

    const reply = generateResponse(text, car)
    setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="ai-widget">
      {/* Chat panel */}
      {open && (
        <div className="ai-panel">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-icon">✦</div>
              <div>
                <div className="ai-title">VANTA AI</div>
                <div className="ai-subtitle">Ask me anything about the {car.name}</div>
              </div>
            </div>
            <button className="ai-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {/* Messages */}
          <div className="ai-messages" ref={msgsRef}>
            {/* Greeting */}
            <div className="ai-msg ai-msg--ai">
              <div className="ai-avatar">✦</div>
              <div className="ai-bubble ai-bubble--ai">
                Hi! I'm your {car.name} specialist. Ask me about range, performance,
                charging — or anything else you need to know.
              </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role === 'user' ? 'ai-msg--user' : 'ai-msg--ai'}`}>
                {m.role === 'assistant' && <div className="ai-avatar">✦</div>}
                <div className={`ai-bubble ${m.role === 'user' ? 'ai-bubble--user' : 'ai-bubble--ai'}`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-avatar">✦</div>
                <div className="ai-bubble ai-bubble--ai ai-bubble--typing">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="ai-input-row">
            <input
              ref={inputRef}
              className="ai-input"
              type="text"
              placeholder="Ask about range, specs, charging…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="ai-send"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Floating trigger */}
      <button className="ai-trigger" onClick={() => setOpen(o => !o)}>
        <span className="ai-trigger-icon">✦</span>
        Ask the AI
      </button>
    </div>
  )
}
