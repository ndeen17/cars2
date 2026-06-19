import { useEffect, useRef, useState } from 'react'

// ── Timing ──────────────────────────────────────────────────────────────────
const HOLD_MS  = 1600   // silent hold before zip starts
const ZIP_MS   = 1800   // puller travel duration
const LAG_MS   = 180    // fabric opens this many ms behind the puller
const SWEEP_MS = 600    // final panel sweep apart
const N        = 42     // polygon sample points along opening seam

// ── Easings ─────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }

function easeInOut(t) {
  t = clamp(t, 0, 1)
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function easeOut(t) {
  t = clamp(t, 0, 1)
  return 1 - (1 - t) ** 4
}

// ── Geometry ─────────────────────────────────────────────────────────────────
// Half-gap: how far each panel edge moves from centre at row y.
// Uses a 1.35-power taper so the gap is widest at the top and
// narrows to zero just at the puller — mimicking real fabric tension.
function halfGap(y, pullerY, W, fabricProg) {
  if (pullerY <= 0) return 0
  const t = clamp((pullerY - y) / pullerY, 0, 1)
  return (W / 2) * fabricProg * Math.pow(t, 1.35)
}

// Left panel: full-screen div clipped to show only the left dark fabric.
// As zip opens, the right edge of this panel peels leftward.
// dx > 0 during the sweep phase shifts the whole panel further left.
function leftPoly(W, H, pullerY, fp, dx) {
  const pts = [`${-dx} 0`]
  const yMax = Math.min(pullerY, H)
  for (let i = 0; i <= N; i++) {
    const y = (i / N) * yMax
    pts.push(`${W / 2 - halfGap(y, pullerY, W, fp) - dx} ${y}`)
  }
  pts.push(`${W / 2 - dx} ${H}`)
  pts.push(`${-dx} ${H}`)
  return `polygon(${pts.join(',')})`
}

// Right panel: mirror of left.
function rightPoly(W, H, pullerY, fp, dx) {
  const yMax = Math.min(pullerY, H)
  const pts = [
    `${W + dx} 0`,
    `${W + dx} ${H}`,
    `${W / 2 + dx} ${H}`,
    `${W / 2 + dx} ${yMax}`,
  ]
  for (let i = 0; i <= N; i++) {
    const y = yMax * (1 - i / N)
    pts.push(`${W / 2 + halfGap(y, pullerY, W, fp) + dx} ${y}`)
  }
  return `polygon(${pts.join(',')})`
}

// SVG path: short horizontal stitching marks along closed seam below puller
function stitchD(W, pullerY, H) {
  const cx = W / 2
  const step = 13
  const hw = 3.5
  let d = ''
  const start = Math.ceil((pullerY + step) / step) * step
  for (let y = start; y < H; y += step) {
    d += `M${cx - hw} ${y}L${cx + hw} ${y}`
  }
  return d
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ZipLoader({ onComplete }) {
  const rootRef    = useRef(null)
  const leftRef    = useRef(null)
  const rightRef   = useRef(null)
  const svgRef     = useRef(null)
  const seamRef    = useRef(null)
  const stitchRef  = useRef(null)
  const pullerRef  = useRef(null)
  const wordRef    = useRef(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // Prevent body scroll while loader is covering the page
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const left   = leftRef.current
    const right  = rightRef.current
    const svg    = svgRef.current
    const seam   = seamRef.current
    const stitch = stitchRef.current
    const puller = pullerRef.current
    const word   = wordRef.current

    let phase      = 'hold'
    let phaseStart = null
    let raf        = null

    function getSize() {
      const el = rootRef.current
      return { W: el.offsetWidth, H: el.offsetHeight }
    }

    function tick(now) {
      if (phaseStart === null) phaseStart = now
      const el = now - phaseStart
      const { W, H } = getSize()

      // ── HOLD ────────────────────────────────────────────────────────────
      if (phase === 'hold') {
        left.style.clipPath  = leftPoly(W, H, 0, 0, 0)
        right.style.clipPath = rightPoly(W, H, 0, 0, 0)
        svg.style.opacity    = '0'
        if (el >= HOLD_MS) { phase = 'zip'; phaseStart = now }
        raf = requestAnimationFrame(tick)
        return
      }

      // ── ZIP ─────────────────────────────────────────────────────────────
      if (phase === 'zip') {
        // Fabric lag: a simple time-offset on the same easing curve.
        // The puller leads; fabric follows ~180 ms behind.
        const pullerProg = easeInOut(el / ZIP_MS)
        const fabricProg = easeInOut(clamp((el - LAG_MS) / ZIP_MS, 0, 1))
        const pullerY    = pullerProg * H

        left.style.clipPath  = leftPoly(W, H, pullerY, fabricProg, 0)
        right.style.clipPath = rightPoly(W, H, pullerY, fabricProg, 0)

        // SVG fades in over the first 300 ms of zip
        svg.style.opacity = String(clamp(el / 300, 0, 1))

        // Seam: closed hairline below the puller
        seam.setAttribute('x1', W / 2)
        seam.setAttribute('y1', pullerY)
        seam.setAttribute('x2', W / 2)
        seam.setAttribute('y2', H)

        // Stitching along closed seam
        stitch.setAttribute('d', stitchD(W, pullerY, H))

        // Puller group — bottom tip sits exactly at pullerY on the seam
        puller.setAttribute('transform', `translate(${W / 2},${pullerY})`)

        // Wordmark fades out in the first third of the zip
        word.style.opacity = String(clamp(1 - (el / ZIP_MS) * 4, 0, 1))

        if (el >= ZIP_MS) { phase = 'sweep'; phaseStart = now }
        raf = requestAnimationFrame(tick)
        return
      }

      // ── SWEEP ───────────────────────────────────────────────────────────
      if (phase === 'sweep') {
        const t  = clamp(el / SWEEP_MS, 0, 1)
        const sp = easeOut(t)
        const dx = sp * W

        // Panels sweep apart; fabric is now fully open (fp=1, pullerY=H)
        left.style.clipPath  = leftPoly(W, H, H, 1, dx)
        right.style.clipPath = rightPoly(W, H, H, 1, dx)

        // Seam fades as panels spread
        svg.style.opacity = String(clamp(1 - t * 2, 0, 1))

        if (el >= SWEEP_MS) {
          setGone(true)
          onComplete?.()
          return
        }
        raf = requestAnimationFrame(tick)
        return
      }
    }

    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [onComplete])

  if (gone) return null

  return (
    <div ref={rootRef} style={s.root}>
      {/* Dark fabric panels */}
      <div ref={leftRef}  style={s.panel} />
      <div ref={rightRef} style={s.panel} />

      {/* SVG overlay: seam, stitching, puller */}
      <svg ref={svgRef} style={s.svg}>
        {/* Closed seam hairline below puller */}
        <line
          ref={seamRef}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
        {/* Stitching — zipper teeth along closed seam */}
        <path
          ref={stitchRef}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Puller — translated to puller position each frame */}
        <g ref={pullerRef}>
          {/* Pull ring at top */}
          <ellipse
            cx="0" cy="-32" rx="5" ry="4.5"
            fill="none"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="0.8"
          />
          {/* Ring-to-body connector */}
          <line
            x1="0" y1="-27.5" x2="0" y2="-23"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.8"
          />
          {/* Diamond body — bottom tip sits at y=0 (the open seam point) */}
          <polygon
            points="0,0 9,-13 0,-24 -9,-13"
            fill="#101010"
            stroke="rgba(255,255,255,0.48)"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Interior detail circle */}
          <circle
            cx="0" cy="-13" r="2.5"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.7"
          />
        </g>
      </svg>

      {/* Brand wordmark — fades in on mount, fades out as zip begins */}
      <div ref={wordRef} style={s.wordmark}>
        <div style={s.brand}>VANTA</div>
        <div style={s.divider} />
      </div>
    </div>
  )
}

const s = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflow: 'hidden',
  },
  panel: {
    position: 'absolute',
    inset: 0,
    background: '#0c0c0c',
    willChange: 'clip-path',
  },
  svg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
  },
  wordmark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    pointerEvents: 'none',
    animation: 'wm-fade-in 1.1s cubic-bezier(0.16,1,0.3,1) 0.35s both',
  },
  brand: {
    fontFamily: "'Manrope', system-ui, sans-serif",
    fontWeight: 400,
    fontSize: 'clamp(15px, 2.2vw, 24px)',
    letterSpacing: '0.42em',
    paddingLeft: '0.42em',  // compensate trailing letter-spacing for optical centre
    color: '#fff',
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  divider: {
    width: 36,
    height: '0.5px',
    background: 'rgba(255,255,255,0.22)',
    margin: '16px auto 0',
  },
}
