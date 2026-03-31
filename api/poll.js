// Vercel Serverless Function — Poll API
// Backed by Vercel KV (Redis). To set up:
//   1. vercel link  (connect repo to a Vercel project)
//   2. vercel storage create  (choose KV)
//   3. vercel env pull .env.local  (pulls KV_REST_API_URL + KV_REST_API_TOKEN locally)
//   4. Run locally with: vercel dev

const VALID_PARTIES = ['dmk', 'admk', 'tvk', 'undecided']
const POLL_KEY = 'tn26-poll'

// In-memory fallback for local dev without KV configured
const memStore = { dmk: 0, admk: 0, tvk: 0, undecided: 0 }

async function getKV() {
  if (!process.env.KV_REST_API_URL) return null
  const { kv } = await import('@vercel/kv')
  return kv
}

async function getCounts(kv) {
  if (!kv) return { ...memStore }
  const data = await kv.hgetall(POLL_KEY)
  if (!data) return { dmk: 0, admk: 0, tvk: 0, undecided: 0 }
  return {
    dmk: parseInt(data.dmk ?? 0),
    admk: parseInt(data.admk ?? 0),
    tvk: parseInt(data.tvk ?? 0),
    undecided: parseInt(data.undecided ?? 0),
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const kv = await getKV()

    if (req.method === 'GET') {
      const counts = await getCounts(kv)
      return res.status(200).json(counts)
    }

    if (req.method === 'POST') {
      const { party } = req.body
      if (!VALID_PARTIES.includes(party)) {
        return res.status(400).json({ error: 'Invalid party' })
      }

      if (kv) {
        await kv.hincrby(POLL_KEY, party, 1)
        const counts = await getCounts(kv)
        return res.status(200).json(counts)
      } else {
        // Local fallback: in-memory (resets on restart, but shows UI correctly)
        memStore[party]++
        return res.status(200).json({ ...memStore })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Poll API error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
