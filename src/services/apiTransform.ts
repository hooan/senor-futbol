import type { ApiFixture, ApiStanding, ApiFixtureEvent, ApiFixtureLineup, ApiFixtureStatistic, ApiSquadPlayer } from '@/types/apiFootball'
import type { Fixture, Team, Standing, MatchStatus, MatchEvent, MatchLineup, MatchStatistic, Player } from '@/types/database'

// Map API-Football status codes to our database status
export function mapApiStatus(apiStatus: string): MatchStatus {
  const statusMap: Record<string, MatchStatus> = {
    'TBD': 'NS',      // Time to be defined
    'NS': 'NS',       // Not started
    '1H': 'LIVE',     // First half
    'HT': 'HT',       // Halftime
    '2H': 'LIVE',     // Second half
    'ET': 'LIVE',     // Extra time
    'P': 'LIVE',      // Penalty shootout
    'FT': 'FT',       // Finished
    'AET': 'FT',      // Finished after extra time
    'PEN': 'FT',      // Finished after penalties
    'BT': 'FT',       // Break time (in extra time)
    'SUSP': 'PST',    // Match suspended
    'INT': 'PST',     // Match interrupted
    'PST': 'PST',     // Match postponed
    'CANC': 'CANC',   // Match cancelled
    'ABD': 'CANC',    // Match abandoned
    'AWD': 'FT',      // Technical loss
    'WO': 'FT',       // Walk over
  }

  return statusMap[apiStatus] || 'NS'
}

// Extract group name from round string
// Examples: "Group A" → "A", "Quarter-finals" → null
export function extractGroupName(round: string): string | null {
  const groupMatch = round.match(/Group ([A-Z])/i)
  if (groupMatch) {
    return groupMatch[1].toUpperCase()
  }
  return null
}

// Determine round type
export function getRoundType(round: string): string {
  const roundLower = round.toLowerCase()
  
  if (roundLower.includes('group')) return 'Group Stage'
  if (roundLower.includes('round of 32') || roundLower.includes('16th finals')) return 'Round of 32'
  if (roundLower.includes('round of 16') || roundLower.includes('8th finals')) return 'Round of 16'
  if (roundLower.includes('quarter') || roundLower.includes('4th finals')) return 'Quarter Finals'
  if (roundLower.includes('semi') || roundLower.includes('semi-finals')) return 'Semi Finals'
  if (roundLower.includes('3rd place') || roundLower.includes('third place')) return 'Third Place'
  if (roundLower.includes('final')) return 'Final'
  
  return round
}

// Transform API fixture to database format
export function transformFixture(
  apiFixture: ApiFixture,
  tournamentId: string,
  homeTeamId: string,
  awayTeamId: string
): Omit<Fixture, 'home_team' | 'away_team'> {
  const round = getRoundType(apiFixture.league.round)
  const groupName = extractGroupName(apiFixture.league.round)
  const venue = apiFixture.fixture.venue.name || 'TBD'
  
  return {
    id: crypto.randomUUID(),
    api_fixture_id: apiFixture.fixture.id,
    tournament_id: tournamentId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    match_date: apiFixture.fixture.date,
    venue: venue,
    referee: apiFixture.fixture.referee,
    status: mapApiStatus(apiFixture.fixture.status.short),
    home_score: apiFixture.goals.home,
    away_score: apiFixture.goals.away,
    round: round,
    group_name: groupName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Extract unique teams from fixtures
export function extractTeamsFromFixtures(
  apiFixtures: ApiFixture[],
  tournamentId: string
): Team[] {
  const teamMap = new Map<number, Team>()

  apiFixtures.forEach(fixture => {
    // Home team
    if (!teamMap.has(fixture.teams.home.id)) {
      teamMap.set(fixture.teams.home.id, {
        id: crypto.randomUUID(),
        api_team_id: fixture.teams.home.id,
        tournament_id: tournamentId,
        name: fixture.teams.home.name,
        code: fixture.teams.home.name.substring(0, 3).toUpperCase(),
        group_name: null,
        logo_url: fixture.teams.home.logo,
        created_at: new Date().toISOString(),
      })
    }

    // Away team
    if (!teamMap.has(fixture.teams.away.id)) {
      teamMap.set(fixture.teams.away.id, {
        id: crypto.randomUUID(),
        api_team_id: fixture.teams.away.id,
        tournament_id: tournamentId,
        name: fixture.teams.away.name,
        code: fixture.teams.away.name.substring(0, 3).toUpperCase(),
        group_name: null,
        logo_url: fixture.teams.away.logo,
        created_at: new Date().toISOString(),
      })
    }
  })

  return Array.from(teamMap.values())
}

// Transform API standing to database format
export function transformStanding(
  apiStanding: ApiStanding,
  teamId: string,
  groupName: string
): Standing {
  return {
    id: crypto.randomUUID(),
    team_id: teamId,
    group_name: groupName,
    rank: apiStanding.rank,
    points: apiStanding.points,
    played: apiStanding.all.played,
    wins: apiStanding.all.win,
    draws: apiStanding.all.draw,
    losses: apiStanding.all.lose,
    goals_for: apiStanding.all.goals.for,
    goals_against: apiStanding.all.goals.against,
    goal_difference: apiStanding.goalsDiff,
    updated_at: new Date().toISOString(),
  }
}

// Calculate standings from fixtures (when API doesn't provide)
export function calculateStandingsFromFixtures(
  fixtures: Array<Omit<Fixture, 'home_team' | 'away_team'>>,
  _teams: Team[]
): Standing[] {
  // Only calculate for finished group stage matches
  const groupFixtures = fixtures.filter(
    f => f.status === 'FT' && f.group_name !== null
  )

  // Group teams by group
  const groupMap = new Map<string, Set<string>>()
  groupFixtures.forEach(fixture => {
    if (fixture.group_name) {
      if (!groupMap.has(fixture.group_name)) {
        groupMap.set(fixture.group_name, new Set())
      }
      groupMap.get(fixture.group_name)!.add(fixture.home_team_id)
      groupMap.get(fixture.group_name)!.add(fixture.away_team_id)
    }
  })

  const standings: Standing[] = []

  // Calculate standings for each group
  groupMap.forEach((teamIds, groupName) => {
    const groupStandings: Array<{
      teamId: string
      played: number
      wins: number
      draws: number
      losses: number
      goalsFor: number
      goalsAgainst: number
      goalDifference: number
      points: number
    }> = []

    teamIds.forEach(teamId => {
      const teamFixtures = groupFixtures.filter(
        f => f.group_name === groupName && (f.home_team_id === teamId || f.away_team_id === teamId)
      )

      let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0

      teamFixtures.forEach(fixture => {
        const isHome = fixture.home_team_id === teamId
        const teamScore = isHome ? (fixture.home_score || 0) : (fixture.away_score || 0)
        const oppScore = isHome ? (fixture.away_score || 0) : (fixture.home_score || 0)

        goalsFor += teamScore
        goalsAgainst += oppScore

        if (teamScore > oppScore) wins++
        else if (teamScore === oppScore) draws++
        else losses++
      })

      const points = wins * 3 + draws

      groupStandings.push({
        teamId,
        played: teamFixtures.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points,
      })
    })

    // Sort by points, goal difference, goals for
    groupStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    // Create standing records with ranks
    groupStandings.forEach((standing, index) => {
      standings.push({
        id: crypto.randomUUID(),
        team_id: standing.teamId,
        group_name: groupName,
        rank: index + 1,
        points: standing.points,
        played: standing.played,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        goals_for: standing.goalsFor,
        goals_against: standing.goalsAgainst,
        goal_difference: standing.goalDifference,
        updated_at: new Date().toISOString(),
      })
    })
  })

  return standings
}

// Transform match events (goals, cards, subs, VAR)
export function transformMatchEvents(
  events: ApiFixtureEvent[],
  fixtureId: string,
  teamIdMap: Map<number, string>
): MatchEvent[] {
  if (!events || events.length === 0) return []

  const result: MatchEvent[] = []

  events.forEach((event) => {
    const teamId = teamIdMap.get(event.team.id)
    if (!teamId) return

    result.push({
      id: crypto.randomUUID(),
      fixture_id: fixtureId,
      team_id: teamId,
      time_elapsed: event.time.elapsed,
      time_extra: event.time.extra,
      player_name: event.player.name,
      api_player_id: event.player.id,
      assist_name: event.assist.name,
      assist_api_player_id: event.assist.id,
      event_type: event.type.toLowerCase(), // 'goal', 'card', 'subst', 'var'
      detail: event.detail,
      comments: event.comments,
      created_at: new Date().toISOString(),
    })
  })

  return result
}

// Transform match lineups (starting XI + substitutes)
export function transformMatchLineups(
  lineups: ApiFixtureLineup[],
  fixtureId: string,
  teamIdMap: Map<number, string>
): MatchLineup[] {
  if (!lineups || lineups.length === 0) return []

  const result: MatchLineup[] = []

  lineups.forEach((lineup) => {
    const teamId = teamIdMap.get(lineup.team.id)
    if (!teamId) return

    // Starting XI
    lineup.startXI.forEach((starter) => {
      result.push({
        id: crypto.randomUUID(),
        fixture_id: fixtureId,
        team_id: teamId,
        formation: lineup.formation,
        player_name: starter.player.name,
        player_number: starter.player.number,
        api_player_id: starter.player.id,
        position: starter.player.pos,
        grid_position: starter.player.grid,
        is_starter: true,
        created_at: new Date().toISOString(),
      })
    })

    // Substitutes
    lineup.substitutes.forEach((sub) => {
      result.push({
        id: crypto.randomUUID(),
        fixture_id: fixtureId,
        team_id: teamId,
        formation: lineup.formation,
        player_name: sub.player.name,
        player_number: sub.player.number,
        api_player_id: sub.player.id,
        position: sub.player.pos,
        grid_position: sub.player.grid,
        is_starter: false,
        created_at: new Date().toISOString(),
      })
    })
  })

  return result
}

// Transform match statistics
export function transformMatchStatistics(
  statistics: ApiFixtureStatistic[],
  fixtureId: string,
  teamIdMap: Map<number, string>
): MatchStatistic[] {
  if (!statistics || statistics.length === 0) return []

  const result: MatchStatistic[] = []

  statistics.forEach((teamStats) => {
    const teamId = teamIdMap.get(teamStats.team.id)
    if (!teamId) return

    teamStats.statistics.forEach((stat) => {
      // Skip null/undefined values
      if (stat.value === null || stat.value === undefined) return

      result.push({
        id: crypto.randomUUID(),
        fixture_id: fixtureId,
        team_id: teamId,
        stat_type: stat.type,
        stat_value: String(stat.value), // Convert to string for storage
        created_at: new Date().toISOString(),
      })
    })
  })

  return result
}

// Transform team squad/roster players
export function transformSquadPlayers(
  players: ApiSquadPlayer[],
  teamId: string
): Player[] {
  if (!players || players.length === 0) return []

  return players.map((player) => ({
    id: crypto.randomUUID(),
    api_player_id: player.id,
    team_id: teamId,
    name: player.name,
    age: player.age,
    number: player.number,
    position: player.position,
    photo_url: player.photo,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}
