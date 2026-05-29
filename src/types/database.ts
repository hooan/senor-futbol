// Database Types - Mirror Supabase schema

export interface Tournament {
  id: string
  api_league_id: number
  season: number
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  api_team_id: number | null
  tournament_id?: string
  name: string
  code: string // 3-letter country code
  logo_url: string | null
  created_at: string
}

export interface Fixture {
  id: string
  api_fixture_id: number | null
  tournament_id?: string
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string | null
  referee: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  round: string
  group_name: string | null
  created_at: string
  updated_at: string
  // Joined data
  home_team?: Team
  away_team?: Team
}

export interface Standing {
  id: string
  team_id: string
  tournament_id?: string
  group_name: string
  rank: number
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  updated_at: string
  // Joined data
  team?: Team
}

export interface User {
  id: string
  username: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export interface News {
  id: string
  title: string
  content: string
  excerpt: string | null
  author_id: string | null
  cover_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  is_published: boolean
  // Joined data
  author?: User
}

export interface Quiniela {
  id: string
  name: string
  description: string | null
  creator_id: string
  is_public: boolean
  share_code: string
  deadline: string
  created_at: string
  updated_at: string
  // Joined data
  creator?: User
  participants_count?: number
}

export interface QuinielaPrediction {
  id: string
  quiniela_id: string
  user_id: string | null
  guest_name: string | null
  fixture_id: string
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  created_at: string
  updated_at: string
  // Joined data
  fixture?: Fixture
  user?: User
}

export interface QuinielaParticipant {
  id: string
  quiniela_id: string
  user_id: string | null
  guest_name: string | null
  joined_at: string
  total_points: number
  // Joined data
  user?: User
}

export interface ApiRequestLog {
  id: string
  endpoint: string
  request_date: string
  request_count: number
  last_request_at: string
}

// Enums and Constants

export type MatchStatus = 'NS' | 'LIVE' | 'HT' | 'FT' | 'PST' | 'CANC'

export type Group = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

export type Round = 
  | 'Group Stage'
  | 'Round of 16'
  | 'Quarter Finals'
  | 'Semi Finals'
  | 'Third Place'
  | 'Final'

// Helper types for forms and API

export interface CreateQuinielaInput {
  name: string
  description?: string
  deadline: string
  is_public: boolean
  fixture_ids: string[]
}

export interface MakePredictionInput {
  quiniela_id: string
  fixture_id: string
  predicted_home_score: number
  predicted_away_score: number
  guest_name?: string // For non-registered users
}

export interface CreateNewsInput {
  title: string
  content: string
  excerpt?: string
  cover_image_url?: string
  is_published: boolean
}

export interface UpdateNewsInput extends Partial<CreateNewsInput> {
  id: string
}

// Fixture with teams populated
export interface FixtureWithTeams extends Fixture {
  home_team: Team
  away_team: Team
}

// Standing with team populated
export interface StandingWithTeam extends Standing {
  team: Team
}

// News with author
export interface NewsWithAuthor extends News {
  author: User
}

// Quiniela with creator and participant info
export interface QuinielaWithDetails extends Quiniela {
  creator: User
  participants_count: number
}

// Leaderboard entry
export interface LeaderboardEntry {
  id: string
  quiniela_id: string
  user_id: string | null
  guest_name: string | null
  user?: User
  total_points: number
  predictions_count: number
  rank: number
}

// Join quiniela input
export interface JoinQuinielaInput {
  share_code: string
  guest_name?: string // Required if not authenticated
}

// Match Events (goals, cards, substitutions)
export interface MatchEvent {
  id: string
  fixture_id: string
  team_id: string
  time_elapsed: number
  time_extra: number | null
  player_name: string
  api_player_id: number | null
  assist_name: string | null
  assist_api_player_id: number | null
  event_type: string // 'goal', 'card', 'subst', 'var'
  detail: string // 'Normal Goal', 'Yellow Card', etc.
  comments: string | null
  created_at: string
  // Joined data
  team?: Team
}

// Match Lineups (starting XI and substitutes)
export interface MatchLineup {
  id: string
  fixture_id: string
  team_id: string
  formation: string | null
  player_name: string
  player_number: number | null
  api_player_id: number | null
  position: string
  grid_position: string | null
  is_starter: boolean
  created_at: string
  // Joined data
  team?: Team
}

// Match Statistics (possession, shots, etc.)
export interface MatchStatistic {
  id: string
  fixture_id: string
  team_id: string
  stat_type: string
  stat_value: string
  created_at: string
  // Joined data
  team?: Team
}

// Players (team rosters)
export interface Player {
  id: string
  api_player_id: number
  team_id: string
  name: string
  age: number | null
  number: number | null
  position: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
  // Joined data
  team?: Team
}

// Match detail with all related data
export interface MatchDetail {
  fixture: FixtureWithTeams
  events: MatchEvent[]
  lineups: MatchLineup[]
  statistics: MatchStatistic[]
}
