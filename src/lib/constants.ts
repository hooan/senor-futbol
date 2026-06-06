// API Configuration
export const API_FOOTBALL_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || ''
export const API_FOOTBALL_HOST = 'v3.football.api-sports.io'

// World Cup Configuration
export const WORLD_CUP_LEAGUE_ID = 1
export const WORLD_CUP_SEASON = 2026

// Feature Flags
const multiTournamentEnv = import.meta.env.VITE_MULTI_TOURNAMENT_MODE
export const DEFAULT_MULTI_TOURNAMENT_ENABLED = multiTournamentEnv === 'true'

// Quiniela Scoring Rules (Advanced)
export const SCORING_RULES = {
  EXACT_SCORE: 5,
  CORRECT_RESULT: 3,
  CORRECT_GOAL_DIFFERENCE: 1,
} as const

// Match Status
export const MATCH_STATUS = {
  NOT_STARTED: 'NS',
  LIVE: 'LIVE',
  HALF_TIME: 'HT',
  FINISHED: 'FT',
  POSTPONED: 'PST',
  CANCELLED: 'CANC',
} as const

// World Cup Rounds
export const ROUNDS = {
  GROUP_STAGE: 'Group Stage',
  ROUND_32: 'Round of 32',
  ROUND_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter Finals',
  SEMI_FINAL: 'Semi Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
} as const

export const ROUND_ORDER = [
  ROUNDS.GROUP_STAGE,
  ROUNDS.ROUND_32,
  ROUNDS.ROUND_16,
  ROUNDS.QUARTER_FINAL,
  ROUNDS.SEMI_FINAL,
  ROUNDS.THIRD_PLACE,
  ROUNDS.FINAL,
] as const

// Groups
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const
