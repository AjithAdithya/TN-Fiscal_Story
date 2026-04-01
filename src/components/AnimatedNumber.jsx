import { useEffect, useRef, useState } from 'react'

// Parses display strings like "₹35.68L Cr", "₹3.32L Cr", "₹1.07L Cr" into a numeric target
// For non-numeric values (e.g. "Apr 23", "5.67 Cr"), falls back to static display
function parseTarget(str) {
  // Extract leading number e.g. "35.68" from "₹35.68L Cr"
  const match = str.match(/[\d.]+/)
  if (!match) return null
  return parseFloat(match[0])
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

export default function AnimatedNumber({ value, color, isVisible }) {
  const [display, setDisplay] = useState(value)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (!isVisible || hasRunRef.current) return
    const target = parseTarget(value)
    if (target === null) return // non-numeric, keep static

    hasRunRef.current = true
    const duration = 1500

    // Extract prefix/suffix
    const prefixMatch = value.match(/^[^\d]*/)
    const suffixMatch = value.match(/[\d.]+(.*)$/)
    const prefix = prefixMatch ? prefixMatch[0] : ''
    const suffix = suffixMatch ? suffixMatch[1] : ''

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOut(progress)
      const current = target * eased

      // Format with same decimal places as target
      const decimals = (target.toString().split('.')[1] || '').length
      setDisplay(prefix + current.toFixed(decimals) + suffix)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value) // snap to exact final value
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isVisible, value])

  return <span style={{ color }}>{display}</span>
}
