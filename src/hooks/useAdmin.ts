import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import type { CreateNewsInput, UpdateNewsInput } from '@/types/database'

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  news: () => [...adminKeys.all, 'news'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
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
