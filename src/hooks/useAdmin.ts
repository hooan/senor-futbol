import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import type {
  CreateNewsInput,
  UpdateNewsInput,
  CreateFixtureInput,
  UpdateFixtureInput,
  CreatePlayerInput,
  UpdatePlayerInput,
} from '@/types/database'

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  news: () => [...adminKeys.all, 'news'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  fixtures: (tournamentId?: string) => [...adminKeys.all, 'fixtures', tournamentId] as const,
  teams: (tournamentId?: string) => [...adminKeys.all, 'teams', tournamentId] as const,
  roster: (teamId?: string) => [...adminKeys.all, 'roster', teamId] as const,
  userStats: () => [...adminKeys.all, 'userStats'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboardStats'] as const,
}

// ============= NEWS QUERIES =============

// Get all news (including unpublished)
export function useAdminNews() {
  return useQuery({
    queryKey: adminKeys.news(),
    queryFn: () => adminService.getAllNews(),
  })
}

// ============= NEWS MUTATIONS =============

// Create news
export function useCreateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: CreateNewsInput }) =>
      adminService.createNews(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.news() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboardStats() })
      queryClient.invalidateQueries({ queryKey: ['news'] }) // Invalidate public news too
    },
  })
}

// Update news
export function useUpdateNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateNewsInput) => adminService.updateNews(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.news() })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

// Delete news
export function useDeleteNews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.news() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboardStats() })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

// Toggle publish
export function useTogglePublish() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminService.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.news() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboardStats() })
      queryClient.invalidateQueries({ queryKey: ['news'] })
    },
  })
}

// ============= USER QUERIES =============

// Get all users
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: () => adminService.getAllUsers(),
  })
}

// ============= FIXTURES QUERIES =============

export function useAdminFixtures(tournamentId?: string) {
  return useQuery({
    queryKey: adminKeys.fixtures(tournamentId),
    queryFn: () => adminService.getAllFixtures(tournamentId),
  })
}

export function useTournamentTeams(tournamentId?: string) {
  return useQuery({
    queryKey: adminKeys.teams(tournamentId),
    queryFn: () => adminService.getTournamentTeams(tournamentId!),
    enabled: !!tournamentId,
  })
}

export function useUpdateTeamGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ teamId, groupName }: { teamId: string; groupName: string | null }) =>
      adminService.updateTeamGroup(teamId, groupName),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teams(team.tournament_id) })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', team.id] })
    },
  })
}

export function useBulkUpdateTeamGroups() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; group_name: string | null }>) =>
      adminService.bulkUpdateTeamGroups(updates),
    onSuccess: (teams) => {
      const tournamentId = teams[0]?.tournament_id
      queryClient.invalidateQueries({ queryKey: adminKeys.teams(tournamentId) })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

// ============= FIXTURES MUTATIONS =============

export function useCreateFixture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateFixtureInput) => adminService.createFixture(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.fixtures(variables.tournament_id) })
      queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
    },
  })
}

export function useUpdateFixture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateFixtureInput) => adminService.updateFixture(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      queryClient.invalidateQueries({ queryKey: ['fixture'] })
      queryClient.invalidateQueries({ queryKey: ['match-events'] })
      queryClient.invalidateQueries({ queryKey: ['match-lineups'] })
      queryClient.invalidateQueries({ queryKey: ['match-statistics'] })
    },
  })
}

export function useDeleteFixture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminService.deleteFixture(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
    },
  })
}

export function useSeedWorldCupFixtures() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tournamentId: string) => adminService.seedWorldCup2026FixtureTemplates(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
      queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
    },
  })
}

// ============= ROSTERS QUERIES =============

export function useRosterByTeam(teamId?: string) {
  return useQuery({
    queryKey: adminKeys.roster(teamId),
    queryFn: () => adminService.getRosterByTeam(teamId!),
    enabled: !!teamId,
  })
}

// ============= ROSTERS MUTATIONS =============

export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePlayerInput) => adminService.createPlayer(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roster(variables.team_id) })
      queryClient.invalidateQueries({ queryKey: ['team-players', variables.team_id] })
    },
  })
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdatePlayerInput) => adminService.updatePlayer(input),
    onSuccess: (player, variables) => {
      const teamId = variables.team_id || player.team_id

      if (teamId) {
        queryClient.invalidateQueries({ queryKey: adminKeys.roster(teamId) })
        queryClient.invalidateQueries({ queryKey: ['team-players', teamId] })
      }
    },
  })
}

export function useDeletePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) =>
      adminService.deletePlayer(id).then(() => teamId),
    onSuccess: (teamId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roster(teamId) })
      queryClient.invalidateQueries({ queryKey: ['team-players', teamId] })
    },
  })
}

// Get user stats
export function useUserStats() {
  return useQuery({
    queryKey: adminKeys.userStats(),
    queryFn: () => adminService.getUserStats(),
  })
}

// ============= STATS QUERIES =============

// Get dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: () => adminService.getDashboardStats(),
  })
}
