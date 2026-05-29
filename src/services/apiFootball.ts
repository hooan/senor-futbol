import type { ApiFootballResponse, ApiFixture, ApiLeague, ApiStanding, ApiFixtureDetail, ApiSquadPlayer } from '@/types/apiFootball'

const API_BASE_URL = 'https://v3.football.api-sports.io'
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || ''

// In the browser, route through the Vercel proxy to avoid CORS.
// In Node (CLI / SSR), call the API directly with the key.
const IS_BROWSER = typeof window !== 'undefined'

interface RequestLog {
  count: number
  lastReset: number
}

class ApiFootballClient {
  private baseURL: string
  private apiKey: string
  private requestLog: RequestLog

  constructor(apiKey: string, baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.apiKey = apiKey
    this.requestLog = this.loadRequestLog()
  }

  private loadRequestLog(): RequestLog {
    const stored = localStorage.getItem('api_football_requests')
    if (stored) {
      const log = JSON.parse(stored) as RequestLog
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      
      if (now - log.lastReset > dayInMs) {
        return { count: 0, lastReset: now }
      }
      return log
    }
    return { count: 0, lastReset: Date.now() }
  }

  private saveRequestLog(): void {
    localStorage.setItem('api_football_requests', JSON.stringify(this.requestLog))
  }

  private incrementRequestCount(): void {
    this.requestLog.count++
    this.saveRequestLog()
  }

  public getRequestCount(): number {
    return this.requestLog.count
  }

  public getRemainingRequests(): number {
    return Math.max(0, 100 - this.requestLog.count)
  }

  private checkRateLimit(): void {
    if (this.requestLog.count >= 100) {
      const hoursUntilReset = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - this.requestLog.lastReset)) / (60 * 60 * 1000))
      throw new Error(`Rate limit exceeded. Resets in ${hoursUntilReset} hours.`)
    }
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiFootballResponse<T>> {
    this.checkRateLimit()

    let url: URL
    let headers: Record<string, string>

    if (IS_BROWSER) {
      // Route through Vercel serverless proxy — avoids CORS and keeps key server-side.
      const path = endpoint.replace(/^\//, '')
      url = new URL(`/api/football`, window.location.origin)
      url.searchParams.append('path', path)
      headers = {}
    } else {
      // Node / CLI — call API directly.
      url = new URL(`${this.baseURL}${endpoint}`)
      headers = {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': this.apiKey,
      }
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    console.log(`[API-Football] GET ${url.pathname}${url.search}`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as ApiFootballResponse<T>

    this.incrementRequestCount()
    console.log(`[API-Football] Requests used: ${this.requestLog.count}/100`)

    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = Object.entries(data.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      throw new Error(`API Error: ${errorMsg}`)
    }

    return data
  }

  // Leagues
  async searchLeagues(query: string): Promise<ApiLeague[]> {
    const response = await this.request<ApiLeague>('/leagues', { search: query })
    return response.response
  }

  async getLeague(leagueId: number): Promise<ApiLeague | null> {
    const response = await this.request<ApiLeague>('/leagues', { id: leagueId })
    return response.response[0] || null
  }

  // Fixtures
  async getFixturesByLeague(leagueId: number, season: number): Promise<ApiFixture[]> {
    const response = await this.request<ApiFixture>('/fixtures', {
      league: leagueId,
      season: season,
    })
    return response.response
  }

  async getFixtureById(fixtureId: number): Promise<ApiFixture | null> {
    const response = await this.request<ApiFixture>('/fixtures', { id: fixtureId })
    return response.response[0] || null
  }

  // Get full fixture detail with events, lineups, and statistics
  async getFixtureDetail(fixtureId: number): Promise<ApiFixtureDetail | null> {
    const response = await this.request<ApiFixtureDetail>('/fixtures', { id: fixtureId })
    return response.response[0] || null
  }

  async getFixturesByDate(date: string, leagueId?: number): Promise<ApiFixture[]> {
    const params: Record<string, any> = { date }
    if (leagueId) params.league = leagueId
    
    const response = await this.request<ApiFixture>('/fixtures', params)
    return response.response
  }

  // Standings
  async getStandingsByLeague(leagueId: number, season: number): Promise<ApiStanding[][]> {
    const response = await this.request<{ league: { standings: ApiStanding[][] } }>('/standings', {
      league: leagueId,
      season: season,
    })
    
    if (response.response.length === 0) return []
    return response.response[0].league.standings
  }

  // Status
  async getStatus(): Promise<{ requests: { current: number; limit_day: number } }> {
    const response = await fetch(`${this.baseURL}/status`, {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': this.apiKey,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch API status')
    }
    
    const data = await response.json()
    return data.response
  }

  // Players - Get team squad/roster
  async getTeamSquad(teamId: number): Promise<ApiSquadPlayer[]> {
    const response = await this.request<{ team: { id: number; name: string }; players: ApiSquadPlayer[] }>('/players/squads', {
      team: teamId,
    })
    
    if (response.response.length === 0) return []
    return response.response[0].players || []
  }
}

// Export singleton instance
export const apiFootball = new ApiFootballClient(API_KEY || '')

// Export class for testing
export { ApiFootballClient }
