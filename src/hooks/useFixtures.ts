// React Query hooks for fetching fixture data

import { useQuery } from '@tanstack/react-query'
import { mockDataService } from '@/services/mockData'

// Get all fixtures
export function useFixtures() {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: () => mockDataService.fixtures.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get today's fixtures
export function useTodayFixtures() {
  return useQuery({
    queryKey: ['fixtures', 'today'],
    queryFn: () => mockDataService.fixtures.getToday(),
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for live matches)
  })
}

// Get upcoming fixtures
export function useUpcomingFixtures(limit = 10) {
  return useQuery({
    queryKey: ['fixtures', 'upcoming', limit],
    queryFn: () => mockDataService.fixtures.getUpcoming(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get finished fixtures (results)
export function useFinishedFixtures(limit = 10) {
  return useQuery({
    queryKey: ['fixtures', 'finished', limit],
    queryFn: () => mockDataService.fixtures.getFinished(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes (results don't change)
  })
}

// Get fixtures by group
export function useFixturesByGroup(group: string) {
  return useQuery({
    queryKey: ['fixtures', 'group', group],
    queryFn: () => mockDataService.fixtures.getByGroup(group),
    staleTime: 1000 * 60 * 5,
    enabled: !!group,
  })
}

// Get fixtures by round
export function useFixturesByRound(round: string) {
  return useQuery({
    queryKey: ['fixtures', 'round', round],
    queryFn: () => mockDataService.fixtures.getByRound(round),
    staleTime: 1000 * 60 * 5,
    enabled: !!round,
  })
}

// Get single fixture by ID
export function useFixture(id: string) {
  return useQuery({
    queryKey: ['fixtures', id],
    queryFn: () => mockDataService.fixtures.getById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}
