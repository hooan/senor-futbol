// React Query hooks for fetching news data

import { useQuery } from '@tanstack/react-query'
import { mockDataService } from '@/services/mockData'

// Get all news
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: () => mockDataService.news.getAll(),
    staleTime: 1000 * 60 * 15, // 15 minutes
  })
}

// Get published news only
export function usePublishedNews() {
  return useQuery({
    queryKey: ['news', 'published'],
    queryFn: () => mockDataService.news.getPublished(),
    staleTime: 1000 * 60 * 15,
  })
}

// Get single news article by ID
export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: ['news', id],
    queryFn: () => mockDataService.news.getById(id),
    staleTime: 1000 * 60 * 15,
    enabled: !!id,
  })
}

// Get latest news
export function useLatestNews(limit = 5) {
  return useQuery({
    queryKey: ['news', 'latest', limit],
    queryFn: () => mockDataService.news.getLatest(limit),
    staleTime: 1000 * 60 * 15,
  })
}
