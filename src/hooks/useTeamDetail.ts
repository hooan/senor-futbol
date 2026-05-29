import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Team, FixtureWithTeams, Player, StandingWithTeam } from '@/types/database'

// Get team by ID
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()

      if (error) throw error
      return data as Team
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!teamId,
  })
}

// Get team fixtures (all matches for this team in the tournament)
export function useTeamFixtures(teamId: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['team-fixtures', teamId, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('match_date', { ascending: false })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!teamId,
  })
}

// Get team players/roster
export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: ['team-players', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('position', { ascending: true })
        .order('number', { ascending: true })

      if (error) throw error
      return (data || []) as Player[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!teamId,
  })
}

// Get team standing (if in group stage)
export function useTeamStanding(teamId: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['team-standing', teamId, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('team_id', teamId)

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query.single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found" errors
      return data as StandingWithTeam | null
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!teamId,
  })
}

// Get team statistics summary
export function useTeamStats(teamId: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['team-stats', teamId, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select('*')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'FT')

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error

      const fixtures = data || []

      // Calculate stats
      let wins = 0
      let draws = 0
      let losses = 0
      let goalsFor = 0
      let goalsAgainst = 0
      let cleanSheets = 0

      fixtures.forEach((fixture: any) => {
        const isHome = fixture.home_team_id === teamId
        const teamScore = isHome ? fixture.home_score : fixture.away_score
        const opponentScore = isHome ? fixture.away_score : fixture.home_score

        goalsFor += teamScore || 0
        goalsAgainst += opponentScore || 0

        if (opponentScore === 0) cleanSheets++

        if (teamScore > opponentScore) wins++
        else if (teamScore === opponentScore) draws++
        else losses++
      })

      return {
        played: fixtures.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        cleanSheets,
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!teamId,
  })
}
