import { useEffect, useRef, useState } from 'react'

const TOTAL = 160000 // ₹1.60L Cr baseline for proportions

const SEGMENTS = [
  { label: 'TANGEDCO',      value: 30434, color: '#c0392b',      textColor: '#fff' },
  { label: 'Magalir Urimai',value: 13807, color: 'var(--dmk)',   textColor: '#fff' },
  { label: 'Food (PDS)',    value: 12500, color: 'var(--gold)',   textColor: 'var(--ink)' },
  { label: 'Transport',     value:  9682, color: 'var(--teal)',   textColor: '#fff' },
  { label: 'Housing',       value:  3500, color: 'var(--admk)',   textColor: '#fff' },
  { label: 'Education',     value:  1696, color: 'var(--slate)',  textColor: '#fff' },
  { label: 'Health',        value:  1461, color: '#7768AE',       textColor: '#fff' },
]

export default function StackedWelfare() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {/* Stacked bar */}
      <div style={{ position: 'relative', height: '56px', borderRadius: '8px', overflow: 'visible', display: 'flex', marginBottom: '1rem' }}>
        {SEGMENTS.map((seg, i) => {
          const pct = (seg.value / TOTAL) * 100
          const isWide = pct > 11
          return (
            <div
              key={seg.label}
              style={{
                width: visible ? `${pct}%` : '0%',
                height: '100%',
                background: seg.color,
                borderRadius: i === 0 ? '8px 0 0 8px' : i === SEGMENTS.length - 1 ? '0 8px 8px 0' : '0',
                transition: `width 1.1s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setTooltip({ seg, x: rect.left + rect.width / 2, y: rect.top - 8 })
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {isWide && (
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '.58rem',
                  fontWeight: 700,
                  color: seg.textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 4px',
                  textShadow: '0 1px 2px rgba(0,0,0,.3)',
                }}>
                  {seg.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x,
          top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: 'var(--ink)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'var(--mono)',
          fontSize: '.65rem',
          pointerEvents: 'none',
          zIndex: 200,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,.2)',
        }}>
          <strong>{tooltip.seg.label}</strong><br />
          ₹{tooltip.seg.value.toLocaleString()} Cr · {((tooltip.seg.value / TOTAL) * 100).toFixed(1)}% of welfare spend
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem .9rem', marginTop: '.5rem' }}>
        {SEGMENTS.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.72rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--slate)' }}>
              {seg.label} <strong style={{ color: 'var(--ink)' }}>₹{(seg.value / 1000).toFixed(0)}K</strong>
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ marginTop: '1rem', paddingTop: '.75rem', borderTop: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem' }}>Total existing welfare</span>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--rust)' }}>~₹1.60 lakh Cr = 36% of total expenditure</span>
      </div>
    </div>
  )
}
