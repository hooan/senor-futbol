import { Fixture, FixtureWithTeams } from '@/types/database'
import { mockTeams, groupAssignments } from './mockTeams'

// World Cup 2026 dates (June 11 - July 19, 2026)
const tournamentStart = new Date('2026-06-11T12:00:00Z')

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper to create fixture
function createFixture(
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  matchDate: Date,
  round: string,
  groupName: string | null,
  venue: string,
  status: 'NS' | 'FT' = 'NS',
  homeScore: number | null = null,
  awayScore: number | null = null
): Fixture {
  return {
    id,
    api_fixture_id: null,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    match_date: matchDate.toISOString(),
    venue,
    referee: null,
    status,
    home_score: homeScore,
    away_score: awayScore,
    round,
    group_name: groupName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Venues (16 host cities)
const venues = [
  'MetLife Stadium, New Jersey',
  'AT&T Stadium, Texas',
  'Rose Bowl, California',
  'SoFi Stadium, California',
  'Arrowhead Stadium, Kansas City',
  'Mercedes-Benz Stadium, Atlanta',
  'Lincoln Financial Field, Philadelphia',
  'Hard Rock Stadium, Miami',
  'Levi\'s Stadium, San Francisco',
  'NRG Stadium, Houston',
  'Gillette Stadium, Massachusetts',
  'Lumen Field, Seattle',
  'BC Place, Vancouver',
  'BMO Field, Toronto',
  'Estadio Azteca, Mexico City',
  'Estadio Akron, Guadalajara',
]

let fixtureId = 1

// GROUP STAGE FIXTURES (48 matches)
const groupStageFixtures: Fixture[] = []

// Generate group stage matches (each group has 6 matches)
Object.entries(groupAssignments).forEach(([group, teamIds], groupIndex) => {
  const matchday1Date = addDays(tournamentStart, groupIndex) // Spread groups across days
  const matchday2Date = addDays(matchday1Date, 4)
  const matchday3Date = addDays(matchday2Date, 4)
  
  // Matchday 1
  groupStageFixtures.push(
    createFixture(
      String(fixtureId++),
      teamIds[0],
      teamIds[1],
      new Date(matchday1Date.setHours(15, 0, 0, 0)),
      'Group Stage',
      group,
      venues[groupIndex * 2]
    ),
    createFixture(
      String(fixtureId++),
      teamIds[2],
      teamIds[3],
      new Date(matchday1Date.setHours(18, 0, 0, 0)),
      'Group Stage',
      group,
      venues[groupIndex * 2 + 1]
    )
  )
  
  // Matchday 2
  groupStageFixtures.push(
    createFixture(
      String(fixtureId++),
      teamIds[0],
      teamIds[2],
      new Date(matchday2Date.setHours(15, 0, 0, 0)),
      'Group Stage',
      group,
      venues[(groupIndex * 2 + 2) % venues.length]
    ),
    createFixture(
      String(fixtureId++),
      teamIds[3],
      teamIds[1],
      new Date(matchday2Date.setHours(18, 0, 0, 0)),
      'Group Stage',
      group,
      venues[(groupIndex * 2 + 3) % venues.length]
    )
  )
  
  // Matchday 3 (decisive)
  groupStageFixtures.push(
    createFixture(
      String(fixtureId++),
      teamIds[3],
      teamIds[0],
      new Date(matchday3Date.setHours(15, 0, 0, 0)),
      'Group Stage',
      group,
      venues[(groupIndex * 2 + 4) % venues.length]
    ),
    createFixture(
      String(fixtureId++),
      teamIds[1],
      teamIds[2],
      new Date(matchday3Date.setHours(15, 0, 0, 0)), // Same time for fairness
      'Group Stage',
      group,
      venues[(groupIndex * 2 + 5) % venues.length]
    )
  )
})

// KNOCKOUT STAGE (16 matches)
const knockoutStart = addDays(tournamentStart, 18) // After group stage

// Round of 16 (8 matches)
const round16Fixtures: Fixture[] = [
  createFixture(String(fixtureId++), '1', '2', addDays(knockoutStart, 0), 'Round of 16', null, venues[0]),
  createFixture(String(fixtureId++), '3', '4', addDays(knockoutStart, 0), 'Round of 16', null, venues[1]),
  createFixture(String(fixtureId++), '5', '6', addDays(knockoutStart, 1), 'Round of 16', null, venues[2]),
  createFixture(String(fixtureId++), '7', '8', addDays(knockoutStart, 1), 'Round of 16', null, venues[3]),
  createFixture(String(fixtureId++), '9', '10', addDays(knockoutStart, 2), 'Round of 16', null, venues[4]),
  createFixture(String(fixtureId++), '11', '12', addDays(knockoutStart, 2), 'Round of 16', null, venues[5]),
  createFixture(String(fixtureId++), '13', '14', addDays(knockoutStart, 3), 'Round of 16', null, venues[6]),
  createFixture(String(fixtureId++), '15', '16', addDays(knockoutStart, 3), 'Round of 16', null, venues[7]),
]

// Quarter Finals (4 matches)
const quarterStart = addDays(knockoutStart, 6)
const quarterFixtures: Fixture[] = [
  createFixture(String(fixtureId++), '1', '5', addDays(quarterStart, 0), 'Quarter Finals', null, venues[8]),
  createFixture(String(fixtureId++), '9', '13', addDays(quarterStart, 0), 'Quarter Finals', null, venues[9]),
  createFixture(String(fixtureId++), '2', '6', addDays(quarterStart, 1), 'Quarter Finals', null, venues[10]),
  createFixture(String(fixtureId++), '10', '14', addDays(quarterStart, 1), 'Quarter Finals', null, venues[11]),
]

// Semi Finals (2 matches)
const semiStart = addDays(quarterStart, 4)
const semiFixtures: Fixture[] = [
  createFixture(String(fixtureId++), '1', '2', addDays(semiStart, 0), 'Semi Finals', null, venues[12]),
  createFixture(String(fixtureId++), '9', '10', addDays(semiStart, 1), 'Semi Finals', null, venues[13]),
]

// Third Place (1 match)
const thirdPlaceDate = addDays(semiStart, 4)
const thirdPlaceFixture: Fixture[] = [
  createFixture(String(fixtureId++), '5', '6', thirdPlaceDate, 'Third Place', null, venues[14]),
]

// Final (1 match)
const finalDate = addDays(thirdPlaceDate, 1)
const finalFixture: Fixture[] = [
  createFixture(String(fixtureId++), '1', '10', finalDate, 'Final', null, venues[0]),
]

// Combine all fixtures
export const mockFixtures: Fixture[] = [
  ...groupStageFixtures,
  ...round16Fixtures,
  ...quarterFixtures,
  ...semiFixtures,
  ...thirdPlaceFixture,
  ...finalFixture,
]

// Helper to get fixtures with team data
export function getFixturesWithTeams(): FixtureWithTeams[] {
  return mockFixtures.map(fixture => ({
    ...fixture,
    home_team: mockTeams.find(t => t.id === fixture.home_team_id)!,
    away_team: mockTeams.find(t => t.id === fixture.away_team_id)!,
  }))
}

// Helper to get today's fixtures
export function getTodayFixtures(): FixtureWithTeams[] {
  const today = new Date().toISOString().split('T')[0]
  return getFixturesWithTeams().filter(f => f.match_date.startsWith(today))
}

// Helper to get upcoming fixtures
export function getUpcomingFixtures(limit = 10): FixtureWithTeams[] {
  const now = new Date()
  return getFixturesWithTeams()
    .filter(f => new Date(f.match_date) > now && f.status === 'NS')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(0, limit)
}

// Helper to get finished fixtures
export function getFinishedFixtures(limit = 10): FixtureWithTeams[] {
  return getFixturesWithTeams()
    .filter(f => f.status === 'FT')
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, limit)
}

// Helper to get fixtures by group
export function getFixturesByGroup(group: string): FixtureWithTeams[] {
  return getFixturesWithTeams().filter(f => f.group_name === group)
}

// Helper to get fixtures by round
export function getFixturesByRound(round: string): FixtureWithTeams[] {
  return getFixturesWithTeams().filter(f => f.round === round)
}
