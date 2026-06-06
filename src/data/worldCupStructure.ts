import { GROUPS, ROUNDS, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '@/lib/constants'

export const WORLD_CUP_2026_STRUCTURE = {
  tournament: {
    name: 'FIFA World Cup 2026',
    apiLeagueId: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
  },
  groups: GROUPS.map((group) => ({
    name: group,
    expectedTeams: 4,
    expectedMatches: 6,
  })),
  knockoutStages: [
    { round: ROUNDS.ROUND_32, expectedMatches: 16 },
    { round: ROUNDS.ROUND_16, expectedMatches: 8 },
    { round: ROUNDS.QUARTER_FINAL, expectedMatches: 4 },
    { round: ROUNDS.SEMI_FINAL, expectedMatches: 2 },
    { round: ROUNDS.THIRD_PLACE, expectedMatches: 1 },
    { round: ROUNDS.FINAL, expectedMatches: 1 },
  ],
  totals: {
    teams: 48,
    groupMatches: 72,
    knockoutMatches: 32,
    totalMatches: 104,
  },
} as const
