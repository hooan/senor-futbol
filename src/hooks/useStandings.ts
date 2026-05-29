// React Query hooks for fetching standings data from Supabase

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { StandingWithTeam } from '@/types/database'

// Get all standings with teams
export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Get standings by group
export function useStandingsByGroup(group: string) {
  return useQuery({
    queryKey: ['standings', 'group', group],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('group_name', group)
        .order('rank', { ascending: true })

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!group,
  })
}

// Get all groups with standings
export function useAllGroupStandings() {
  return useQuery({
    queryKey: ['standings', 'all-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (error) throw error
      
      // Group by group_name
      const standings = (data || []) as StandingWithTeam[]
      const groups: Record<string, StandingWithTeam[]> = {}
      
      standings.forEach(standing => {
        if (!groups[standing.group_name]) {
          groups[standing.group_name] = []
        }
        groups[standing.group_name].push(standing)
      })

      return groups
    },
    staleTime: 1000 * 60 * 10,
  })
}

// Get qualified teams (top 2 from each group)
export function useQualifiedTeams() {
  return useQuery({
    queryKey: ['standings', 'qualified'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standings')
        .select(`
          *,
          team:teams(*)
        `)
        .lte('rank', 2)
        .order('group_name', { ascending: true })
        .order('rank', { ascending: true })

      if (error) throw error
      return (data || []) as StandingWithTeam[]
    },
    staleTime: 1000 * 60 * 10,
  })
}
