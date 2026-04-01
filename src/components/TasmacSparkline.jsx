import { useEffect, useRef, useState } from 'react'

const DATA = [
  { year: '19-20', value: 33133 },
  { year: '20-21', value: 33811 },
  { year: '21-22', value: 36051 },
  { year: '22-23', value: 44121 },
  { year: '23-24', value: 45856 },
  { year: '24-25', value: 48344 },
]

const PAD = { top: 40, right: 20, bottom: 32, left: 16 }
const W = 600
const H = 180

function scaleX(i, total, w) {
  return PAD.left + (i / (total - 1)) * (w - PAD.left - PAD.right)
}

function scaleY(v, min, max, h) {
  const range = max - min
  const ratio = (v - min) / range
  return (h - PAD.bottom) - ratio * (h - PAD.top - PAD.bottom)
}

export default function TasmacSparkline() {
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

  const minVal = Math.min(...DATA.map(d => d.value)) * 0.92
  const maxVal = Math.max(...DATA.map(d => d.value)) * 1.04

  const pts = DATA.map((d, i) => ({
    x: scaleX(i, DATA.length, W),
    y: scaleY(d.value, minVal, maxVal, H),
    ...d,
  }))

  // SVG path for the line
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Area path (line + close to bottom)
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`

  // Animate line using stroke-dasharray trick
  // We compute total path length approximately
  let pathLen = 0
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x
    const dy = pts[i].y - pts[i - 1].y
    pathLen += Math.sqrt(dx * dx + dy * dy)
  }

  return (
    <div ref={ref} style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', minWidth: '300px' }}
        aria-label="TASMAC revenue sparkline"
      >
        <defs>
          <linearGradient id="tasmac-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.02" />
          </linearGradient>
          <clipPath id="tasmac-clip">
            <rect
              x={pts[0].x}
              y={PAD.top - 10}
              width={visible ? W : 0}
              height={H}
              style={{ transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }}
            />
          </clipPath>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#tasmac-area-fill)" clipPath="url(#tasmac-clip)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath="url(#tasmac-clip)"
        />

        {/* Dots + value labels */}
        {pts.map((p, i) => (
          <g key={p.year} style={{ opacity: visible ? 1 : 0, transition: `opacity 0.3s ${0.9 + i * 0.07}s` }}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--gold)" stroke="var(--cream)" strokeWidth="2" />
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fontFamily="var(--mono)"
              fontSize="9.5"
              fill="var(--ink)"
            >
              ₹{(p.value / 1000).toFixed(0)}K
            </text>
          </g>
        ))}

        {/* X-axis year labels */}
        {pts.map(p => (
          <text
            key={p.year + '-lbl'}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fontFamily="var(--mono)"
            fontSize="9"
            fill="var(--slate)"
          >
            {p.year}
          </text>
        ))}

        {/* Special annotation on last segment: growth moderating */}
        {visible && (
          <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s 1.6s' }}>
            <line
              x1={pts[4].x + (pts[5].x - pts[4].x) * 0.5}
              y1={(pts[4].y + pts[5].y) / 2 - 18}
              x2={pts[4].x + (pts[5].x - pts[4].x) * 0.5}
              y2={(pts[4].y + pts[5].y) / 2 - 4}
              stroke="var(--slate)"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text
              x={pts[4].x + (pts[5].x - pts[4].x) * 0.5}
              y={(pts[4].y + pts[5].y) / 2 - 22}
              textAnchor="middle"
              fontFamily="var(--mono)"
              fontSize="8.5"
              fill="var(--slate)"
            >
              growth moderating
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
