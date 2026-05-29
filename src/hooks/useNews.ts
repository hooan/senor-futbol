// React Query hooks for fetching news data

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabaseClient'
import type { News, NewsWithAuthor } from '@/types/database'

// Get all news (admin use)
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data || []) as NewsWithAuthor[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Get published news only (public use) - filtered by current language
export function usePublishedNews() {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language || 'en'

  return useQuery({
    queryKey: ['news', 'published', currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(id, username, avatar_url)
        `)
        .eq('is_published', true)
        .eq('language', currentLanguage)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })

      if (error) throw error
      return (data || []) as NewsWithAuthor[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Get single news article by ID
export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(id, username, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as NewsWithAuthor
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

// Get latest news - filtered by current language
export function useLatestNews(limit = 5) {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language || 'en'

  return useQuery({
    queryKey: ['news', 'latest', limit, currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:users(id, username, avatar_url)
        `)
        .eq('is_published', true)
        .eq('language', currentLanguage)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data || []) as NewsWithAuthor[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Create news article
export function useCreateNews() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return useMutation({
    mutationFn: async (newsData: Partial<News>) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('news')
        .insert({
          ...newsData,
          author_id: session.user.id,
          language: newsData.language || i18n.language || 'en',
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

// Update news article
export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<News> }) => {
      const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

// Delete news article
export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}
