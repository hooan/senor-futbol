import { Standing, StandingWithTeam } from '@/types/database'
import { mockTeams, groupAssignments } from './mockTeams'

// Generate realistic standings for each group
function generateGroupStandings(group: string, teamIds: string[]): Standing[] {
  // Simulate realistic point distributions
  const standings: Standing[] = []
  
  // Points distribution for a realistic group (after 3 matches)
  const pointsDistributions = [
    [9, 6, 3, 0],  // Clear leader
    [7, 5, 4, 1],  // Tight race
    [6, 6, 3, 3],  // Very tight
    [7, 4, 4, 1],  // Mixed
  ]
  
  const groupIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].indexOf(group)
  const distribution = pointsDistributions[groupIndex % pointsDistributions.length]
  
  teamIds.forEach((teamId, index) => {
    const points = distribution[index]
    const wins = Math.floor(points / 3)
    const draws = points % 3
    const losses = 3 - wins - draws
    const played = 3 // After group stage
    
    // Generate realistic goal stats
    const goalsFor = wins * 2 + draws + Math.floor(Math.random() * 2)
    const goalsAgainst = losses * 2 + Math.floor(Math.random() * 2)
    const goalDifference = goalsFor - goalsAgainst
    
    standings.push({
      id: `standing-${teamId}`,
      team_id: teamId,
      group_name: group,
      rank: index + 1,
      points,
      played,
      wins,
      draws,
      losses,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goal_difference: goalDifference,
      updated_at: new Date().toISOString(),
    })
  })
  
  // Sort by points, then goal difference, then goals scored
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return b.goals_for - a.goals_for
  }).map((standing, index) => ({
    ...standing,
    rank: index + 1,
  }))
}

// Generate standings for all groups
export const mockStandings: Standing[] = Object.entries(groupAssignments).flatMap(
  ([group, teamIds]) => generateGroupStandings(group, teamIds)
)

// Helper to get standings with team data
export function getStandingsWithTeams(): StandingWithTeam[] {
  return mockStandings.map(standing => ({
    ...standing,
    team: mockTeams.find(t => t.id === standing.team_id)!,
  }))
}

// Helper to get standings by group
export function getStandingsByGroup(group: string): StandingWithTeam[] {
  return getStandingsWithTeams()
    .filter(s => s.group_name === group)
    .sort((a, b) => a.rank - b.rank)
}

// Helper to get all groups with standings
export function getAllGroupStandings(): Record<string, StandingWithTeam[]> {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  return groups.reduce((acc, group) => {
    acc[group] = getStandingsByGroup(group)
    return acc
  }, {} as Record<string, StandingWithTeam[]>)
}

// Helper to get team's standing
export function getTeamStanding(teamId: string): StandingWithTeam | undefined {
  const standings = getStandingsWithTeams()
  return standings.find(s => s.team_id === teamId)
}

// Helper to get top teams (qualifiers)
export function getQualifiedTeams(): StandingWithTeam[] {
  return getStandingsWithTeams()
    .filter(s => s.rank <= 2) // Top 2 from each group
    .sort((a, b) => {
      // Sort by group first, then rank
      if (a.group_name < b.group_name) return -1
      if (a.group_name > b.group_name) return 1
      return a.rank - b.rank
    })
}
