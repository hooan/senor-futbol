import { useAllGroupStandings } from '@/hooks/useStandings'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import TournamentSelector from '@/components/TournamentSelector'
import { StandingWithTeam } from '@/types/database'

interface GroupTableProps {
  group: string
  standings: StandingWithTeam[]
}

function GroupTable({ group, standings }: GroupTableProps) {
  return (
    <Card variant="elevated">
      <h3 className="font-headline text-2xl uppercase mb-4">GROUP {group}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-thick border-raw-black">
              <th className="text-left py-2 px-2 font-mono text-xs uppercase">#</th>
              <th className="text-left py-2 px-2 font-mono text-xs uppercase">TEAM</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">P</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">W</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">D</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">L</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">GD</th>
              <th className="text-center py-2 px-2 font-mono text-xs uppercase font-bold">PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr 
                key={standing.id}
                className={`border-b-thin border-gray-300 hover:bg-gray-50 ${index < 2 ? 'bg-green-50' : ''}`}
              >
                <td className="py-3 px-2 font-mono text-sm font-bold">{standing.rank}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-thin border-raw-black flex items-center justify-center">
                      <span className="font-mono text-tiny">{standing.team.code}</span>
                    </div>
                    <span className="font-body text-sm font-semibold">{standing.team.name}</span>
                  </div>
                </td>
                <td className="py-3 px-1 text-center font-mono text-sm">{standing.played}</td>
                <td className="py-3 px-1 text-center font-mono text-sm">{standing.wins}</td>
                <td className="py-3 px-1 text-center font-mono text-sm">{standing.draws}</td>
                <td className="py-3 px-1 text-center font-mono text-sm">{standing.losses}</td>
                <td className="py-3 px-1 text-center font-mono text-sm">
                  {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                </td>
                <td className="py-3 px-2 text-center font-mono text-sm font-bold">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 pt-3 border-t-thin border-gray-300">
        <p className="text-xs font-mono text-gray-600">
          <span className="inline-block w-3 h-3 bg-green-50 border-thin border-gray-300 mr-1"></span>
          QUALIFIED FOR ROUND OF 16
        </p>
      </div>
    </Card>
  )
}

export default function Standings() {
  const { activeTournament, activeTournamentId } = useActiveTournament()
  const { data: allStandings, isLoading } = useAllGroupStandings(activeTournamentId || undefined)
  
  // Get actual groups from data instead of hardcoded
  const groups = allStandings ? Object.keys(allStandings).sort() : []
  
  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-headline text-5xl md:text-6xl uppercase mb-4">
            STANDINGS
          </h1>
          <p className="font-body text-lg text-gray-700">
            {activeTournament?.name || 'Tournament'} group stage tables
          </p>
        </div>
      </section>

      {/* Tournament Selector */}
      <section className="border-b-thick border-raw-black bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TournamentSelector />
        </div>
      </section>
      
      {/* Standings Tables */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loading size="large" text="Loading standings..." />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-xl text-gray-600">
                No standings data available
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {groups.map(group => (
                allStandings && allStandings[group] && (
                  <GroupTable
                    key={group}
                    group={group}
                    standings={allStandings[group]}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Legend */}
      <section className="border-t-thick border-raw-black bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-body font-semibold uppercase text-sm mb-3">ABBREVIATIONS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div><span className="font-bold">P</span> = Played</div>
            <div><span className="font-bold">W</span> = Wins</div>
            <div><span className="font-bold">D</span> = Draws</div>
            <div><span className="font-bold">L</span> = Losses</div>
            <div><span className="font-bold">GD</span> = Goal Difference</div>
            <div><span className="font-bold">PTS</span> = Points</div>
          </div>
        </div>
      </section>
    </div>
  )
}
