// React Query hooks for fetching standings data

import { useQuery } from '@tanstack/react-query'
import { mockDataService } from '@/services/mockData'

// Get all standings
export function useStandings() {
  return useQuery({
    queryKey: ['standings'],
    queryFn: () => mockDataService.standings.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Get standings by group
export function useStandingsByGroup(group: string) {
  return useQuery({
    queryKey: ['standings', 'group', group],
    queryFn: () => mockDataService.standings.getByGroup(group),
    staleTime: 1000 * 60 * 10,
    enabled: !!group,
  })
}

// Get all groups with standings
export function useAllGroupStandings() {
  return useQuery({
    queryKey: ['standings', 'all-groups'],
    queryFn: () => mockDataService.standings.getAllGroups(),
    staleTime: 1000 * 60 * 10,
  })
}

// Get qualified teams (top 2 from each group)
export function useQualifiedTeams() {
  return useQuery({
    queryKey: ['standings', 'qualified'],
    queryFn: () => mockDataService.standings.getQualified(),
    staleTime: 1000 * 60 * 10,
  })
}
