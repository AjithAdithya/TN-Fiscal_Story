import { useState, useEffect, useRef } from 'react'

const META = {
  dmk:       { name: 'SPA — DMK',    short: 'SPA',      icon: '⚡', sub: 'M.K. Stalin · Secular Progressive Alliance', color: 'var(--dmk)' },
  admk:      { name: 'NDA — AIADMK', short: 'NDA',      icon: '🌿', sub: 'E.K. Palaniswami · National Democratic Alliance', color: 'var(--admk)' },
  tvk:       { name: 'TVK — Vijay',  short: 'TVK',      icon: '🎵', sub: 'Tamilaga Vettri Kazhagam · Solo in all 234 seats', color: 'var(--tvk-maroon)' },
  undecided: { name: 'Undecided',    short: 'Undecided', icon: '🤔', sub: 'Watching and waiting', color: 'var(--slate)' },
}

const ORDER = ['dmk', 'admk', 'tvk', 'undecided']

function total(counts) {
  return Object.values(counts).reduce((a, b) => a + b, 0)
}

function pct(counts, party) {
  const t = total(counts)
  if (!t) return 0
  return Math.round((counts[party] ?? 0) / t * 100)
}

export default function Poll() {
  const [voted, setVoted]       = useState(null)       // party key or null
  const [counts, setCounts]     = useState(null)       // { dmk, admk, tvk, undecided }
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiDown, setApiDown]   = useState(false)
  const fillRefs = useRef({})

  // On mount: load prior vote + fetch current counts
  useEffect(() => {
    const prior = localStorage.getItem('tn26-poll')
    if (prior) setVoted(prior)
    fetchCounts()
  }, [])

  // Animate bars whenever counts change and user has voted
  useEffect(() => {
    if (!counts || !voted) return
    ORDER.forEach(p => {
      const el = fillRefs.current[p]
      if (el) {
        el.style.width = '0%'
        setTimeout(() => { el.style.width = pct(counts, p) + '%' }, 80)
      }
    })
  }, [counts, voted])

  async function fetchCounts() {
    try {
      const res = await fetch('/api/poll')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCounts(data)
    } catch {
      setApiDown(true)
    } finally {
      setLoading(false)
    }
  }

  async function castVote(party) {
    if (voted || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCounts(data)
      setVoted(party)
      localStorage.setItem('tn26-poll', party)
    } catch {
      setApiDown(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <p style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--mono)', fontSize: '.75rem', color: 'var(--slate)' }}>
        Loading poll…
      </p>
    )
  }

  if (voted && counts) {
    const t = total(counts)
    return (
      <div>
        {ORDER.map(p => {
          const m = META[p]
          const pc = pct(counts, p)
          const ismine = p === voted
          return (
            <div key={p} className="poll-result-row">
              <div className="poll-result-lbl" style={{ color: m.color }}>
                {m.short}{ismine ? ' ✓' : ''}
              </div>
              <div className="poll-result-track">
                <div
                  className="poll-result-fill"
                  ref={el => { fillRefs.current[p] = el }}
                  style={{ background: m.color, width: '0%' }}
                />
              </div>
              <div className="poll-result-pct">{pc}%</div>
            </div>
          )
        })}
        <div className="poll-vote-tag">
          Thanks for voting · {t.toLocaleString()} response{t !== 1 ? 's' : ''}
        </div>
      </div>
    )
  }

  return (
    <div id="pollVote">
      {apiDown && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '.65rem', color: 'var(--rust)', textAlign: 'center', marginBottom: '1rem' }}>
          ⚠ Poll server unavailable — votes are not being recorded right now.
        </p>
      )}
      {ORDER.map(p => {
        const m = META[p]
        return (
          <button
            key={p}
            className="poll-btn"
            onClick={() => castVote(p)}
            disabled={submitting}
          >
            <span className="poll-btn-icon">{m.icon}</span>
            <div>
              <div className="poll-btn-name">{m.name}</div>
              <div className="poll-btn-sub">{m.sub}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
