import { useEffect, useRef, useState } from 'react'

const R = 80
const CX = 100
const CY = 100
const STROKE = 24
const CIRCUMFERENCE = 2 * Math.PI * R

// segments: [{ pct, color, label, value }]
export default function DonutChart({ segments, centerLabel, centerSub, maxWidth = 280 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  // Build arcs from segments
  let offset = 0
  const arcs = segments.map((seg, i) => {
    const arcLen = (seg.pct / 100) * CIRCUMFERENCE
    const arc = { ...seg, dasharray: CIRCUMFERENCE, dashoffset: visible ? CIRCUMFERENCE - arcLen : CIRCUMFERENCE, strokeOffset: offset }
    offset += arcLen
    return arc
  })

  // We rotate the SVG so the first segment starts at the top (-90deg = -PI/2)
  // Each arc uses strokeDashoffset to hide/show and a rotation to position correctly
  let cumulativePct = 0
  const arcElements = segments.map((seg, i) => {
    const rotationDeg = (cumulativePct / 100) * 360 - 90
    const arcLen = (seg.pct / 100) * CIRCUMFERENCE
    cumulativePct += seg.pct
    return (
      <circle
        key={i}
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={seg.color}
        strokeWidth={STROKE}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={visible ? CIRCUMFERENCE - arcLen : CIRCUMFERENCE}
        strokeLinecap="butt"
        transform={`rotate(${rotationDeg} ${CX} ${CY})`}
        style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s` }}
      />
    )
  })

  return (
    <div ref={ref} style={{ maxWidth, margin: '1.5rem auto', textAlign: 'center' }}>
      <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: '200px', display: 'block', margin: '0 auto' }}>
        {/* Track */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--whisper)" strokeWidth={STROKE} />
        {arcElements}
        {/* Center label */}
        <text x={CX} y={CY - 6} textAnchor="middle" fontFamily="var(--serif)" fontSize="28" fill="var(--ink)">
          {centerLabel}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--slate)" letterSpacing="1">
          {centerSub}
        </text>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--slate)' }}>
              <strong style={{ color: 'var(--ink)' }}>{seg.pct}%</strong> {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
