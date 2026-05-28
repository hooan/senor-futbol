// React Query hooks for fetching team data

import { useQuery } from '@tanstack/react-query'
import { mockDataService } from '@/services/mockData'

// Get all teams
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => mockDataService.teams.getAll(),
    staleTime: 1000 * 60 * 60, // 1 hour (teams rarely change)
  })
}

// Get single team by ID
export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => mockDataService.teams.getById(id),
    staleTime: 1000 * 60 * 60,
    enabled: !!id,
  })
}
