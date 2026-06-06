import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/constants'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import type { Tournament } from '@/types/database'

export function useTournaments() {
  const { data: flags } = useFeatureFlags()
  const multiTournamentEnabled = flags?.multiTournamentEnabled ?? false

  return useQuery({
    queryKey: ['tournaments', multiTournamentEnabled],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('season', { ascending: false })

      if (!multiTournamentEnabled) {
        query = query
          .eq('api_league_id', WORLD_CUP_LEAGUE_ID)
          .eq('season', WORLD_CUP_SEASON)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Tournament[]
    },
    enabled: flags !== undefined,
  })
}
