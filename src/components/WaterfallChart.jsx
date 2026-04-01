import { useEffect, useRef, useState } from 'react'

// Budget numbers as % of total budget (₹4.39L Cr)
const COMMITTED_PCT = 47.2
const WELFARE_PCT   = 36.4
const AVAIL_PCT     = 100 - COMMITTED_PCT - WELFARE_PCT   // 16.4%

// Promise costs as % of total budget
const PROMISES = [
  { party: 'DMK',  pct: 13.0, color: 'var(--dmk)',        val: '₹57K Cr' },
  { party: 'ADMK', pct: 17.1, color: 'var(--admk)',       val: '₹75K Cr' },
  { party: 'TVK',  pct: 16.6, color: 'var(--tvk-maroon)', val: '₹73K Cr' },
]

export default function WaterfallChart() {
  const ref = useRef(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        setTimeout(() => setStep(1), 100)
        setTimeout(() => setStep(2), 900)
        setTimeout(() => setStep(3), 1700)
        setTimeout(() => setStep(4), 2500)
      },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {/* Main bar */}
      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>

        {/* Total budget label */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '.62rem',
          color: 'var(--slate)',
          marginBottom: '.5rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Total Budget ₹4.39L Cr = 100%</span>
          <span style={{ color: step >= 4 ? 'var(--teal)' : 'var(--slate)', fontWeight: step >= 4 ? 700 : 400, transition: 'color .4s' }}>
            {step >= 4 ? '⚠ Just 16.4% remains' : ''}
          </span>
        </div>

        {/* The bar track */}
        <div style={{ height: '52px', borderRadius: '8px', background: 'var(--whisper)', overflow: 'hidden', position: 'relative', display: 'flex' }}>

          {/* Step 1: Committed (slides in from left) */}
          <div style={{
            width: step >= 2 ? `${COMMITTED_PCT}%` : '0%',
            height: '100%',
            background: 'var(--rust)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {step >= 2 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: '#fff', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,.3)' }}>
                Committed {COMMITTED_PCT}%
              </span>
            )}
          </div>

          {/* Step 2: Welfare */}
          <div style={{
            width: step >= 3 ? `${WELFARE_PCT}%` : '0%',
            height: '100%',
            background: 'var(--gold)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {step >= 3 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--ink)', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(255,255,255,.5)' }}>
                Welfare {WELFARE_PCT}%
              </span>
            )}
          </div>

          {/* Step 3: Available sliver */}
          <div style={{
            flex: 1,
            height: '100%',
            background: step >= 4 ? 'var(--teal)' : 'var(--whisper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transition: 'background 0.5s',
            animation: step >= 4 ? 'sliverPulse 2s ease-in-out 0.5s infinite' : 'none',
          }}>
            {step >= 4 && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: '#fff', whiteSpace: 'nowrap', fontWeight: 700 }}>
                {AVAIL_PCT.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Labels below the bar */}
        <div style={{ display: 'flex', marginTop: '.5rem', fontSize: '.65rem', fontFamily: 'var(--mono)', color: 'var(--slate)' }}>
          <div style={{ width: `${COMMITTED_PCT}%`, opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.4s 0.5s' }}>
            Committed exp.
          </div>
          <div style={{ width: `${WELFARE_PCT}%`, opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.4s 0.5s' }}>
            Existing welfare
          </div>
          <div style={{ flex: 1, opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.4s 0.5s', color: 'var(--teal)', fontWeight: 700 }}>
            Available
          </div>
        </div>
      </div>

      {/* Promise overlays — shown after step 4 */}
      {step >= 4 && (
        <div style={{ marginTop: '.5rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--slate)', marginBottom: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            New promises vs. available space
          </div>
          {PROMISES.map((p, i) => (
            <div
              key={p.party}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                marginBottom: '.5rem',
                opacity: 0,
                animation: `fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s forwards`,
              }}
            >
              {/* Party label */}
              <div style={{ width: '40px', fontFamily: 'var(--mono)', fontSize: '.62rem', fontWeight: 700, color: p.color, textAlign: 'right', flexShrink: 0 }}>
                {p.party}
              </div>
              {/* Bar track — flex:1 full width, overflow hidden so fill clips at boundary */}
              <div style={{ position: 'relative', flex: 1, height: '18px', background: 'var(--whisper)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(p.pct, AVAIL_PCT) / AVAIL_PCT * 100}%`,
                  background: p.color,
                  borderRadius: '4px',
                  opacity: .65,
                }} />
              </div>
              {/* Value */}
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: p.color, flexShrink: 0, whiteSpace: 'nowrap', width: '56px' }}>
                {p.val}
              </div>
              {/* Overflow / no-overflow tag */}
              {p.pct > AVAIL_PCT ? (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', color: 'var(--rust)', flexShrink: 0, whiteSpace: 'nowrap', background: 'rgba(192,57,43,.08)', padding: '2px 7px', borderRadius: '20px', border: '1px solid rgba(192,57,43,.25)' }}>
                  overflows by {(p.pct - AVAIL_PCT).toFixed(1)}%
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '.55rem', color: 'var(--teal)', flexShrink: 0, whiteSpace: 'nowrap', background: 'rgba(56,178,172,.08)', padding: '2px 7px', borderRadius: '20px', border: '1px solid rgba(56,178,172,.25)' }}>
                  no overflow
                </div>
              )}
            </div>
          ))}
          <div style={{
            marginTop: '.75rem',
            fontFamily: 'var(--mono)',
            fontSize: '.62rem',
            color: 'var(--slate)',
            background: 'var(--whisper)',
            padding: '.5rem .75rem',
            borderRadius: '6px',
            borderLeft: '3px solid var(--rust)',
          }}>
            The available {AVAIL_PCT.toFixed(1)}% must also fund roads, hospitals, and capital projects — leaving effectively zero fiscal room for new promises without borrowing more.
          </div>
        </div>
      )}
    </div>
  )
}
