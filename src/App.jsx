import { useEffect, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Poll from './components/Poll'
import AnimatedNumber from './components/AnimatedNumber'
import DonutChart from './components/DonutChart'
import TasmacSparkline from './components/TasmacSparkline'
import CommittedBars from './components/CommittedBars'
import WaterfallChart from './components/WaterfallChart'

// ─── Waffle chart (62p lock: salaries/interest/pensions) ───────────
const WAFFLE_COLS = [
  ...Array(28).fill('#c0392b'),
  ...Array(21).fill('#e67e22'),
  ...Array(14).fill('#f1c40f'),
  ...Array(37).fill('rgba(26,138,125,.15)'),
]

function WaffleChart() {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={wrapRef}>
      <div className="waffle">
        {WAFFLE_COLS.map((bg, i) => (
          <div key={i} className="waffle-cell"
            style={{ background: bg, opacity: visible ? 1 : 0, transitionDelay: `${i * 18}ms` }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        {[
          { bg: '#c0392b', label: 'Salaries — 28p' },
          { bg: '#e67e22', label: 'Interest — 21p' },
          { bg: '#f1c40f', label: 'Pensions — 14p' },
          { bg: 'rgba(26,138,125,.15)', label: 'Everything else — 37p' },
        ].map(({ bg, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: bg }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section definitions ────────────────────────────────────────────
const SECTIONS = [
  { id: 'sec-hero',     label: 'Introduction' },
  { id: 'sec-players',  label: 'The Players' },
  { id: 'sec-economy',  label: 'Ch. I · Economy' },
  { id: 'sec-lock',     label: 'Ch. II · 62p Lock' },
  { id: 'sec-revenue',  label: 'Ch. III · Revenue' },
  { id: 'sec-welfare',  label: 'Ch. IV · Welfare' },
  { id: 'sec-promises', label: 'Ch. V · Promises' },
  { id: 'sec-womens',   label: 'Ch. VI · Women\'s Transfer' },
  { id: 'sec-fiscal',   label: 'Ch. VII · Fiscal Squeeze' },
  { id: 'sec-epilogue', label: 'Epilogue' },
  { id: 'sec-poll',     label: 'Poll' },
]

// ─── Main App ───────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress]         = useState(0)
  const [activeIdx, setActiveIdx]       = useState(0)
  const [showLabel, setShowLabel]       = useState(false)
  const [bigNumVisible, setBigNumVisible] = useState(false)
  const labelTimerRef                   = useRef(null)
  const bigNumRef                       = useRef(null)

  // Scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      setProgress(h.scrollTop / (h.scrollHeight - h.clientHeight) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section nav highlight + label
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const idx = SECTIONS.findIndex(s => s.id === e.target.id)
        if (idx === -1) return
        setActiveIdx(idx)
        setShowLabel(true)
        clearTimeout(labelTimerRef.current)
        labelTimerRef.current = setTimeout(() => setShowLabel(false), 2000)
      })
    }, { threshold: 0.15, rootMargin: '-10% 0px -55% 0px' })

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // Big-num count-up trigger
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setBigNumVisible(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (bigNumRef.current) obs.observe(bigNumRef.current)
    return () => obs.disconnect()
  }, [])

  // Reveal + animate bars
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.classList.add('visible')
        e.target.querySelectorAll('.h-bar-fill, .compare-bar-fill, .promise-bar-fill').forEach(b => {
          const w = b.getAttribute('data-width')
          if (w) setTimeout(() => { b.style.width = w + '%' }, 200)
        })
        e.target.querySelectorAll('.lollipop-line').forEach(l => {
          const w = l.getAttribute('data-width')
          if (w) setTimeout(() => { l.style.width = w + '%' }, 200)
        })
        e.target.querySelectorAll('.lollipop-dot').forEach(d => {
          const left = d.getAttribute('data-left')
          if (left) setTimeout(() => { d.style.left = `calc(${left}% - 7px)` }, 200)
        })
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: progress + '%' }} />
      </div>

      {/* Section label */}
      <div className={`progress-section-label${showLabel ? ' show' : ''}`}>
        {SECTIONS[activeIdx]?.label}
      </div>

      {/* Side nav dots (desktop) */}
      <nav className="section-nav">
        {SECTIONS.map((s, i) => (
          <a
            key={s.id}
            className={`sn-dot${i === activeIdx ? ' active' : ''}`}
            href={`#${s.id}`}
            data-label={s.label}
          />
        ))}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero" id="sec-hero">
        <div className="hero-kicker">A data story · Tamil Nadu Assembly Elections 2026</div>
        <h1>The ₹9.3 Lakh Crore <em>Question</em></h1>
        <p className="hero-sub">
          Three alliances. ₹2 lakh crore in promises. One state that already borrows a lakh crore a year.
          A story told in numbers, about the fiscal crossroads 5.67 crore Tamil Nadu voters face on April 23.
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item"><div className="hm-val">234</div><div className="hm-lbl">Seats</div></div>
          <div className="hero-meta-item"><div className="hm-val">Apr 23</div><div className="hm-lbl">Polling day</div></div>
          <div className="hero-meta-item"><div className="hm-val">May 4</div><div className="hm-lbl">Results</div></div>
          <div className="hero-meta-item"><div className="hm-val">5.67 Cr</div><div className="hm-lbl">Voters</div></div>
        </div>
        <div className="hero-scroll">↓ Scroll to begin</div>
      </section>

      {/* ═══ THE PLAYERS ═══ */}
      <div className="narrative reveal" id="sec-players">
        <div className="chapter-num">The Players</div>
        <h2>Three alliances, one battlefield</h2>
        <p>
          For six decades, Tamil Nadu politics has been a two-party affair — DMK or AIADMK, and nothing else.
          In 2026, actor-politician <strong>Vijay's TVK</strong> has disrupted that binary, creating the state's first credible three-cornered contest.
        </p>
      </div>

      <div className="viz-section reveal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
          {/* DMK */}
          <div className="alliance-card">
            <div className="alliance-stripe" style={{ background: 'linear-gradient(90deg,var(--dmk-dark),var(--dmk))' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem', marginTop: '.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <img src="/DMK.webp" alt="DMK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div className="alliance-name">Secular Progressive Alliance</div>
                <div className="alliance-lead">Led by CM M.K. Stalin · Ruling · ~175 seats for DMK</div>
              </div>
            </div>
            <div className="ally-chips">
              {['DMK','INC','CPI(M)','CPI','VCK','MDMK','DMDK','IUML'].map((p, i) => (
                <span key={p} className="ally-chip" style={{ background: i===0?'var(--dmk)':i===1?'var(--inc)':i<=3?'#cc0000':i===7?'#2e7d32':'#444', color: '#fff' }}>{p}</span>
              ))}
            </div>
            <div style={{ marginTop: '.75rem', fontSize: '.72rem', color: 'var(--slate)' }}>MNM (Kamal Haasan) extends support but not contesting. Won 159/234 in 2021.</div>
          </div>

          {/* AIADMK */}
          <div className="alliance-card">
            <div className="alliance-stripe" style={{ background: 'linear-gradient(90deg,var(--admk),#2ecc71)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem', marginTop: '.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <img src="/aiadmk.png" alt="AIADMK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div className="alliance-name">National Democratic Alliance</div>
                <div className="alliance-lead">Led by E.K. Palaniswami · Opposition · 297 promises</div>
              </div>
            </div>
            <div className="ally-chips">
              {[{n:'AIADMK',bg:'var(--admk)'},{n:'BJP',bg:'var(--bjp)'},{n:'PMK',bg:'#d4a017',c:'#000'},{n:'AMMK',bg:'#444'}].map(({n,bg,c}) => (
                <span key={n} className="ally-chip" style={{ background: bg, color: c||'#fff' }}>{n}</span>
              ))}
            </div>
            <div style={{ marginTop: '.75rem', fontSize: '.72rem', color: 'var(--slate)' }}>AIADMK won 66 seats in 2021. BJP had 4 seats. Seeking return to power.</div>
          </div>

          {/* TVK */}
          <div className="alliance-card">
            <div className="alliance-stripe" style={{ background: 'linear-gradient(90deg,var(--tvk-maroon),var(--tvk))' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem', marginTop: '.5rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <img src="/TVK.png" alt="TVK" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div className="alliance-name">Tamilaga Vettri Kazhagam</div>
                <div className="alliance-lead">Led by actor Vijay · New entrant · All 234 seats alone</div>
              </div>
            </div>
            <div className="ally-chips">
              <span className="ally-chip" style={{ background: 'var(--tvk-maroon)', color: '#FFD700', fontWeight: 700 }}>TVK</span>
              <span className="ally-chip" style={{ background: 'var(--whisper)', color: 'var(--slate)' }}>🎵 Whistle symbol</span>
            </div>
            <div style={{ marginTop: '.75rem', fontSize: '.72rem', color: 'var(--slate)' }}>Founded Feb 2024. Rejected NDA offer of 90 seats + CM post. Centre-left, secular positioning.</div>
          </div>
        </div>
        <div className="viz-source">
          Sources: <a href="https://en.wikipedia.org/wiki/2026_Tamil_Nadu_Legislative_Assembly_election" target="_blank" rel="noreferrer">Wikipedia — 2026 TN Election</a> · <a href="https://www.oneindia.com/tamil-nadu-election-2026-alliance-seat-sharing-list/" target="_blank" rel="noreferrer">Oneindia Seat Sharing</a>
        </div>
      </div>

      <div className="narrative reveal">
        <p>But before we weigh their promises, we need to understand the machine. <strong>How big is Tamil Nadu's economy? How much does the government earn? And how much room — if any — is left for new spending?</strong></p>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER I: ECONOMY ═══ */}
      <div className="narrative reveal" id="sec-economy">
        <div className="chapter-num">Chapter I</div>
        <h2>The economy: larger than Thailand</h2>
      </div>

      <div className="viz-section reveal">
        <div className="big-num-row" ref={bigNumRef}>
          {[
            { accent: 'var(--teal)', label: 'GSDP 2025-26',      value: '₹35.68L Cr', color: 'var(--teal)',  context: <>~$420B · 2nd largest state<sup><a className="cite" href="#s1">[1]</a></sup></>, delay: 0 },
            { accent: 'var(--gold)', label: 'Revenue Receipts',   value: '₹3.32L Cr',  color: 'var(--gold)',  context: <>What the govt collects<sup><a className="cite" href="#s2">[2]</a></sup></>, delay: 150 },
            { accent: 'var(--rust)', label: 'Total Expenditure',  value: '₹4.39L Cr',  color: 'var(--rust)',  context: <>What it spends<sup><a className="cite" href="#s1">[1]</a></sup></>, delay: 300 },
            { accent: 'var(--ink)',  label: 'The Gap',            value: '₹1.07L Cr',  color: 'var(--ink)',   context: 'Filled by borrowing every year', delay: 450 },
          ].map(({ accent, label, value, color, context, delay }) => (
            <div key={label} className="big-num" style={{ transitionDelay: `${delay}ms` }}>
              <div className="accent-bar" style={{ background: accent }} />
              <div className="label">{label}</div>
              <div className="value"><AnimatedNumber value={value} color={color} isVisible={bigNumVisible} /></div>
              <div className="context">{context}</div>
            </div>
          ))}
        </div>
        <div className="viz-source">Sources: <a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2025-26" target="_blank" rel="noreferrer">[1] PRS India — TN Budget Analysis 2025-26</a> · <a href="https://financedept.tn.gov.in/budget/" target="_blank" rel="noreferrer">[2] TN Finance Dept — Budget 2025-26</a></div>
      </div>

      <div className="narrative reveal">
        <p className="lead">The state earns ₹3.32 lakh crore but spends ₹4.39 lakh crore. The difference — over a lakh crore — is borrowed every single year. Every new promise starts from a position of deficit, not surplus.</p>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER II: 62p LOCK ═══ */}
      <div className="narrative reveal" id="sec-lock">
        <div className="chapter-num">Chapter II</div>
        <h2>The 62-paisa lock</h2>
        <p>Here is the single most important number in Tamil Nadu's finances — and the one no manifesto mentions:</p>
      </div>

      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>For every ₹1 the state earns...</h3>
          <div className="viz-sub">Committed expenditure as share of revenue receipts · FY 2025-26 BE</div>
          <WaffleChart />
          <div className="viz-source">Source: <a href="https://prsindia.org/files/budget/budget_state/tamil-nadu/2025/TN_Budget_Analysis_2025-26.pdf" target="_blank" rel="noreferrer">[3] PRS India — Committed Expenditure Table 3</a> — "₹2,07,054 crore on committed expenditure, which is 62% of estimated revenue receipts"</div>
        </div>
      </div>

      <div className="narrative reveal">
        <p><strong>62 paise of every rupee is already spoken for</strong> — salaries for 8 lakh+ government employees, pensions for retirees, and interest on ₹9.3 lakh crore in debt.<sup><a className="cite" href="#s3">[3]</a></sup> These are legally binding. They cannot be cut.</p>
        <div className="callout gold">
          <strong>The trend is worsening.</strong> Interest payments alone jumped 29%, from ₹54,676 Cr to ₹70,254 Cr in two years.<sup><a className="cite" href="#s3">[3]</a></sup><sup><a className="cite" href="#s4">[4]</a></sup>
        </div>
      </div>

      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>Committed expenditure — three-year climb</h3>
          <div className="viz-sub">Legally binding spending (salaries + pensions + interest) · ₹ Cr</div>
          <CommittedBars />
          <div className="viz-source">Sources: <a href="https://prsindia.org/files/budget/budget_state/tamil-nadu/2025/TN_Budget_Analysis_2025-26.pdf" target="_blank" rel="noreferrer">[3] PRS India — Committed Expenditure Table 3</a> · <a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2024-25" target="_blank" rel="noreferrer">[4] PRS India 2024-25</a></div>
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER III: REVENUE ═══ */}
      <div className="narrative reveal" id="sec-revenue">
        <div className="chapter-num">Chapter III</div>
        <h2>Where the money comes from</h2>
        <p>Tamil Nadu raises <strong>75.3% of its revenue from its own sources</strong><sup><a className="cite" href="#s2">[2]</a></sup> — one of the highest self-reliance ratios in India. Only 24.7% comes from the Centre. The Finance Minister called the state's 4% share of central taxes a "gross injustice" given it contributes 9% of GDP.<sup><a className="cite" href="#s5">[5]</a></sup></p>
      </div>

      {/* Mod 2 — Donut chart: own sources vs Centre */}
      <div className="viz-section reveal">
        <div className="viz-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
          <DonutChart
            segments={[
              { pct: 75.3, color: 'var(--teal)', label: 'Own sources' },
              { pct: 24.7, color: 'rgba(90,99,120,.35)', label: 'From Centre' },
            ]}
            centerLabel="75.3%"
            centerSub="SELF-RELIANT"
            maxWidth={220}
          />
          <div>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: '.5rem' }}>Revenue self-reliance</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--slate)', marginBottom: '.75rem' }}>Tamil Nadu raises <strong style={{ color: 'var(--ink)' }}>75.3%</strong> from its own taxes — one of India's highest. Only 24.7% from the Centre.</p>
            <p style={{ fontSize: '.78rem', color: 'var(--slate)' }}>The Finance Minister called the state's 4% share of central taxes a "gross injustice" given it contributes 9% of national GDP.</p>
          </div>
          <div className="viz-source" style={{ gridColumn: '1 / -1' }}>Source: <a href="https://financedept.tn.gov.in/budget/" target="_blank" rel="noreferrer">[2] TN Finance Dept</a></div>
        </div>
      </div>

      {/* Mod 3 — Tax bars with cumulative bracket */}
      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>Tax revenue</h3>
          <div className="viz-sub">Own tax sources ranked by FY 2025-26 BE (₹ Cr)</div>
          {[
            { label: 'State GST',      w: 100,  color: 'var(--teal)',  val: '₹92,872' },
            { label: 'Sales Tax / VAT',w: 76.5, color: 'var(--dmk)',   val: '₹71,058' },
          ].map(({ label, w, color, val }) => (
            <div key={label} className="lollipop">
              <div className="lollipop-label">{label}</div>
              <div className="lollipop-track">
                <div className="lollipop-line" data-width={w} style={{ background: `linear-gradient(to right, transparent, ${color})`, width: '0%' }} />
                <div className="lollipop-dot" data-left={w} style={{ background: color, left: '0%' }} />
              </div>
              <div className="lollipop-val">{val}</div>
            </div>
          ))}
          {/* Inline bracket callout after top-2 bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', margin: '.2rem 0 .6rem', paddingLeft: 'calc(min(120px,160px) + .75rem)' }}>
            <div style={{ width: '2px', height: '28px', background: 'var(--gold)', borderRadius: '1px', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--gold)', fontWeight: 600 }}>
              Combined: 74% of all own tax revenue
            </span>
          </div>
          {[
            { label: 'Stamps & Reg.',  w: 28.1, color: 'var(--gold)',  val: '₹26,109' },
            { label: 'Motor Vehicle',  w: 14.5, color: 'var(--bjp)',   val: '₹13,441' },
            { label: 'State Excise',   w: 13.9, color: 'var(--rust)',  val: '₹12,944' },
            { label: 'Others',         w: 4.8,  color: 'var(--slate)', val: '₹4,471'  },
          ].map(({ label, w, color, val }) => (
            <div key={label} className="lollipop">
              <div className="lollipop-label">{label}</div>
              <div className="lollipop-track">
                <div className="lollipop-line" data-width={w} style={{ background: `linear-gradient(to right, transparent, ${color})`, width: '0%' }} />
                <div className="lollipop-dot" data-left={w} style={{ background: color, left: '0%' }} />
              </div>
              <div className="lollipop-val">{val}</div>
            </div>
          ))}
          <div className="viz-source">Source: <a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2025-26" target="_blank" rel="noreferrer">[1] PRS India — Table 5</a> · <a href="https://financedept.tn.gov.in/budget/" target="_blank" rel="noreferrer">[2] TN Finance Dept</a></div>
        </div>
      </div>

      <div className="narrative reveal">
        <p>Notice: <strong>GST and VAT together make up 74% of all tax revenue.</strong> A significant chunk of that VAT comes from one politically charged source — TASMAC, the state's liquor monopoly.</p>
      </div>

      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>TASMAC: the revenue elephant</h3>
          <div className="viz-sub">State liquor monopoly — revenue trajectory</div>
          <TasmacSparkline />
          <div className="callout teal" style={{ marginTop: '1.5rem' }}>
            <strong>TASMAC contributes ~25% of the state's own tax revenue</strong> but only 1.53% of GSDP — a declining share as the economy diversifies.<sup><a className="cite" href="#s6">[6]</a></sup> The ED alleged a ₹1,000 Cr scam in TASMAC operations in March 2025. No party's 2026 manifesto mentions prohibition.
          </div>
          <div className="viz-source">Sources: <a href="https://thefederal.com/category/states/south/tamil-nadu/tasmac-revenue-ed-raid-corruption-charge-senthil-balaji-183075" target="_blank" rel="noreferrer">[6] The Federal — TASMAC Revenue FY25</a> · <a href="https://www.dtnext.in/news/tamilnadu/tamil-nadu-liquor-sale-surge-to-rs-48344-cr-in-fy25-830969" target="_blank" rel="noreferrer">[7] DT Next — Liquor sale surge</a></div>
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER IV: WELFARE ═══ */}
      <div className="narrative reveal" id="sec-welfare">
        <div className="chapter-num">Chapter IV</div>
        <h2>The welfare machine that already exists</h2>
        <p>Before a single new promise is made, Tamil Nadu runs one of India's most extensive welfare architectures. Here's what it costs — shown as proportional blocks so you can feel the relative weight:</p>
      </div>

      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>Existing welfare spend — treemap view</h3>
          <div className="viz-sub">FY 2025-26 BE · Major subsidy and transfer heads (₹ Cr)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gridTemplateRows: 'repeat(4,55px)', gap: '4px', margin: '1rem 0' }}>
            <div style={{ gridColumn: 'span 7', gridRow: 'span 3', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', borderRadius: '10px', padding: '.75rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '.68rem', opacity: .8 }}>⚡ TANGEDCO</div>
              <div><div style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem' }}>₹30,434</div><div style={{ fontSize: '.6rem', opacity: .7 }}>Agri + domestic power subsidy</div></div>
            </div>
            <div style={{ gridColumn: 'span 5', gridRow: 'span 2', background: 'var(--dmk)', borderRadius: '10px', padding: '.75rem', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '.68rem', opacity: .8 }}>👩 Magalir Urimai</div>
              <div><div style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem' }}>₹13,807</div><div style={{ fontSize: '.6rem', opacity: .7 }}>₹1K/mo · 1.15 Cr women</div></div>
            </div>
            <div style={{ gridColumn: 'span 5', gridRow: 'span 1', background: 'var(--gold)', borderRadius: '8px', padding: '.5rem .75rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.68rem', fontWeight: 600 }}>🍚 Food (PDS)</span><span style={{ fontFamily: 'var(--serif)', fontSize: '1rem' }}>₹12,500</span>
            </div>
            <div style={{ gridColumn: 'span 4', gridRow: 'span 1', background: 'var(--teal)', borderRadius: '8px', padding: '.5rem .75rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.68rem' }}>🚌 Transport</span><span style={{ fontFamily: 'var(--serif)', fontSize: '1rem' }}>₹9,682</span>
            </div>
            <div style={{ gridColumn: 'span 3', gridRow: 'span 1', background: 'var(--admk)', borderRadius: '8px', padding: '.5rem .75rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.65rem' }}>🏠 Housing</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.72rem' }}>₹3,500</span>
            </div>
            <div style={{ gridColumn: 'span 3', gridRow: 'span 1', background: 'var(--slate)', borderRadius: '8px', padding: '.5rem .75rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.65rem' }}>📚 Edu</span><span style={{ fontFamily: 'var(--mono)', fontSize: '.72rem' }}>₹1,696</span>
            </div>
            <div style={{ gridColumn: 'span 2', gridRow: 'span 1', background: '#7768AE', borderRadius: '8px', padding: '.5rem', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '.55rem' }}>🏥 Health</div><div style={{ fontFamily: 'var(--mono)', fontSize: '.65rem' }}>₹1,461</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '.75rem', borderTop: '2px solid var(--ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem' }}>Total existing welfare</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--rust)' }}>~₹1.60 lakh Cr = 36% of total expenditure</span>
          </div>
          <div className="viz-source">Sources: <a href="https://financedept.tn.gov.in/budget/" target="_blank" rel="noreferrer">[2] TN Finance Dept</a> · <a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2025-26" target="_blank" rel="noreferrer">[1] PRS India</a></div>
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER V: PROMISES ═══ */}
      <div className="narrative reveal" id="sec-promises">
        <div className="chapter-num">Chapter V</div>
        <h2>The bill for 2026</h2>
        <p>Now you know the full picture: what the state earns, what's locked, what's already spent on welfare. Here's what the three forces are promising <strong>on top of all that</strong>.</p>
      </div>

      {/* Mod 7 — Promise cards with proportional comparison bars */}
      <div className="viz-section reveal">
        <div className="promise-grid">
          {[
            { border: 'rgba(227,41,44,.15)', stripe: 'linear-gradient(90deg,#1a1a1a,var(--dmk))', img: '/DMK.webp', alt: 'DMK', tag: 'DMK · SPA',     cost: '₹57,312 Cr', pct: 13.0, color: 'var(--dmk)',        detail: '525 promises · 6 key schemes' },
            { border: 'rgba(27,140,58,.15)', stripe: 'var(--admk)',                                  img: '/aiadmk.png', alt: 'AIADMK', tag: 'AIADMK · NDA', cost: '₹74,970 Cr', pct: 17.1, color: 'var(--admk)',       detail: '297 promises · 7 key schemes' },
            { border: 'rgba(139,26,26,.15)', stripe: 'linear-gradient(90deg,var(--tvk-maroon),var(--tvk))', img: '/TVK.png', alt: 'TVK', tag: 'TVK · Alone', cost: '₹72,765 Cr', pct: 16.6, color: 'var(--tvk-maroon)', detail: "Vijay's party · 7 key schemes" },
          ].map(({ border, stripe, img, alt, tag, cost, pct, color, detail }) => (
            <div key={tag} className="promise-card" style={{ border: `1px solid ${border}` }}>
              <div className="card-stripe" style={{ background: stripe }} />
              <div style={{ marginTop: '.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', margin: '0 auto .5rem', background: '#fff' }}>
                  <img src={img} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="party-tag" style={{ color }}>{tag}</div>
                <div className="cost" style={{ color }}>{cost}</div>
                <div className="pct">{pct}% of total budget</div>
                <div style={{ fontSize: '.68rem', color: 'var(--slate)', marginTop: '.5rem' }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="viz-source">Sources: Party manifestos released 22-29 Mar 2026 · Costings from <a href="https://organiser.org/2026/03/30/346418/bharat/tamil-nadu-elections-2026-dmk-aiadmk-tvk-in-freebie-war-as-fiscal-concerns-mount/" target="_blank" rel="noreferrer">Organiser</a>, <a href="https://zeenews.india.com/india/tvk-s-entry-raises-stakes-in-tamil-nadu-dmk-aiadmk-turn-to-freebies-showdown-ahead-of-polls-3031880.html" target="_blank" rel="noreferrer">Zee News</a></div>
      </div>

      {/* Scheme table */}
      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>Key schemes — head-to-head</h3>
          <div className="viz-sub">Annual cost estimates (₹ Cr) based on stated beneficiary targets</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem', margin: '.5rem 0' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gold)' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontFamily: 'var(--mono)', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--slate)' }}>Scheme</th>
                  {[['DMK','var(--dmk)'],['ADMK','var(--admk)'],['TVK','var(--tvk-maroon)']].map(([n,c]) => (
                    <th key={n} style={{ textAlign: 'center', padding: '8px', width: '60px' }}>
                      <div style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', background: c, color: '#fff', fontFamily: 'var(--mono)', fontSize: '.55rem' }}>{n}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { scheme: "Women's cash transfer",    dmk: 31200, admk: 31200, tvk: 39000 },
                  { scheme: "One-time household relief", dmk: 16000, admk: 20000, tvk: null  },
                  { scheme: "Free LPG cylinders",        dmk: null,  admk: 6138,  tvk: 11160 },
                  { scheme: "Unemployment allowance",    dmk: null,  admk: 4200,  tvk: 11010 },
                  { scheme: "Free bus travel (expanded)",dmk: null,  admk: 4581,  tvk: 6545  },
                  { scheme: "Old-age pension (₹2K)",     dmk: null,  admk: 6960,  tvk: null  },
                  { scheme: "Free laptops",               dmk: 7350,  admk: 1890,  tvk: null  },
                  { scheme: "Education stipends",         dmk: 2762,  admk: null,  tvk: 2250  },
                ].map(({ scheme, dmk, admk, tvk }, i) => (
                  <tr key={scheme} style={{ borderBottom: '1px solid var(--whisper)', background: i%2===1 ? 'var(--whisper)' : undefined }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{scheme}</td>
                    <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--mono)', color: 'var(--dmk)' }}>{dmk ?? '—'}</td>
                    <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--mono)', color: 'var(--admk)' }}>{admk ?? '—'}</td>
                    <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--mono)', color: 'var(--tvk-maroon)' }}>{tvk ?? '—'}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--ink)', fontWeight: 700 }}>
                  <td style={{ padding: '8px' }}>TOTAL (first-year)</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--dmk)' }}>₹57,312</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--admk)' }}>₹74,970</td>
                  <td style={{ textAlign: 'center', padding: '8px', fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--tvk-maroon)' }}>₹72,765</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="viz-source">Sources: DMK manifesto (29 Mar 2026) · AIADMK manifesto (22 Mar 2026) · TVK manifesto (29 Mar 2026)</div>
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER VI: WOMEN'S TRANSFER ═══ */}
      <div className="narrative reveal" id="sec-womens">
        <div className="chapter-num">Chapter VI</div>
        <h2>The scheme that dwarfs everything</h2>
        <p>All three parties promise monthly cash to women. This <strong>one category</strong> dwarfs every other promise combined:</p>
      </div>

      <div className="viz-section reveal">
        <div className="viz-card">
          <h3>Women's cash transfer — the bidding war</h3>
          <div className="viz-sub">Annual cost · Targeting ~1.3 Cr women beneficiaries</div>
          <div className="compare-strip" style={{ marginTop: '1rem' }}>
            {[
              { tag: 'TVK', color: 'var(--tvk-maroon)', bg: 'linear-gradient(90deg,var(--tvk-maroon),var(--tvk))', w: 100, amount: '₹39,000 Cr', rate: '₹2,500/mo' },
              { tag: 'DMK', color: 'var(--dmk)',        bg: 'var(--dmk)',                                           w: 80,  amount: '₹31,200 Cr', rate: '₹2,000/mo' },
              { tag: 'ADMK',color: 'var(--admk)',       bg: 'var(--admk)',                                          w: 80,  amount: '₹31,200 Cr', rate: '₹2,000/mo' },
            ].map(({ tag, color, bg, w, amount, rate }) => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                <div className="compare-tag" style={{ color }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: color, marginRight: '4px' }} />{tag}
                </div>
                <div className="compare-bar-track" style={{ height: '36px' }}>
                  <div className="compare-bar-fill" data-width={w} style={{ background: bg, width: '0%' }} />
                </div>
                <div style={{ flexShrink: 0, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.72rem', fontWeight: 700, color: 'var(--ink)' }}>{amount}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.62rem', color: 'var(--slate)' }}>{rate}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '.75rem', paddingTop: '.5rem', borderTop: '1px dashed var(--whisper)', opacity: .6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div className="compare-tag" style={{ color: 'var(--slate)' }}>Current</div>
                <div className="compare-bar-track" style={{ height: '24px' }}>
                  <div className="compare-bar-fill" data-width={35.4} style={{ background: 'var(--slate)', width: '0%' }} />
                </div>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '.68rem', color: 'var(--slate)' }}>₹13,807 Cr · ₹1,000/mo</div>
                </div>
              </div>
            </div>
          </div>
          <div className="callout red" style={{ marginTop: '1rem' }}>
            <strong>Scale check:</strong> TVK's women's transfer alone (₹39,000 Cr) nearly equals the state's <em>entire revenue deficit</em> (₹41,635 Cr).<sup><a className="cite" href="#s1">[1]</a></sup> One scheme. One party. Almost the entire gap the state already can't close.
          </div>
          <div className="viz-source">Sources: <a href="https://zeenews.india.com/india/tvk-s-entry-raises-stakes-in-tamil-nadu-dmk-aiadmk-turn-to-freebies-showdown-ahead-of-polls-3031880.html" target="_blank" rel="noreferrer">Zee News</a> · <a href="https://www.newkerala.com/news/a/tn-polls-dmk-calls-party-manifesto-superstar-aiadmk-399.htm" target="_blank" rel="noreferrer">NewKerala</a> · <a href="https://www.business-standard.com/budget/news/tn-budget-fiscal-deficit-seen-at-3-of-gsdp-in-fy26-hosur-to-be-new-gcc-125031400440_1.html" target="_blank" rel="noreferrer">Business Standard</a></div>
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ CHAPTER VII: FISCAL REALITY ═══ */}
      <div className="narrative reveal" id="sec-fiscal">
        <div className="chapter-num">Chapter VII</div>
        <h2>The fiscal squeeze</h2>
        <p>Let's stack all promises against the state's actual financial capacity. Here's the picture no manifesto shows you:</p>
      </div>

      {/* Mod 8 — Waterfall chart (THE climax) */}
      <div className="viz-section reveal">
        <div className="viz-card" style={{ borderTop: '3px solid var(--rust)' }}>
          <h3>Where does the money actually go?</h3>
          <div className="viz-sub">Total budget ₹4.39L Cr — watch it disappear · scroll into view to animate</div>
          <WaterfallChart />
          <div className="viz-source">Sources: <a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2025-26" target="_blank" rel="noreferrer">[1] PRS India 2025-26</a></div>
        </div>
      </div>

      <div className="viz-section reveal">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
          {[
            { accent: 'var(--rust)', label: 'If funded by borrowing', title: 'Debt → ₹10.4L+ Cr', body: <>Outstanding debt already ₹9.30L Cr (26.07% of GSDP).<sup><a className="cite" href="#s8">[8]</a></sup> Would breach the 15th FC limit of 28.7%.</> },
            { accent: 'var(--gold)', label: 'If funded by tax hikes',  title: 'OTR must grow 25-35%', body: <>Current own-tax growth: 7-15%/yr.<sup><a className="cite" href="#s1">[1]</a></sup> Would need unprecedented jumps or entirely new taxes.</> },
            { accent: 'var(--teal)', label: 'If funded by cuts',       title: 'Capex at risk',      body: <>₹57,231 Cr capital spend<sup><a className="cite" href="#s9">[9]</a></sup> is the only flexible target. Cutting it means fewer roads, hospitals. Growth suffers.</> },
          ].map(({ accent, label, title, body }) => (
            <div key={label} className="viz-card" style={{ borderLeft: `4px solid ${accent}`, borderRadius: '0 16px 16px 0' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', letterSpacing: '.15em', textTransform: 'uppercase', color: accent, marginBottom: '.5rem' }}>{label}</div>
              <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
              <p style={{ fontSize: '.82rem', color: 'var(--slate)', marginTop: '.5rem' }}>{body}</p>
            </div>
          ))}
        </div>
        <div className="viz-source" style={{ marginTop: '.75rem' }}>Sources: <a href="https://investmentguruindia.com/newsdetail/-tamil-nadu-budget-2025-26-debt-to-gsdp-ratio-pegged-at-26-07-pc448992" target="_blank" rel="noreferrer">[8] InvestmentGuru</a> · <a href="https://www.business-standard.com/budget/news/tn-budget-fiscal-deficit-seen-at-3-of-gsdp-in-fy26-hosur-to-be-new-gcc-125031400440_1.html" target="_blank" rel="noreferrer">[9] Business Standard</a></div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ EPILOGUE ═══ */}
      <div className="narrative reveal" id="sec-epilogue">
        <div className="chapter-num">Epilogue</div>
        <h2>The question for April 23</h2>
        <p>Tamil Nadu is not broke. It is a growing, diversified, fundamentally strong economy. Its debt-to-GSDP ratio (26.07%) is within FRBM limits.<sup><a className="cite" href="#s8">[8]</a></sup> Its fiscal deficit is exactly at the 3% ceiling.<sup><a className="cite" href="#s1">[1]</a></sup></p>
        <p>But it is also a state with <strong>no fiscal room for large new promises</strong> without trade-offs that no party is willing to name. The 62% committed expenditure lock<sup><a className="cite" href="#s3">[3]</a></sup> means the government's hands are tied before it even begins to govern.</p>
      </div>

      <div className="viz-section reveal">
        <div style={{ background: 'var(--ink)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '.6rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>The arithmetic of choice</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
            {[
              { val: '₹3.32L Cr', lbl: 'Revenue earned',    color: '#fff' },
              { val: '₹2.07L Cr', lbl: 'Already locked (62%)', color: 'var(--rust)' },
              { val: '₹1.60L Cr', lbl: 'Existing welfare',  color: 'var(--gold)' },
              { val: '₹57-75K Cr',lbl: 'New promises',      color: 'var(--teal)' },
            ].map(({ val, lbl, color }) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color }}>{val}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginTop: '.25rem' }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.3rem', color: 'rgba(255,255,255,.7)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
              The numbers don't add up. Someone will have to say so. The question is whether that happens before April 23 — or after.
            </div>
          </div>
        </div>
      </div>

      {/* ═══ POLL ═══ */}
      <div id="sec-poll" className="reveal">
        <div className="narrative">
          <div className="chapter-num">Quick Poll</div>
          <h2>Who are you rooting for?</h2>
          <p>The numbers have been laid out. Now tell us — which alliance has earned your confidence heading into April 23?</p>
        </div>
        <div className="poll-outer">
          <Poll />
        </div>
      </div>

      <div className="section-divider">· · ·</div>

      {/* ═══ SOURCES ═══ */}
      <div className="story-footer" id="sources">
        <div className="src-title">Sources &amp; citations</div>
        <ol className="source-list">
          <li data-n="[1]" id="s1"><a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2025-26" target="_blank" rel="noreferrer">PRS India — Tamil Nadu Budget Analysis 2025-26</a> — GSDP, revenue, expenditure, deficit figures</li>
          <li data-n="[2]" id="s2"><a href="https://financedept.tn.gov.in/budget/" target="_blank" rel="noreferrer">TN Finance Department — Budget 2025-26</a> — Revenue receipts ₹3,31,569 Cr, own source 75.3%</li>
          <li data-n="[3]" id="s3"><a href="https://prsindia.org/files/budget/budget_state/tamil-nadu/2025/TN_Budget_Analysis_2025-26.pdf" target="_blank" rel="noreferrer">PRS India PDF — Table 3: Committed Expenditure</a> — ₹2,07,054 Cr, 62% of revenue receipts</li>
          <li data-n="[4]" id="s4"><a href="https://prsindia.org/budgets/states/tamil-nadu-budget-analysis-2024-25" target="_blank" rel="noreferrer">PRS India — TN Budget Analysis 2024-25</a> — FY25 committed expenditure ₹1,89,897 Cr</li>
          <li data-n="[5]" id="s5"><a href="https://thefederal.com/category/states/south/tamil-nadu/tn-budget-fiscal-deficit-estimated-to-reduce-to-3-of-gsdp-176394" target="_blank" rel="noreferrer">The Federal — TN Budget: Fiscal deficit at 3%</a></li>
          <li data-n="[6]" id="s6"><a href="https://thefederal.com/category/states/south/tamil-nadu/tasmac-revenue-ed-raid-corruption-charge-senthil-balaji-183075" target="_blank" rel="noreferrer">The Federal — TASMAC Revenue FY25</a></li>
          <li data-n="[7]" id="s7"><a href="https://www.dtnext.in/news/tamilnadu/tamil-nadu-liquor-sale-surge-to-rs-48344-cr-in-fy25-830969" target="_blank" rel="noreferrer">DT Next — TN liquor sale surge</a></li>
          <li data-n="[8]" id="s8"><a href="https://investmentguruindia.com/newsdetail/-tamil-nadu-budget-2025-26-debt-to-gsdp-ratio-pegged-at-26-07-pc448992" target="_blank" rel="noreferrer">InvestmentGuru India — Debt-to-GSDP 26.07%</a></li>
          <li data-n="[9]" id="s9"><a href="https://www.business-standard.com/budget/news/tn-budget-fiscal-deficit-seen-at-3-of-gsdp-in-fy26-hosur-to-be-new-gcc-125031400440_1.html" target="_blank" rel="noreferrer">Business Standard — TN Budget FY26</a></li>
          <li data-n="[10]" id="s10"><a href="https://www.cppr.in/articles/tamil-nadu-fiscal-reality-2026" target="_blank" rel="noreferrer">CPPR — Tamil Nadu's Fiscal Reality Before Poll Promises</a></li>
          <li data-n="[11]"><a href="https://en.wikipedia.org/wiki/2026_Tamil_Nadu_Legislative_Assembly_election" target="_blank" rel="noreferrer">Wikipedia — 2026 TN Election</a></li>
          <li data-n="[12]"><a href="https://en.wikipedia.org/wiki/Tamilaga_Vettri_Kazhagam" target="_blank" rel="noreferrer">Wikipedia — TVK</a></li>
        </ol>
        <p style={{ marginTop: '1.5rem', fontSize: '.65rem', color: 'rgba(90,99,120,.5)' }}>
          All figures in Indian Rupees (₹). BE = Budget Estimates. Election promise costings are editorial estimates based on beneficiary counts × per-unit amounts from party manifestos. Dashboard compiled March 31, 2026.
        </p>
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--slate)' }}>
            Built by <strong style={{ color: 'var(--ink)' }}>Ajith Adithya R K</strong> using Claude
          </div>
          <a
            href="https://www.linkedin.com/in/ajith98/"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontFamily: 'var(--mono)', fontSize: '.62rem', color: '#0077B5', background: 'rgba(0,119,181,.07)', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,119,181,.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,119,181,.07)'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
        </div>
      </div>
      <Analytics />
    </>
  )
}
