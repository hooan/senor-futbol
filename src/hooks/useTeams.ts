// React Query hooks for fetching team data from Supabase

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Team } from '@/types/database'

// Get all teams
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return (data || []) as Team[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour (teams rarely change)
  })
}

// Get single team by ID
export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Team
    },
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
  })
}
