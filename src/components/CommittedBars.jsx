import { useEffect, useRef, useState } from 'react'

const YEARS = [
  { fy: 'FY24', label: '2023-24', value: 173000, display: '₹1.73L Cr' },
  { fy: 'FY25', label: '2024-25', value: 190000, display: '₹1.90L Cr', growth: '+9.8%' },
  { fy: 'FY26', label: '2025-26', value: 207054, display: '₹2.07L Cr', growth: '+9.0%' },
]

const MAX_VAL = 207054
const BAR_MAX_H = 160 // px

export default function CommittedBars() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2.5rem', padding: '1.5rem 1rem 0', position: 'relative' }}>
      {YEARS.map((yr, i) => {
        const barH = (yr.value / MAX_VAL) * BAR_MAX_H
        // Color transitions gold→rust as it escalates
        const colors = ['#c9a84c', '#d4692c', '#c0392b']
        const color = colors[i]

        return (
          <div key={yr.fy} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Growth arrow between bars */}
            {yr.growth && (
              <div style={{
                position: 'absolute',
                left: '-2.2rem',
                bottom: `${barH + 4}px`,
                fontFamily: 'var(--mono)',
                fontSize: '.6rem',
                color: 'var(--rust)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                ↑ {yr.growth}
              </div>
            )}

            {/* Value label above bar */}
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: '1rem',
              color,
              marginBottom: '.35rem',
              opacity: visible ? 1 : 0,
              transition: `opacity 0.4s ${0.3 + i * 0.2}s`,
            }}>
              {yr.display}
            </div>

            {/* Bar */}
            <div style={{
              width: '56px',
              height: `${BAR_MAX_H}px`,
              display: 'flex',
              alignItems: 'flex-end',
            }}>
              <div style={{
                width: '100%',
                height: visible ? `${barH}px` : '0px',
                background: `linear-gradient(to top, ${color}, ${color}cc)`,
                borderRadius: '6px 6px 0 0',
                transition: `height 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.2}s`,
              }} />
            </div>

            {/* FY label */}
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '.65rem',
              color: 'var(--slate)',
              marginTop: '.4rem',
              textAlign: 'center',
            }}>
              {yr.fy}
              <div style={{ fontSize: '.55rem', opacity: .7 }}>{yr.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
