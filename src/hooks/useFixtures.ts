// React Query hooks for fetching fixture data from Supabase

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { FixtureWithTeams } from '@/types/database'
import { startOfToday, endOfToday } from 'date-fns'

// Get all fixtures with teams
export function useFixtures(tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .order('match_date', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get today's fixtures
export function useTodayFixtures(tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', 'today', tournamentId],
    queryFn: async () => {
      const startOfDay = startOfToday()
      const endOfDay = endOfToday()

      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .gte('match_date', startOfDay.toISOString())
        .lte('match_date', endOfDay.toISOString())
        .order('match_date', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for live matches)
  })
}

// Get upcoming fixtures
export function useUpcomingFixtures(limit = 10, tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', 'upcoming', limit, tournamentId],
    queryFn: async () => {
      const now = new Date().toISOString()

      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .gte('match_date', now)
        .in('status', ['NS', 'PST'])
        .order('match_date', { ascending: true })
        .limit(limit)

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get finished fixtures (results)
export function useFinishedFixtures(limit = 10, tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', 'finished', limit, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('status', 'FT')
        .order('match_date', { ascending: false })
        .limit(limit)

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (results don't change)
  })
}

// Get fixtures by group
export function useFixturesByGroup(group: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', 'group', group, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('group_name', group)
        .order('match_date', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!group,
  })
}

// Get fixtures by round
export function useFixturesByRound(round: string, tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', 'round', round, tournamentId],
    queryFn: async () => {
      let query = supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('round', round)
        .order('match_date', { ascending: true })

      if (tournamentId) {
        query = query.eq('tournament_id', tournamentId)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as FixtureWithTeams[]
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!round,
  })
}

// Get single fixture by ID
export function useFixture(id: string) {
  return useQuery({
    queryKey: ['fixtures', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as FixtureWithTeams
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}
