import { supabase } from '@/lib/supabaseClient'
import { apiFootball } from './apiFootball'
import {
  transformFixture,
  extractTeamsFromFixtures,
  calculateStandingsFromFixtures,
} from './apiTransform'
import type { Team, Fixture, Standing, Tournament } from '@/types/database'
import type { ApiFixture } from '@/types/apiFootball'

export interface SyncResult {
  success: boolean
  tournament: Tournament | null
  teamsImported: number
  fixturesImported: number
  standingsImported: number
  errors: string[]
  apiRequestsUsed: number
}

export class DataSyncService {
  private errors: string[] = []
  private apiRequestsStart: number = 0

  async syncTournament(
    leagueId: number,
    season: number,
    tournamentName?: string
  ): Promise<SyncResult> {
    this.errors = []
    this.apiRequestsStart = apiFootball.getRequestCount()

    try {
      // Step 1: Fetch league info
      console.log(`Fetching league info for ${leagueId}...`)
      const league = await apiFootball.getLeague(leagueId)
      
      if (!league) {
        throw new Error(`League ${leagueId} not found`)
      }

      const name = tournamentName || `${league.league.name} ${season}`
      
      // Step 2: Create tournament record
      console.log(`Creating tournament: ${name}`)
      const tournament = await this.createTournament(leagueId, season, name, league.league.logo)

      // Step 3: Fetch fixtures from API
      console.log(`Fetching fixtures from API...`)
      const apiFixtures = await apiFootball.getFixturesByLeague(leagueId, season)
      
      if (apiFixtures.length === 0) {
        throw new Error(`No fixtures found for league ${leagueId}, season ${season}`)
      }

      console.log(`Found ${apiFixtures.length} fixtures`)

      // Step 4: Extract teams from fixtures
      console.log(`Extracting teams from fixtures...`)
      const teams = extractTeamsFromFixtures(apiFixtures, tournament.id)
      console.log(`Found ${teams.length} unique teams`)

      // Step 5: Insert teams into database
      console.log(`Importing teams to database...`)
      const importedTeams = await this.upsertTeams(teams)

      // Step 6: Transform and insert fixtures
      console.log(`Transforming and importing fixtures...`)
      const fixtures = this.transformFixtures(apiFixtures, tournament.id, importedTeams)
      const importedFixtures = await this.upsertFixtures(fixtures)

      // Step 7: Calculate and insert standings
      console.log(`Calculating standings...`)
      const standings = calculateStandingsFromFixtures(fixtures, importedTeams)
      const importedStandings = await this.upsertStandings(standings)

      const apiRequestsUsed = apiFootball.getRequestCount() - this.apiRequestsStart

      return {
        success: true,
        tournament,
        teamsImported: importedTeams.length,
        fixturesImported: importedFixtures.length,
        standingsImported: importedStandings.length,
        errors: this.errors,
        apiRequestsUsed,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      this.errors.push(errorMsg)
      
      return {
        success: false,
        tournament: null,
        teamsImported: 0,
        fixturesImported: 0,
        standingsImported: 0,
        errors: this.errors,
        apiRequestsUsed: apiFootball.getRequestCount() - this.apiRequestsStart,
      }
    }
  }

  private async createTournament(
    apiLeagueId: number,
    season: number,
    name: string,
    logoUrl: string
  ): Promise<Tournament> {
    const tournament: Omit<Tournament, 'created_at' | 'updated_at'> = {
      id: crypto.randomUUID(),
      api_league_id: apiLeagueId,
      season,
      name,
      description: `Imported from API-Football`,
      start_date: null,
      end_date: null,
      logo_url: logoUrl,
    }

    const { data, error } = await supabase
      .from('tournaments')
      .upsert(tournament, {
        onConflict: 'api_league_id,season',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create tournament: ${error.message}`)
    }

    return data
  }

  private async upsertTeams(teams: Team[]): Promise<Team[]> {
    if (teams.length === 0) return []

    const { data, error } = await supabase
      .from('teams')
      .upsert(teams, {
        onConflict: 'api_team_id,tournament_id',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      throw new Error(`Failed to import teams: ${error.message}`)
    }

    return data || []
  }

  private transformFixtures(
    apiFixtures: ApiFixture[],
    tournamentId: string,
    teams: Team[]
  ): Array<Omit<Fixture, 'home_team' | 'away_team'>> {
    // Create map of api_team_id to team id
    const teamIdMap = new Map<number, string>()
    teams.forEach(team => {
      if (team.api_team_id) {
        teamIdMap.set(team.api_team_id, team.id)
      }
    })

    return apiFixtures.map(apiFixture => {
      const homeTeamId = teamIdMap.get(apiFixture.teams.home.id)
      const awayTeamId = teamIdMap.get(apiFixture.teams.away.id)

      if (!homeTeamId || !awayTeamId) {
        throw new Error(`Team not found for fixture ${apiFixture.fixture.id}`)
      }

      return transformFixture(apiFixture, tournamentId, homeTeamId, awayTeamId)
    })
  }

  private async upsertFixtures(
    fixtures: Array<Omit<Fixture, 'home_team' | 'away_team'>>
  ): Promise<Array<Omit<Fixture, 'home_team' | 'away_team'>>> {
    if (fixtures.length === 0) return []

    const { data, error } = await supabase
      .from('fixtures')
      .upsert(fixtures, {
        onConflict: 'api_fixture_id',
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      throw new Error(`Failed to import fixtures: ${error.message}`)
    }

    return data || []
  }

  private async upsertStandings(standings: Standing[]): Promise<Standing[]> {
    if (standings.length === 0) return []

    // Delete existing standings for this group to avoid conflicts
    const groups = [...new Set(standings.map(s => s.group_name))]
    const teamIds = standings.map(s => s.team_id)

    await supabase
      .from('standings')
      .delete()
      .in('team_id', teamIds)
      .in('group_name', groups)

    const { data, error } = await supabase
      .from('standings')
      .insert(standings)
      .select()

    if (error) {
      throw new Error(`Failed to import standings: ${error.message}`)
    }

    return data || []
  }

  async getActiveTournament(): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('season', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Failed to fetch active tournament:', error)
      return null
    }

    return data
  }

  async getAllTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('season', { ascending: false })

    if (error) {
      console.error('Failed to fetch tournaments:', error)
      return []
    }

    return data || []
  }
}

export const dataSyncService = new DataSyncService()
