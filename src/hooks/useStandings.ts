// React Query hooks for fetching standings data from Supabase

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { FixtureWithTeams, StandingWithTeam, Team } from '@/types/database'

type ComputedStanding = {
  id: string
  team_id: string
  tournament_id?: string
  group_name: string
  rank: number
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  updated_at: string
  team: Team
}

function computeGroupStandings(fixtures: FixtureWithTeams[], teams: Team[], tournamentId?: string) {
  const groupTeams = teams.filter((team) => !!team.group_name)
  const groupsByTeamId = new Map(groupTeams.map((team) => [team.id, team.group_name as string]))

  const tableByTeamId = new Map<string, Omit<ComputedStanding, 'rank'>>()

  groupTeams.forEach((team) => {
    tableByTeamId.set(team.id, {
      id: `computed-${team.id}`,
      team_id: team.id,
      tournament_id: tournamentId,
      group_name: team.group_name as string,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      updated_at: new Date().toISOString(),
      team,
    })
  })

  const groupStageFinished = fixtures.filter(
    (fixture) =>
      fixture.round === 'Group Stage' &&
      fixture.status === 'FT' &&
      fixture.home_score !== null &&
      fixture.away_score !== null
  )

  groupStageFinished.forEach((fixture) => {
    const home = tableByTeamId.get(fixture.home_team_id)
    const away = tableByTeamId.get(fixture.away_team_id)

    if (!home || !away) return
    if (groupsByTeamId.get(home.team_id) !== groupsByTeamId.get(away.team_id)) return

    const homeGoals = fixture.home_score as number
    const awayGoals = fixture.away_score as number

    home.played += 1
    away.played += 1

    home.goals_for += homeGoals
    home.goals_against += awayGoals
    away.goals_for += awayGoals
    away.goals_against += homeGoals

    if (homeGoals > awayGoals) {
      home.wins += 1
      home.points += 3
      away.losses += 1
    } else if (homeGoals < awayGoals) {
      away.wins += 1
      away.points += 3
      home.losses += 1
    } else {
      home.draws += 1
      away.draws += 1
      home.points += 1
      away.points += 1
    }
  })

  const byGroup: Record<string, ComputedStanding[]> = {}

  tableByTeamId.forEach((row) => {
    row.goal_difference = row.goals_for - row.goals_against
    const group = row.group_name
    if (!byGroup[group]) byGroup[group] = []
    byGroup[group].push({ ...row, rank: 0 })
  })

  Object.keys(byGroup).forEach((group) => {
    byGroup[group]
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
        if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
        return a.team.name.localeCompare(b.team.name)
      })
      .forEach((standing, index) => {
        standing.rank = index + 1
      })
  })

  return byGroup
}

// Get all standings with teams
export function useStandings(tournamentId?: string) {
  return useQuery({
    queryKey: ['standings', tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Get standings by group
export function useStandingsByGroup(group: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['standings', 'group', group, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('group_name', group)
        .order('rank', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!group,
  })
}

// Get all groups with standings
export function useAllGroupStandings(tournamentId?: string) {
  return useQuery({
    queryKey: ['standings', 'all-groups', tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error

      const storedStandings = (data || []) as StandingWithTeam[]

      if (storedStandings.length > 0) {
        const groups: Record<string, StandingWithTeam[]> = {}

        storedStandings.forEach((standing) => {
          if (!groups[standing.group_name]) {
            groups[standing.group_name] = []
          }
          groups[standing.group_name].push(standing)
        })

        return groups
      }

      // Fallback: calculate standings directly from group-stage fixtures.
      let teamsQuery = supabase.from('teams').select('*').order('name', { ascending: true })
      let fixturesQuery = supabase
        .from('fixtures')
        .select(
          `
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `
        )
        .eq('round', 'Group Stage')
        .order('match_date', { ascending: true })

      if (tournamentId) {
        teamsQuery = teamsQuery.eq('tournament_id', tournamentId)
        fixturesQuery = fixturesQuery.eq('tournament_id', tournamentId)
      }

      const [{ data: teams, error: teamsError }, { data: fixtures, error: fixturesError }] =
        await Promise.all([teamsQuery, fixturesQuery])

      if (teamsError) throw teamsError
      if (fixturesError) throw fixturesError

      return computeGroupStandings(
        (fixtures || []) as FixtureWithTeams[],
        (teams || []) as Team[],
        tournamentId
      )
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Get qualified teams (top 2 from each group)
export function useQualifiedTeams(tournamentId?: string) {
  return useQuery({
    queryKey: ['standings', 'qualified', tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .lte('rank', 2)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10,
  })
}
