import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { MatchEvent, MatchLineup, MatchStatistic, FixtureWithTeams } from '@/types/database'

// Get match events (goals, cards, substitutions)
export function useMatchEvents(fixtureId: string) {
  return useQuery({
    queryKey: ['match-events', fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('fixture_id', fixtureId)
        .order('time_elapsed', { ascending: true })
        .order('time_extra', { ascending: true })

      if (error) throw error
      return (data || []) as MatchEvent[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!fixtureId,
  })
}

// Get match lineups (starting XI + substitutes)
export function useMatchLineups(fixtureId: string) {
  return useQuery({
    queryKey: ['match-lineups', fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_lineups')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('fixture_id', fixtureId)
        .order('is_starter', { ascending: false }) // Starters first
        .order('player_number', { ascending: true })

      if (error) throw error
      return (data || []) as MatchLineup[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!fixtureId,
  })
}

// Get match statistics (possession, shots, etc.)
export function useMatchStatistics(fixtureId: string) {
  return useQuery({
    queryKey: ['match-statistics', fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_statistics')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('fixture_id', fixtureId)

      if (error) throw error
      return (data || []) as MatchStatistic[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!fixtureId,
  })
}

// Get full match detail (fixture + events + lineups + statistics)
export function useMatchDetail(fixtureId: string) {
  const { data: fixture, isLoading: fixtureLoading } = useQuery({
    queryKey: ['fixture', fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('id', fixtureId)
        .single()

      if (error) throw error
      return data as FixtureWithTeams
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!fixtureId,
  })

  const { data: events } = useMatchEvents(fixtureId)
  const { data: lineups } = useMatchLineups(fixtureId)
  const { data: statistics } = useMatchStatistics(fixtureId)

  return {
    fixture,
    events: events || [],
    lineups: lineups || [],
    statistics: statistics || [],
    isLoading: fixtureLoading,
  }
}
