import { useEffect, useRef } from 'react'

const VIDEO_EXT = /\.(mp4|webm|mov|ogg)$/i

export default function MediaAsset({ src, alt = '', style = {}, className = '', eager = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (eager) {
      el.play().catch(() => {})
      return
    }

    // Play when ≥20% visible, pause otherwise — saves battery on mobile
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eager, src])

  if (VIDEO_EXT.test(src)) {
    return (
      <video
        ref={ref}
        src={src}
        loop
        muted
        playsInline
        preload={eager ? 'auto' : 'none'}
        style={style}
        className={className}
      />
    )
  }

  return <img src={src} alt={alt} style={style} className={className} loading="lazy" />
}
