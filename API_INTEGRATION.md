# API Integration Guide

This guide explains how to integrate the real API-Football data when World Cup 2026 fixtures become available.

## Current Status: Mock Data Mode

The application currently uses **mock/placeholder data** for development. This allows you to:
- Build and test all features
- Demonstrate the full functionality
- Optimize the caching and API strategy
- Deploy to production without consuming API requests

## When to Switch to Real API

Switch to real API when:
1. World Cup 2026 fixtures are available in API-Football
2. You have an API-Football account with API key
3. You're ready to start consuming API requests (100/day free tier)

## Prerequisites

1. **API-Football Account**
   - Sign up at [api-football.com](https://api-football.com)
   - Free tier: 100 requests/day
   - Get your API key from the dashboard

2. **Verify World Cup 2026 Availability**
   ```bash
   # Test endpoint
   curl -X GET \
     "https://v3.football.api-sports.io/leagues?id=1&season=2026" \
     -H "x-apisports-key: YOUR_API_KEY"
   ```

## Step 1: Add API Key to Environment

1. Open `.env.local`
2. Add your API key:
   ```env
   VITE_API_FOOTBALL_KEY=your_api_football_key_here
   ```

## Step 2: Create API Service

The API service is already structured in `src/services/apiFootball.ts`. Here's how to activate it:

```typescript
// src/services/apiFootball.ts
import { API_FOOTBALL_KEY, API_FOOTBALL_HOST } from '@/lib/constants'

const BASE_URL = `https://${API_FOOTBALL_HOST}`

interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, any>
  errors: any[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: T
}

export async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
      'x-apisports-host': API_FOOTBALL_HOST,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  const data: ApiFootballResponse<T> = await response.json()
  
  // Log API request to Supabase
  await logApiRequest(endpoint)
  
  return data.response
}

// Log API request to track daily usage
async function logApiRequest(endpoint: string) {
  const { supabase } = await import('@/lib/supabaseClient')
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await supabase
    .from('api_request_log')
    .select('*')
    .eq('endpoint', endpoint)
    .eq('request_date', today)
    .single()
  
  if (existing) {
    await supabase
      .from('api_request_log')
      .update({ 
        request_count: existing.request_count + 1,
        last_request_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('api_request_log')
      .insert({ endpoint, request_date: today })
  }
}

// World Cup 2026 Endpoints

export async function fetchWorldCupFixtures(date?: string) {
  let endpoint = '/fixtures?league=1&season=2026'
  if (date) endpoint += `&date=${date}`
  return fetchFromAPI(endpoint)
}

export async function fetchWorldCupStandings() {
  return fetchFromAPI('/standings?league=1&season=2026')
}

export async function fetchTeams() {
  return fetchFromAPI('/teams?league=1&season=2026')
}

export async function fetchFixtureById(fixtureId: number) {
  return fetchFromAPI(`/fixtures?id=${fixtureId}`)
}
```

## Step 3: Create Data Sync Service

Create a service to fetch from API and cache in Supabase:

```typescript
// src/services/dataSync.ts
import { supabase } from '@/lib/supabaseClient'
import * as apiFootball from './apiFootball'

export async function syncFixtures() {
  console.log('Syncing fixtures from API-Football...')
  
  // Fetch from API
  const fixtures = await apiFootball.fetchWorldCupFixtures()
  
  // Transform and insert into Supabase
  for (const fixture of fixtures) {
    const { data: homeTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('api_team_id', fixture.teams.home.id)
      .single()
    
    const { data: awayTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('api_team_id', fixture.teams.away.id)
      .single()
    
    await supabase.from('fixtures').upsert({
      api_fixture_id: fixture.fixture.id,
      home_team_id: homeTeam?.id,
      away_team_id: awayTeam?.id,
      match_date: fixture.fixture.date,
      venue: fixture.fixture.venue.name,
      status: fixture.fixture.status.short,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      round: fixture.league.round,
      group_name: extractGroupName(fixture.league.round),
    }, { onConflict: 'api_fixture_id' })
  }
  
  console.log('Fixtures synced successfully!')
}

export async function syncStandings() {
  console.log('Syncing standings from API-Football...')
  
  const standings = await apiFootball.fetchWorldCupStandings()
  
  for (const group of standings[0].league.standings) {
    for (const teamStanding of group) {
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('api_team_id', teamStanding.team.id)
        .single()
      
      if (team) {
        await supabase.from('standings').upsert({
          team_id: team.id,
          group_name: teamStanding.group.replace('Group ', ''),
          rank: teamStanding.rank,
          points: teamStanding.points,
          played: teamStanding.all.played,
          wins: teamStanding.all.win,
          draws: teamStanding.all.draw,
          losses: teamStanding.all.lose,
          goals_for: teamStanding.all.goals.for,
          goals_against: teamStanding.all.goals.against,
          goal_difference: teamStanding.goalsDiff,
        }, { onConflict: 'team_id,group_name' })
      }
    }
  }
  
  console.log('Standings synced successfully!')
}

function extractGroupName(round: string): string | null {
  const match = round.match(/Group ([A-H])/)
  return match ? match[1] : null
}
```

## Step 4: Create Vercel Serverless Functions

Create API endpoints in the `api/` folder:

### `api/update-fixtures.ts`
```typescript
import { syncFixtures } from '../src/services/dataSync'

export default async function handler(req, res) {
  try {
    await syncFixtures()
    res.status(200).json({ success: true, message: 'Fixtures updated' })
  } catch (error) {
    console.error('Error updating fixtures:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
```

### `api/update-standings.ts`
```typescript
import { syncStandings } from '../src/services/dataSync'

export default async function handler(req, res) {
  try {
    await syncStandings()
    res.status(200).json({ success: true, message: 'Standings updated' })
  } catch (error) {
    console.error('Error updating standings:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
```

## Step 5: Setup Vercel Cron Jobs

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/update-fixtures",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/update-standings",
      "schedule": "0 23 * * *"
    }
  ]
}
```

This will:
- Update fixtures daily at 6 AM
- Update standings daily at 11 PM

## Step 6: Update React Hooks

Modify your data hooks to fetch from Supabase (not API directly):

```typescript
// src/hooks/useFixtures.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useFixtures() {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .order('match_date', { ascending: true })
      
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTodayFixtures() {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['fixtures', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .gte('match_date', `${today}T00:00:00`)
        .lt('match_date', `${today}T23:59:59`)
        .order('match_date', { ascending: true })
      
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
```

## Step 7: Initial Data Population

Run this once to populate your database:

```bash
# Create a one-time sync script
node scripts/initial-sync.js
```

```javascript
// scripts/initial-sync.js
import { syncFixtures, syncStandings } from '../src/services/dataSync'

async function main() {
  console.log('Starting initial sync...')
  
  await syncFixtures()
  await syncStandings()
  
  console.log('Initial sync complete!')
}

main()
```

## API Request Budget Management

With 100 requests/day, allocate wisely:

### Non-Match Days (~10 requests)
- 1 request: Morning fixture check
- 1 request: Evening standings update
- 8 requests: Reserve

### Match Days (~50-80 requests)
- 1 request: Morning fixture list
- 40-70 requests: Live match updates (every 5-10 min during matches)
- 1 request: Evening standings
- Remaining: Reserve

### Tips to Optimize
1. **Cache aggressively**: Store everything in Supabase
2. **Smart polling**: Only update live matches, not all fixtures
3. **Off-peak updates**: Sync during low-traffic hours
4. **Batch requests**: Get multiple fixtures in one call when possible

## Monitoring API Usage

Check your usage in the Admin Panel:

```typescript
// Admin API Monitor Component
export function ApiMonitor() {
  const { data: logs } = useQuery({
    queryKey: ['api-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_request_log')
        .select('*')
        .order('request_date', { ascending: false })
        .limit(30)
      return data
    }
  })
  
  const todayCount = logs?.reduce((sum, log) => {
    const isToday = log.request_date === new Date().toISOString().split('T')[0]
    return isToday ? sum + log.request_count : sum
  }, 0)
  
  return (
    <div>
      <h3>API Usage Today: {todayCount} / 100</h3>
      {todayCount > 80 && <p>⚠️ Warning: Approaching daily limit!</p>}
      {/* Show logs table */}
    </div>
  )
}
```

## Rollback to Mock Data

If you need to go back to mock data:
1. Remove API key from `.env.local`
2. Use mock data service instead of API calls
3. Disable Vercel cron jobs

## Troubleshooting

### "API key invalid"
- Check that your API key is correct
- Verify it's active in API-Football dashboard

### "Rate limit exceeded"
- Check `api_request_log` table for today's usage
- Wait until next day (resets at midnight UTC)
- Consider upgrading to a paid plan

### "No data found"
- Verify World Cup 2026 is available in API
- Check league ID and season are correct
- Look at API response in browser dev tools

---

**Ready to integrate?** Follow the steps above when World Cup 2026 data is available!
