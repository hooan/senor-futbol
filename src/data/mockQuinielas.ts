import type { Quiniela, QuinielaWithDetails, QuinielaParticipant, QuinielaPrediction, LeaderboardEntry, User } from '@/types/database'

// Mock users for quinielas
export const mockQuinielaUsers: User[] = [
  {
    id: 'user-1',
    username: 'futbolero',
    avatar_url: null,
    is_admin: false,
    created_at: '2026-05-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'predictor_pro',
    avatar_url: null,
    is_admin: false,
    created_at: '2026-05-02T00:00:00Z',
  },
  {
    id: 'user-3',
    username: 'soccer_fan',
    avatar_url: null,
    is_admin: false,
    created_at: '2026-05-03T00:00:00Z',
  },
]

// Mock quinielas
export const mockQuinielas: Quiniela[] = [
  {
    id: 'quiniela-1',
    name: 'Office World Cup Pool',
    description: 'Predict all group stage matches and compete with coworkers!',
    creator_id: 'user-1',
    is_public: true,
    share_code: 'OFFICE2026',
    deadline: '2026-06-11T17:00:00Z', // Day before first match
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'quiniela-2',
    name: 'Friends & Family Pool',
    description: 'Private pool for friends and family. May the best predictor win!',
    creator_id: 'user-2',
    is_public: false,
    share_code: 'FAM2026',
    deadline: '2026-06-11T17:00:00Z',
    created_at: '2026-05-05T14:30:00Z',
    updated_at: '2026-05-05T14:30:00Z',
  },
  {
    id: 'quiniela-3',
    name: 'Knockout Stage Only',
    description: 'Predict Round of 16 onwards. Join after group stage!',
    creator_id: 'user-1',
    is_public: true,
    share_code: 'KNOCKOUT26',
    deadline: '2026-06-28T17:00:00Z', // Before Round of 16
    created_at: '2026-05-10T09:00:00Z',
    updated_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'quiniela-4',
    name: 'The Ultimate Quiniela',
    description: 'ALL 64 matches. Only for the brave!',
    creator_id: 'user-3',
    is_public: true,
    share_code: 'ULTIMATE26',
    deadline: '2026-06-11T17:00:00Z',
    created_at: '2026-05-15T16:00:00Z',
    updated_at: '2026-05-15T16:00:00Z',
  },
]

// Mock quinielas with details (includes creator and count)
export const mockQuinielasWithDetails: QuinielaWithDetails[] = mockQuinielas.map((q, index) => ({
  ...q,
  creator: mockQuinielaUsers[index % mockQuinielaUsers.length],
  participants_count: [12, 8, 15, 23][index],
}))

// Mock participants for quiniela-1
export const mockParticipants: QuinielaParticipant[] = [
  {
    id: 'participant-1',
    quiniela_id: 'quiniela-1',
    user_id: 'user-1',
    guest_name: null,
    joined_at: '2026-05-01T10:00:00Z',
    total_points: 45,
    user: mockQuinielaUsers[0],
  },
  {
    id: 'participant-2',
    quiniela_id: 'quiniela-1',
    user_id: 'user-2',
    guest_name: null,
    joined_at: '2026-05-02T12:30:00Z',
    total_points: 52,
    user: mockQuinielaUsers[1],
  },
  {
    id: 'participant-3',
    quiniela_id: 'quiniela-1',
    user_id: 'user-3',
    guest_name: null,
    joined_at: '2026-05-03T08:15:00Z',
    total_points: 38,
    user: mockQuinielaUsers[2],
  },
  {
    id: 'participant-4',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'Juan Pérez',
    joined_at: '2026-05-04T14:00:00Z',
    total_points: 41,
  },
  {
    id: 'participant-5',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'María García',
    joined_at: '2026-05-05T10:20:00Z',
    total_points: 48,
  },
  {
    id: 'participant-6',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'Carlos López',
    joined_at: '2026-05-06T16:45:00Z',
    total_points: 35,
  },
]

// Mock predictions for a participant
export const mockPredictions: QuinielaPrediction[] = [
  {
    id: 'prediction-1',
    quiniela_id: 'quiniela-1',
    user_id: 'user-2',
    guest_name: null,
    fixture_id: 'fixture-1', // Will reference actual fixtures
    predicted_home_score: 2,
    predicted_away_score: 1,
    points_earned: 5, // Exact score
    created_at: '2026-05-10T14:30:00Z',
    updated_at: '2026-05-10T14:30:00Z',
  },
  {
    id: 'prediction-2',
    quiniela_id: 'quiniela-1',
    user_id: 'user-2',
    guest_name: null,
    fixture_id: 'fixture-2',
    predicted_home_score: 1,
    predicted_away_score: 1,
    points_earned: 3, // Correct result (draw)
    created_at: '2026-05-10T14:35:00Z',
    updated_at: '2026-05-10T14:35:00Z',
  },
  {
    id: 'prediction-3',
    quiniela_id: 'quiniela-1',
    user_id: 'user-2',
    guest_name: null,
    fixture_id: 'fixture-3',
    predicted_home_score: 3,
    predicted_away_score: 0,
    points_earned: 1, // Correct goal difference
    created_at: '2026-05-10T14:40:00Z',
    updated_at: '2026-05-10T14:40:00Z',
  },
]

// Mock leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 'participant-2',
    quiniela_id: 'quiniela-1',
    user_id: 'user-2',
    guest_name: null,
    user: mockQuinielaUsers[1],
    total_points: 52,
    predictions_count: 16,
    rank: 1,
  },
  {
    id: 'participant-5',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'María García',
    total_points: 48,
    predictions_count: 16,
    rank: 2,
  },
  {
    id: 'participant-1',
    quiniela_id: 'quiniela-1',
    user_id: 'user-1',
    guest_name: null,
    user: mockQuinielaUsers[0],
    total_points: 45,
    predictions_count: 16,
    rank: 3,
  },
  {
    id: 'participant-4',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'Juan Pérez',
    total_points: 41,
    predictions_count: 16,
    rank: 4,
  },
  {
    id: 'participant-3',
    quiniela_id: 'quiniela-1',
    user_id: 'user-3',
    guest_name: null,
    user: mockQuinielaUsers[2],
    total_points: 38,
    predictions_count: 16,
    rank: 5,
  },
  {
    id: 'participant-6',
    quiniela_id: 'quiniela-1',
    user_id: null,
    guest_name: 'Carlos López',
    total_points: 35,
    predictions_count: 16,
    rank: 6,
  },
]
