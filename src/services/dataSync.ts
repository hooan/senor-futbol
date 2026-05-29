import { supabase } from '@/lib/supabaseClient'
import { apiFootball } from './apiFootball'
import {
  transformFixture,
  extractTeamsFromFixtures,
  calculateStandingsFromFixtures,
  transformMatchEvents,
  transformMatchLineups,
  transformMatchStatistics,
  transformSquadPlayers,
} from './apiTransform'
import type { Team, Fixture, Standing, Tournament, MatchEvent, MatchLineup, MatchStatistic, Player } from '@/types/database'
import type { ApiFixture } from '@/types/apiFootball'

export interface SyncResult {
  success: boolean
  tournament: Tournament | null
  teamsImported: number
  fixturesImported: number
  standingsImported: number
  eventsImported: number
  lineupsImported: number
  statisticsImported: number
  playersImported: number
  errors: string[]
  apiRequestsUsed: number
}

export type ProgressCallback = (message: string) => void

export class DataSyncService {
  private errors: string[] = []
  private apiRequestsStart: number = 0

  async syncTournament(
    leagueId: number,
    season: number,
    tournamentName?: string,
    onProgress?: ProgressCallback
  ): Promise<SyncResult> {
    this.errors = []
    this.apiRequestsStart = apiFootball.getRequestCount()

    const progress = (msg: string) => {
      console.log(`[DataSync] ${msg}`)
      if (onProgress) onProgress(msg)
    }

    try {
      // Step 1: Fetch league info
      progress(`Fetching league info for ${leagueId}...`)
      const league = await apiFootball.getLeague(leagueId)
      
      if (!league) {
        throw new Error(`League ${leagueId} not found`)
      }

      const name = tournamentName || `${league.league.name} ${season}`
      
      // Step 2: Create tournament record
      progress(`Creating tournament: ${name}`)
      const tournament = await this.createTournament(leagueId, season, name, league.league.logo)

      // Step 3: Fetch fixtures from API
      progress(`Fetching fixtures from API...`)
      const apiFixtures = await apiFootball.getFixturesByLeague(leagueId, season)
      
      if (apiFixtures.length === 0) {
        throw new Error(`No fixtures found for league ${leagueId}, season ${season}`)
      }

      progress(`Found ${apiFixtures.length} fixtures`)

      // Step 4: Extract teams from fixtures
      progress(`Extracting teams from fixtures...`)
      const teams = extractTeamsFromFixtures(apiFixtures, tournament.id)
      progress(`Found ${teams.length} unique teams`)

      // Step 5: Insert teams into database
      progress(`Importing teams to database...`)
      const importedTeams = await this.upsertTeams(teams)

      // Step 6: Fetch team rosters (squads)
      progress(`Fetching team rosters...`)
      const players = await this.syncTeamRosters(importedTeams, progress)

      // Step 7: Transform and insert fixtures
      progress(`Transforming and importing fixtures...`)
      const fixtures = this.transformFixtures(apiFixtures, tournament.id, importedTeams)
      const importedFixtures = await this.upsertFixtures(fixtures)

      // Step 8: Fetch match details for finished matches
      progress(`Fetching match details for finished matches...`)
      const { events, lineups, statistics } = await this.syncMatchDetails(
        importedFixtures,
        importedTeams,
        progress
      )

      // Step 9: Calculate and insert standings
      progress(`Calculating standings...`)
      const standings = calculateStandingsFromFixtures(fixtures, importedTeams)
      const importedStandings = await this.upsertStandings(standings)

      const apiRequestsUsed = apiFootball.getRequestCount() - this.apiRequestsStart

      progress(`✓ Import complete! Used ${apiRequestsUsed} API requests`)

      return {
        success: true,
        tournament,
        teamsImported: importedTeams.length,
        fixturesImported: importedFixtures.length,
        standingsImported: importedStandings.length,
        eventsImported: events,
        lineupsImported: lineups,
        statisticsImported: statistics,
        playersImported: players,
        errors: this.errors,
        apiRequestsUsed,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      this.errors.push(errorMsg)
      progress(`✗ Error: ${errorMsg}`)
      
      return {
        success: false,
        tournament: null,
        teamsImported: 0,
        fixturesImported: 0,
        standingsImported: 0,
        eventsImported: 0,
        lineupsImported: 0,
        statisticsImported: 0,
        playersImported: 0,
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
    const tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'> = {
      api_league_id: apiLeagueId,
      season,
      name,
      description: `Imported from API-Football`,
      start_date: null,
      end_date: null,
      logo_url: logoUrl,
    }

    // ignoreDuplicates: true means "do nothing on conflict" — preserves the
    // existing id so FK references from teams/fixtures are not broken.
    const { error: upsertError } = await supabase
      .from('tournaments')
      .upsert(tournament, {
        onConflict: 'api_league_id,season',
        ignoreDuplicates: true,
      })

    if (upsertError) {
      throw new Error(`Failed to create tournament: ${upsertError.message}`)
    }

    // Fetch the row (whether freshly inserted or already existing).
    const { data, error: fetchError } = await supabase
      .from('tournaments')
      .select()
      .eq('api_league_id', apiLeagueId)
      .eq('season', season)
      .single()

    if (fetchError || !data) {
      throw new Error(`Failed to fetch tournament after upsert: ${fetchError?.message}`)
    }

    return data
  }

  private async upsertTeams(teams: Team[]): Promise<Team[]> {
    if (teams.length === 0) return []

    // ignoreDuplicates: true preserves existing ids so FK references from
    // fixtures (home_team_id / away_team_id) are never broken on re-import.
    const { error } = await supabase
      .from('teams')
      .upsert(teams, {
        onConflict: 'api_team_id,tournament_id',
        ignoreDuplicates: true,
      })

    if (error) {
      throw new Error(`Failed to import teams: ${error.message}`)
    }

    // Fetch back all teams for this tournament to get their real db ids.
    const tournamentId = teams[0].tournament_id
    const { data: fetched, error: fetchError } = await supabase
      .from('teams')
      .select()
      .eq('tournament_id', tournamentId)

    if (fetchError) {
      throw new Error(`Failed to fetch teams after upsert: ${fetchError.message}`)
    }

    return fetched || []
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

    // ignoreDuplicates: true preserves existing ids so FK references from
    // quiniela_predictions (fixture_id) are never broken on re-import.
    const { error } = await supabase
      .from('fixtures')
      .upsert(fixtures, {
        onConflict: 'api_fixture_id',
        ignoreDuplicates: true,
      })

    if (error) {
      throw new Error(`Failed to import fixtures: ${error.message}`)
    }

    // Fetch back all fixtures for this tournament.
    const tournamentId = fixtures[0].tournament_id
    const { data: fetched, error: fetchError } = await supabase
      .from('fixtures')
      .select()
      .eq('tournament_id', tournamentId)

    if (fetchError) {
      throw new Error(`Failed to fetch fixtures after upsert: ${fetchError.message}`)
    }

    return fetched || []
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

  // Sync team rosters (squads)
  private async syncTeamRosters(
    teams: Team[],
    progress: (msg: string) => void
  ): Promise<number> {
    let totalPlayers = 0

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]
      if (!team.api_team_id) continue

      progress(`Fetching roster for ${team.name} (${i + 1}/${teams.length})...`)

      try {
        const squadPlayers = await apiFootball.getTeamSquad(team.api_team_id)
        
        if (squadPlayers.length === 0) {
          progress(`No roster found for ${team.name}`)
          continue
        }

        const players = transformSquadPlayers(squadPlayers, team.id)
        const imported = await this.upsertPlayers(players)
        totalPlayers += imported.length

        progress(`Imported ${imported.length} players for ${team.name}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.errors.push(`Failed to fetch roster for ${team.name}: ${errorMsg}`)
        progress(`Error fetching roster for ${team.name}`)
      }
    }

    return totalPlayers
  }

  // Sync match details (events, lineups, statistics) for finished matches
  private async syncMatchDetails(
    fixtures: Array<Omit<Fixture, 'home_team' | 'away_team'>>,
    teams: Team[],
    progress: (msg: string) => void
  ): Promise<{ events: number; lineups: number; statistics: number }> {
    // Only fetch details for finished matches
    const finishedFixtures = fixtures.filter((f) => f.status === 'FT')

    if (finishedFixtures.length === 0) {
      progress('No finished matches to fetch details for')
      return { events: 0, lineups: 0, statistics: 0 }
    }

    progress(`Fetching details for ${finishedFixtures.length} finished matches...`)

    // Create team ID map
    const teamIdMap = new Map<number, string>()
    teams.forEach((team) => {
      if (team.api_team_id) {
        teamIdMap.set(team.api_team_id, team.id)
      }
    })

    let totalEvents = 0
    let totalLineups = 0
    let totalStatistics = 0

    for (let i = 0; i < finishedFixtures.length; i++) {
      const fixture = finishedFixtures[i]
      if (!fixture.api_fixture_id) continue

      progress(`Fetching match details (${i + 1}/${finishedFixtures.length})...`)

      try {
        const detail = await apiFootball.getFixtureDetail(fixture.api_fixture_id)

        if (!detail) {
          progress(`No details found for fixture ${fixture.api_fixture_id}`)
          continue
        }

        // Transform and insert events
        if (detail.events && detail.events.length > 0) {
          const events = transformMatchEvents(detail.events, fixture.id, teamIdMap)
          const imported = await this.upsertMatchEvents(events)
          totalEvents += imported.length
        }

        // Transform and insert lineups
        if (detail.lineups && detail.lineups.length > 0) {
          const lineups = transformMatchLineups(detail.lineups, fixture.id, teamIdMap)
          const imported = await this.upsertMatchLineups(lineups)
          totalLineups += imported.length
        }

        // Transform and insert statistics
        if (detail.statistics && detail.statistics.length > 0) {
          const statistics = transformMatchStatistics(detail.statistics, fixture.id, teamIdMap)
          const imported = await this.upsertMatchStatistics(statistics)
          totalStatistics += imported.length
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        this.errors.push(`Failed to fetch details for fixture ${fixture.api_fixture_id}: ${errorMsg}`)
        progress(`Error fetching details for match ${i + 1}`)
      }
    }

    progress(
      `Imported ${totalEvents} events, ${totalLineups} lineup entries, ${totalStatistics} statistics`
    )

    return { events: totalEvents, lineups: totalLineups, statistics: totalStatistics }
  }

  private async upsertPlayers(players: Player[]): Promise<Player[]> {
    if (players.length === 0) return []

    // ignoreDuplicates: true preserves existing player ids on re-import.
    const { error } = await supabase
      .from('players')
      .upsert(players, {
        onConflict: 'api_player_id,team_id',
        ignoreDuplicates: true,
      })

    if (error) {
      throw new Error(`Failed to import players: ${error.message}`)
    }

    const teamId = players[0].team_id
    const { data: fetched, error: fetchError } = await supabase
      .from('players')
      .select()
      .eq('team_id', teamId)

    if (fetchError) {
      throw new Error(`Failed to fetch players after upsert: ${fetchError.message}`)
    }

    return fetched || []
  }

  private async upsertMatchEvents(events: MatchEvent[]): Promise<MatchEvent[]> {
    if (events.length === 0) return []

    // Delete existing events for these fixtures to avoid duplicates
    const fixtureIds = [...new Set(events.map((e) => e.fixture_id))]
    await supabase.from('match_events').delete().in('fixture_id', fixtureIds)

    const { data, error } = await supabase.from('match_events').insert(events).select()

    if (error) {
      throw new Error(`Failed to import match events: ${error.message}`)
    }

    return data || []
  }

  private async upsertMatchLineups(lineups: MatchLineup[]): Promise<MatchLineup[]> {
    if (lineups.length === 0) return []

    // Delete existing lineups for these fixtures
    const fixtureIds = [...new Set(lineups.map((l) => l.fixture_id))]
    await supabase.from('match_lineups').delete().in('fixture_id', fixtureIds)

    const { data, error } = await supabase.from('match_lineups').insert(lineups).select()

    if (error) {
      throw new Error(`Failed to import match lineups: ${error.message}`)
    }

    return data || []
  }

  private async upsertMatchStatistics(statistics: MatchStatistic[]): Promise<MatchStatistic[]> {
    if (statistics.length === 0) return []

    // Delete existing statistics for these fixtures
    const fixtureIds = [...new Set(statistics.map((s) => s.fixture_id))]
    await supabase.from('match_statistics').delete().in('fixture_id', fixtureIds)

    const { data, error } = await supabase.from('match_statistics').insert(statistics).select()

    if (error) {
      throw new Error(`Failed to import match statistics: ${error.message}`)
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
