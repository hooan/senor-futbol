import { Team } from '@/types/database'

// World Cup 2026 - 32 Teams (realistic prediction based on FIFA rankings and confederation slots)
export const mockTeams: Team[] = [
  // Group A
  { id: '1', api_team_id: 1, name: 'United States', code: 'USA', logo_url: null, created_at: new Date().toISOString() },
  { id: '2', api_team_id: 2, name: 'Brazil', code: 'BRA', logo_url: null, created_at: new Date().toISOString() },
  { id: '3', api_team_id: 3, name: 'England', code: 'ENG', logo_url: null, created_at: new Date().toISOString() },
  { id: '4', api_team_id: 4, name: 'Japan', code: 'JPN', logo_url: null, created_at: new Date().toISOString() },
  
  // Group B
  { id: '5', api_team_id: 5, name: 'Mexico', code: 'MEX', logo_url: null, created_at: new Date().toISOString() },
  { id: '6', api_team_id: 6, name: 'France', code: 'FRA', logo_url: null, created_at: new Date().toISOString() },
  { id: '7', api_team_id: 7, name: 'Uruguay', code: 'URU', logo_url: null, created_at: new Date().toISOString() },
  { id: '8', api_team_id: 8, name: 'South Korea', code: 'KOR', logo_url: null, created_at: new Date().toISOString() },
  
  // Group C
  { id: '9', api_team_id: 9, name: 'Canada', code: 'CAN', logo_url: null, created_at: new Date().toISOString() },
  { id: '10', api_team_id: 10, name: 'Argentina', code: 'ARG', logo_url: null, created_at: new Date().toISOString() },
  { id: '11', api_team_id: 11, name: 'Netherlands', code: 'NED', logo_url: null, created_at: new Date().toISOString() },
  { id: '12', api_team_id: 12, name: 'Australia', code: 'AUS', logo_url: null, created_at: new Date().toISOString() },
  
  // Group D
  { id: '13', api_team_id: 13, name: 'Germany', code: 'GER', logo_url: null, created_at: new Date().toISOString() },
  { id: '14', api_team_id: 14, name: 'Spain', code: 'ESP', logo_url: null, created_at: new Date().toISOString() },
  { id: '15', api_team_id: 15, name: 'Colombia', code: 'COL', logo_url: null, created_at: new Date().toISOString() },
  { id: '16', api_team_id: 16, name: 'Morocco', code: 'MAR', logo_url: null, created_at: new Date().toISOString() },
  
  // Group E
  { id: '17', api_team_id: 17, name: 'Portugal', code: 'POR', logo_url: null, created_at: new Date().toISOString() },
  { id: '18', api_team_id: 18, name: 'Belgium', code: 'BEL', logo_url: null, created_at: new Date().toISOString() },
  { id: '19', api_team_id: 19, name: 'Senegal', code: 'SEN', logo_url: null, created_at: new Date().toISOString() },
  { id: '20', api_team_id: 20, name: 'Ecuador', code: 'ECU', logo_url: null, created_at: new Date().toISOString() },
  
  // Group F
  { id: '21', api_team_id: 21, name: 'Italy', code: 'ITA', logo_url: null, created_at: new Date().toISOString() },
  { id: '22', api_team_id: 22, name: 'Croatia', code: 'CRO', logo_url: null, created_at: new Date().toISOString() },
  { id: '23', api_team_id: 23, name: 'Nigeria', code: 'NGA', logo_url: null, created_at: new Date().toISOString() },
  { id: '24', api_team_id: 24, name: 'Switzerland', code: 'SUI', logo_url: null, created_at: new Date().toISOString() },
  
  // Group G
  { id: '25', api_team_id: 25, name: 'Denmark', code: 'DEN', logo_url: null, created_at: new Date().toISOString() },
  { id: '26', api_team_id: 26, name: 'Poland', code: 'POL', logo_url: null, created_at: new Date().toISOString() },
  { id: '27', api_team_id: 27, name: 'Ghana', code: 'GHA', logo_url: null, created_at: new Date().toISOString() },
  { id: '28', api_team_id: 28, name: 'Costa Rica', code: 'CRC', logo_url: null, created_at: new Date().toISOString() },
  
  // Group H
  { id: '29', api_team_id: 29, name: 'Sweden', code: 'SWE', logo_url: null, created_at: new Date().toISOString() },
  { id: '30', api_team_id: 30, name: 'Serbia', code: 'SRB', logo_url: null, created_at: new Date().toISOString() },
  { id: '31', api_team_id: 31, name: 'Iran', code: 'IRN', logo_url: null, created_at: new Date().toISOString() },
  { id: '32', api_team_id: 32, name: 'Wales', code: 'WAL', logo_url: null, created_at: new Date().toISOString() },
]

// Helper to get team by ID
export function getTeamById(id: string): Team | undefined {
  return mockTeams.find(team => team.id === id)
}

// Helper to get teams by group
export function getTeamsByGroup(group: string): Team[] {
  const groupIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].indexOf(group)
  if (groupIndex === -1) return []
  
  const startIndex = groupIndex * 4
  return mockTeams.slice(startIndex, startIndex + 4)
}

// Group assignments
export const groupAssignments = {
  A: ['1', '2', '3', '4'],
  B: ['5', '6', '7', '8'],
  C: ['9', '10', '11', '12'],
  D: ['13', '14', '15', '16'],
  E: ['17', '18', '19', '20'],
  F: ['21', '22', '23', '24'],
  G: ['25', '26', '27', '28'],
  H: ['29', '30', '31', '32'],
}
