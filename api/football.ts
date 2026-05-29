import type { VercelRequest, VercelResponse } from '@vercel/node'

const API_BASE_URL = 'https://v3.football.api-sports.io'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.VITE_API_FOOTBALL_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Forward the path and query string to API-Football
  const { path, ...queryParams } = req.query as Record<string, string>
  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  const url = new URL(`${API_BASE_URL}/${path}`)
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey,
      },
    })

    const data = await response.json()

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(response.status).json(data)
  } catch (error) {
    return res.status(502).json({ error: 'Failed to reach API-Football' })
  }
}
