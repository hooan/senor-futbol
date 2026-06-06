import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quinielaService } from '@/services/quinielaService'
import type {
  CreateQuinielaInput,
  MakePredictionInput,
} from '@/types/database'

// Query keys
export const quinielaKeys = {
  all: ['quinielas'] as const,
  public: () => [...quinielaKeys.all, 'public'] as const,
  user: (userId: string) => [...quinielaKeys.all, 'user', userId] as const,
  detail: (id: string) => [...quinielaKeys.all, 'detail', id] as const,
  byShareCode: (code: string) => [...quinielaKeys.all, 'share', code] as const,
  participants: (id: string) => [...quinielaKeys.all, id, 'participants'] as const,
  fixtures: (id: string) => [...quinielaKeys.all, id, 'fixtures'] as const,
  predictions: (id: string, userId: string | null) =>
    [...quinielaKeys.all, id, 'predictions', userId] as const,
  leaderboard: (id: string) => [...quinielaKeys.all, id, 'leaderboard'] as const,
  isParticipant: (id: string, userId: string | null) =>
    [...quinielaKeys.all, id, 'isParticipant', userId] as const,
}

// Get public quinielas
export function usePublicQuinielas() {
  return useQuery({
    queryKey: quinielaKeys.public(),
    queryFn: () => quinielaService.getPublicQuinielas(),
  })
}

// Get user's quinielas
export function useUserQuinielas(userId: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.user(userId || ''),
    queryFn: () => quinielaService.getUserQuinielas(userId!),
    enabled: !!userId,
  })
}

// Get quiniela by ID
export function useQuiniela(id: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.detail(id || ''),
    queryFn: () => quinielaService.getQuiniela(id!),
    enabled: !!id,
  })
}

// Get quiniela by share code
export function useQuinielaByShareCode(shareCode: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.byShareCode(shareCode || ''),
    queryFn: () => quinielaService.getQuinielaByShareCode(shareCode!),
    enabled: !!shareCode,
  })
}

// Get participants
export function useParticipants(quinielaId: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.participants(quinielaId || ''),
    queryFn: () => quinielaService.getParticipants(quinielaId!),
    enabled: !!quinielaId,
  })
}

// Check if user is participant
export function useIsParticipant(quinielaId: string | undefined, userId: string | null) {
  return useQuery({
    queryKey: quinielaKeys.isParticipant(quinielaId || '', userId),
    queryFn: () => quinielaService.isParticipant(quinielaId!, userId),
    enabled: !!quinielaId,
  })
}

// Get fixtures for quiniela
export function useQuinielaFixtures(quinielaId: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.fixtures(quinielaId || ''),
    queryFn: () => quinielaService.getQuinielaFixtures(quinielaId!),
    enabled: !!quinielaId,
  })
}

// Get user's predictions
export function useUserPredictions(
  quinielaId: string | undefined,
  userId: string | null,
  guestToken?: string | null
) {
  return useQuery({
    queryKey: quinielaKeys.predictions(quinielaId || '', userId ?? guestToken ?? null),
    queryFn: () => quinielaService.getUserPredictions(quinielaId!, userId, guestToken),
    enabled: !!quinielaId && (!!userId || !!guestToken),
  })
}

// Get leaderboard
export function useLeaderboard(quinielaId: string | undefined) {
  return useQuery({
    queryKey: quinielaKeys.leaderboard(quinielaId || ''),
    queryFn: () => quinielaService.getLeaderboard(quinielaId!),
    enabled: !!quinielaId,
  })
}

// Create quiniela mutation
export function useCreateQuiniela() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: CreateQuinielaInput }) =>
      quinielaService.createQuiniela(userId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quinielaKeys.public() })
      queryClient.invalidateQueries({ queryKey: quinielaKeys.user(variables.userId) })
    },
  })
}

// Join quiniela mutation
export function useJoinQuiniela() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      quinielaId,
      userId,
      guestName,
    }: {
      quinielaId: string
      userId: string | null
      guestName: string | null
    }) => quinielaService.joinQuiniela(quinielaId, userId, guestName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quinielaKeys.participants(variables.quinielaId) })
      queryClient.invalidateQueries({
        queryKey: quinielaKeys.isParticipant(variables.quinielaId, variables.userId),
      })
      if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: quinielaKeys.user(variables.userId) })
      }
    },
  })
}

// Make prediction mutation
export function useMakePrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      guestToken,
      input,
    }: {
      userId: string | null
      guestToken?: string | null
      input: MakePredictionInput
    }) => quinielaService.makePrediction(userId, guestToken ?? null, input),
    onSuccess: (_, variables) => {
      const identity = variables.userId ?? variables.guestToken ?? null
      queryClient.invalidateQueries({
        queryKey: quinielaKeys.predictions(variables.input.quiniela_id, identity),
      })
      queryClient.invalidateQueries({
        queryKey: quinielaKeys.leaderboard(variables.input.quiniela_id),
      })
    },
  })
}

// Delete quiniela mutation
export function useDeleteQuiniela() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quinielaId, userId }: { quinielaId: string; userId: string }) =>
      quinielaService.deleteQuiniela(quinielaId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quinielaKeys.public() })
      queryClient.invalidateQueries({ queryKey: quinielaKeys.user(variables.userId) })
      queryClient.removeQueries({ queryKey: quinielaKeys.detail(variables.quinielaId) })
    },
  })
}
