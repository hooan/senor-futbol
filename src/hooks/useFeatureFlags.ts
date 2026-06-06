import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { DEFAULT_MULTI_TOURNAMENT_ENABLED } from '@/lib/constants'
import type { FeatureFlags } from '@/types/database'

const settingKeys = {
  all: ['settings'] as const,
  featureFlags: () => [...settingKeys.all, 'feature-flags'] as const,
}

async function getFeatureFlags(): Promise<FeatureFlags> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value_json')
    .eq('key', 'multi_tournament_enabled')
    .maybeSingle()

  if (error) {
    // Allow local/dev usage before migrations are applied.
    if (error.code === '42P01') {
      return { multiTournamentEnabled: DEFAULT_MULTI_TOURNAMENT_ENABLED }
    }
    throw error
  }

  const enabledFromDb = data?.value_json?.enabled
  const multiTournamentEnabled =
    typeof enabledFromDb === 'boolean' ? enabledFromDb : DEFAULT_MULTI_TOURNAMENT_ENABLED

  return { multiTournamentEnabled }
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: settingKeys.featureFlags(),
    queryFn: getFeatureFlags,
    staleTime: 1000 * 60,
  })
}

export function useUpdateMultiTournamentFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'multi_tournament_enabled',
            value_json: { enabled },
            description: 'Controls whether public app can switch across tournaments',
          },
          { onConflict: 'key' }
        )
        .select('value_json')
        .single()

      if (error) throw error

      const value = data?.value_json?.enabled
      return {
        multiTournamentEnabled:
          typeof value === 'boolean' ? value : DEFAULT_MULTI_TOURNAMENT_ENABLED,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.featureFlags() })
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
    },
  })
}
