import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export interface NewsSource {
  id: string
  name: string
  source_type: 'newsapi' | 'gnews'
  api_endpoint: string
  api_key_env: string
  requests_per_day: number
  requests_today: number
  last_request_date: string | null
  search_query: string
  is_active: boolean
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NewsFetchLog {
  id: string
  source_id: string
  fetch_date: string
  articles_fetched: number
  articles_saved: number
  status: 'success' | 'error' | 'rate_limited'
  error_message: string | null
  created_at: string
}

// Get all news sources
export function useNewsSources() {
  return useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as NewsSource[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Get fetch logs
export function useNewsFetchLogs(limit = 50) {
  return useQuery({
    queryKey: ['news-fetch-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_fetch_log')
        .select(`
          *,
          source:news_sources(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as (NewsFetchLog & { source: { name: string } })[]
    },
    staleTime: 1000 * 60,
  })
}

// Update news source
export function useUpdateNewsSource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<NewsSource>
    }) => {
      const { data, error } = await supabase
        .from('news_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-sources'] })
    },
  })
}

// Trigger manual news fetch
export function useTriggerNewsFetch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-fetch-logs'] })
      queryClient.invalidateQueries({ queryKey: ['news-sources'] })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}
