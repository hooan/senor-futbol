import type {
  Quiniela,
  QuinielaWithDetails,
  QuinielaParticipant,
  QuinielaPrediction,
  LeaderboardEntry,
  CreateQuinielaInput,
  MakePredictionInput,
  FixtureWithTeams,
} from '@/types/database'
import {
  mockQuinielas,
  mockQuinielasWithDetails,
  mockParticipants,
  mockPredictions,
  mockLeaderboard,
  mockQuinielaUsers,
} from '@/data/mockQuinielas'
import { mockFixtures } from '@/data/mockFixtures'

// Simulate API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Generate random share code
const generateShareCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Calculate points for a prediction
export const calculatePredictionPoints = (
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number => {
  // Exact score: 5 points
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 5
  }

  const predictedDiff = predictedHome - predictedAway
  const actualDiff = actualHome - actualAway

  // Correct result (win/draw/loss): 3 points
  if (
    (predictedDiff > 0 && actualDiff > 0) || // Both predict home win
    (predictedDiff < 0 && actualDiff < 0) || // Both predict away win
    (predictedDiff === 0 && actualDiff === 0) // Both predict draw
  ) {
    return 3
  }

  // Correct goal difference: 1 point
  if (predictedDiff === actualDiff) {
    return 1
  }

  return 0
}

// Quiniela Service
export const quinielaService = {
  // Get all public quinielas
  async getPublicQuinielas(): Promise<QuinielaWithDetails[]> {
    await delay()
    return mockQuinielasWithDetails.filter((q) => q.is_public)
  },

  // Get user's quinielas (creator or participant)
  async getUserQuinielas(userId: string): Promise<QuinielaWithDetails[]> {
    await delay()
    // In real implementation, would query quinielas where user is creator or participant
    return mockQuinielasWithDetails.filter(
      (q) =>
        q.creator_id === userId ||
        mockParticipants.some((p) => p.quiniela_id === q.id && p.user_id === userId)
    )
  },

  // Get quiniela by ID
  async getQuiniela(id: string): Promise<QuinielaWithDetails | null> {
    await delay()
    return mockQuinielasWithDetails.find((q) => q.id === id) || null
  },

  // Get quiniela by share code
  async getQuinielaByShareCode(shareCode: string): Promise<QuinielaWithDetails | null> {
    await delay()
    return mockQuinielasWithDetails.find((q) => q.share_code === shareCode) || null
  },

  // Create quiniela
  async createQuiniela(userId: string, input: CreateQuinielaInput): Promise<Quiniela> {
    await delay()
    const newQuiniela: Quiniela = {
      id: `quiniela-${Date.now()}`,
      name: input.name,
      description: input.description || null,
      creator_id: userId,
      is_public: input.is_public,
      share_code: generateShareCode(),
      deadline: input.deadline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    // In real app, would save to database
    mockQuinielas.push(newQuiniela)
    return newQuiniela
  },

  // Join quiniela
  async joinQuiniela(
    quinielaId: string,
    userId: string | null,
    guestName: string | null
  ): Promise<QuinielaParticipant> {
    await delay()

    // Check if already joined
    const existing = mockParticipants.find(
      (p) =>
        p.quiniela_id === quinielaId &&
        ((userId && p.user_id === userId) || (guestName && p.guest_name === guestName))
    )

    if (existing) {
      throw new Error('Already joined this quiniela')
    }

    const newParticipant: QuinielaParticipant = {
      id: `participant-${Date.now()}`,
      quiniela_id: quinielaId,
      user_id: userId,
      guest_name: guestName,
      joined_at: new Date().toISOString(),
      total_points: 0,
      user: userId ? mockQuinielaUsers.find((u) => u.id === userId) : undefined,
    }

    // In real app, would save to database
    mockParticipants.push(newParticipant)
    return newParticipant
  },

  // Get quiniela participants
  async getParticipants(quinielaId: string): Promise<QuinielaParticipant[]> {
    await delay()
    return mockParticipants.filter((p) => p.quiniela_id === quinielaId)
  },

  // Check if user is participant
  async isParticipant(quinielaId: string, userId: string | null): Promise<boolean> {
    await delay()
    return mockParticipants.some((p) => p.quiniela_id === quinielaId && p.user_id === userId)
  },

  // Get fixtures for quiniela (in real app, would filter by fixture_ids from quiniela_fixtures table)
  async getQuinielaFixtures(_quinielaId: string): Promise<FixtureWithTeams[]> {
    await delay()
    // For now, return first 16 fixtures (group stage matches)
    return mockFixtures.slice(0, 16) as FixtureWithTeams[]
  },

  // Get user's predictions for a quiniela
  async getUserPredictions(
    quinielaId: string,
    userId: string | null
  ): Promise<QuinielaPrediction[]> {
    await delay()
    return mockPredictions.filter((p) => p.quiniela_id === quinielaId && p.user_id === userId)
  },

  // Make or update prediction
  async makePrediction(
    userId: string | null,
    input: MakePredictionInput
  ): Promise<QuinielaPrediction> {
    await delay()

    // Check if prediction exists
    const existingIndex = mockPredictions.findIndex(
      (p) =>
        p.quiniela_id === input.quiniela_id &&
        p.fixture_id === input.fixture_id &&
        p.user_id === userId
    )

    const prediction: QuinielaPrediction = {
      id: existingIndex >= 0 ? mockPredictions[existingIndex].id : `prediction-${Date.now()}`,
      quiniela_id: input.quiniela_id,
      user_id: userId,
      guest_name: input.guest_name || null,
      fixture_id: input.fixture_id,
      predicted_home_score: input.predicted_home_score,
      predicted_away_score: input.predicted_away_score,
      points_earned: 0, // Will be calculated when match finishes
      created_at:
        existingIndex >= 0 ? mockPredictions[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      mockPredictions[existingIndex] = prediction
    } else {
      mockPredictions.push(prediction)
    }

    return prediction
  },

  // Get leaderboard
  async getLeaderboard(quinielaId: string): Promise<LeaderboardEntry[]> {
    await delay()
    // In real implementation, would calculate and sort by points
    return mockLeaderboard.filter((l) => l.quiniela_id === quinielaId)
  },

  // Delete quiniela (creator only)
  async deleteQuiniela(quinielaId: string, userId: string): Promise<void> {
    await delay()
    const quiniela = mockQuinielas.find((q) => q.id === quinielaId)
    if (!quiniela) {
      throw new Error('Quiniela not found')
    }
    if (quiniela.creator_id !== userId) {
      throw new Error('Only the creator can delete this quiniela')
    }
    // In real app, would delete from database
    const index = mockQuinielas.findIndex((q) => q.id === quinielaId)
    if (index >= 0) {
      mockQuinielas.splice(index, 1)
    }
  },
}
