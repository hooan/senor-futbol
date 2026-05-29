import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useMatchDetail } from '@/hooks/useMatchDetail'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fixture, events, lineups, statistics, isLoading } = useMatchDetail(id!)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text="Loading match details..." />
      </div>
    )
  }

  if (!fixture) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-headline text-2xl uppercase mb-4">MATCH NOT FOUND</p>
          <Button onClick={() => navigate('/fixtures')}>BACK TO FIXTURES</Button>
        </div>
      </div>
    )
  }

  const matchDate = new Date(fixture.match_date)
  const dateStr = format(matchDate, 'EEEE, MMMM d, yyyy')
  const timeStr = format(matchDate, 'HH:mm')

  const getStatusBadge = () => {
    switch (fixture.status) {
      case 'NS':
        return <Badge variant="default">NOT STARTED</Badge>
      case 'LIVE':
        return <Badge variant="error">LIVE</Badge>
      case 'HT':
        return <Badge variant="warning">HALF TIME</Badge>
      case 'FT':
        return <Badge variant="success">FULL TIME</Badge>
      default:
        return <Badge variant="default">{fixture.status}</Badge>
    }
  }

  // Group lineups by team
  const homeLineups = lineups.filter((l) => l.team_id === fixture.home_team_id)
  const awayLineups = lineups.filter((l) => l.team_id === fixture.away_team_id)

  // Group statistics by team
  const homeStats = statistics.filter((s) => s.team_id === fixture.home_team_id)
  const awayStats = statistics.filter((s) => s.team_id === fixture.away_team_id)

  // Get formation for each team
  const homeFormation = homeLineups.find((l) => l.formation)?.formation
  const awayFormation = awayLineups.find((l) => l.formation)?.formation

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => navigate('/fixtures')} size="small" className="mb-4">
            ← BACK TO FIXTURES
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-sm uppercase text-gray-600">{dateStr}</p>
              <p className="font-mono text-sm text-gray-600">{timeStr}</p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Match Info */}
          <div className="flex items-center gap-2 text-sm font-mono text-gray-600">
            <span className="uppercase">{fixture.round}</span>
            {fixture.group_name && (
              <>
                <span>•</span>
                <span>GROUP {fixture.group_name}</span>
              </>
            )}
            {fixture.venue && (
              <>
                <span>•</span>
                <span className="truncate">{fixture.venue}</span>
              </>
            )}
            {fixture.referee && (
              <>
                <span>•</span>
                <span>Referee: {fixture.referee}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Score Header */}
      <section className="border-b-thick border-raw-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Home Team */}
            <div className="text-center">
              <div className="w-20 h-20 border-thick border-raw-black mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-2xl">{fixture.home_team.code}</span>
              </div>
              <h2 className="font-headline text-2xl uppercase">{fixture.home_team.name}</h2>
            </div>

            {/* Score */}
            <div className="text-center">
              {fixture.status === 'FT' || fixture.status === 'LIVE' ? (
                <div className="flex items-center justify-center gap-6">
                  <span className="font-headline text-6xl">{fixture.home_score ?? 0}</span>
                  <span className="font-headline text-4xl text-gray-400">-</span>
                  <span className="font-headline text-6xl">{fixture.away_score ?? 0}</span>
                </div>
              ) : (
                <p className="font-headline text-2xl text-gray-500 uppercase">VS</p>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="w-20 h-20 border-thick border-raw-black mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-2xl">{fixture.away_team.code}</span>
              </div>
              <h2 className="font-headline text-2xl uppercase">{fixture.away_team.name}</h2>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Events Timeline */}
        {events.length > 0 && (
          <Card variant="elevated" className="mb-8">
            <h3 className="font-headline text-2xl uppercase mb-6">MATCH EVENTS</h3>

            <div className="space-y-4">
              {events.map((event) => {
                const isHomeTeam = event.team_id === fixture.home_team_id
                const timeDisplay = event.time_extra
                  ? `${event.time_elapsed}+${event.time_extra}'`
                  : `${event.time_elapsed}'`

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 border-thin ${
                      isHomeTeam ? 'border-blue-300 bg-blue-50' : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="font-mono text-sm font-bold w-12 flex-shrink-0">{timeDisplay}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body font-semibold">{event.player_name}</span>
                        {event.event_type === 'goal' && <span className="text-2xl">⚽</span>}
                        {event.event_type === 'card' && event.detail.includes('Yellow') && (
                          <span className="inline-block w-4 h-6 bg-yellow-400 border-thin border-black"></span>
                        )}
                        {event.event_type === 'card' && event.detail.includes('Red') && (
                          <span className="inline-block w-4 h-6 bg-red-600 border-thin border-black"></span>
                        )}
                        {event.event_type === 'subst' && <span className="text-xl">🔄</span>}
                      </div>

                      <p className="text-sm font-mono text-gray-600">{event.detail}</p>

                      {event.assist_name && (
                        <p className="text-xs font-mono text-gray-500 mt-1">Assist: {event.assist_name}</p>
                      )}

                      {event.comments && (
                        <p className="text-xs font-mono text-gray-500 mt-1 italic">{event.comments}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-600 uppercase">{event.team?.name}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Lineups */}
        {lineups.length > 0 && (
          <Card variant="elevated" className="mb-8">
            <h3 className="font-headline text-2xl uppercase mb-6">LINEUPS</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Home Team Lineup */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b-thick border-raw-black">
                  <h4 className="font-headline text-xl uppercase">{fixture.home_team.name}</h4>
                  {homeFormation && (
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 border-thin border-gray-300">
                      {homeFormation}
                    </span>
                  )}
                </div>

                {/* Starting XI */}
                <div className="mb-6">
                  <p className="font-mono text-xs uppercase text-gray-600 mb-3">STARTING XI</p>
                  <div className="space-y-2">
                    {homeLineups
                      .filter((l) => l.is_starter)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 border-thin border-gray-200">
                          <span className="font-mono text-sm font-bold w-8">{player.player_number || '-'}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm font-semibold">{player.player_name}</p>
                            <p className="font-mono text-xs text-gray-600">{player.position}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Substitutes */}
                <div>
                  <p className="font-mono text-xs uppercase text-gray-600 mb-3">SUBSTITUTES</p>
                  <div className="space-y-2">
                    {homeLineups
                      .filter((l) => !l.is_starter)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 bg-gray-50">
                          <span className="font-mono text-sm font-bold w-8">{player.player_number || '-'}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm">{player.player_name}</p>
                            <p className="font-mono text-xs text-gray-600">{player.position}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Away Team Lineup */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b-thick border-raw-black">
                  <h4 className="font-headline text-xl uppercase">{fixture.away_team.name}</h4>
                  {awayFormation && (
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 border-thin border-gray-300">
                      {awayFormation}
                    </span>
                  )}
                </div>

                {/* Starting XI */}
                <div className="mb-6">
                  <p className="font-mono text-xs uppercase text-gray-600 mb-3">STARTING XI</p>
                  <div className="space-y-2">
                    {awayLineups
                      .filter((l) => l.is_starter)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 border-thin border-gray-200">
                          <span className="font-mono text-sm font-bold w-8">{player.player_number || '-'}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm font-semibold">{player.player_name}</p>
                            <p className="font-mono text-xs text-gray-600">{player.position}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Substitutes */}
                <div>
                  <p className="font-mono text-xs uppercase text-gray-600 mb-3">SUBSTITUTES</p>
                  <div className="space-y-2">
                    {awayLineups
                      .filter((l) => !l.is_starter)
                      .map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 bg-gray-50">
                          <span className="font-mono text-sm font-bold w-8">{player.player_number || '-'}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm">{player.player_name}</p>
                            <p className="font-mono text-xs text-gray-600">{player.position}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics */}
        {statistics.length > 0 && (
          <Card variant="elevated" className="mb-8">
            <h3 className="font-headline text-2xl uppercase mb-6">MATCH STATISTICS</h3>

            <div className="space-y-6">
              {/* Get unique stat types */}
              {Array.from(new Set(statistics.map((s) => s.stat_type))).map((statType) => {
                const homeStat = homeStats.find((s) => s.stat_type === statType)
                const awayStat = awayStats.find((s) => s.stat_type === statType)

                if (!homeStat && !awayStat) return null

                const homeValue = homeStat?.stat_value || '0'
                const awayValue = awayStat?.stat_value || '0'

                // Calculate percentage for bar (if numeric)
                const homeNum = parseFloat(homeValue.replace('%', ''))
                const awayNum = parseFloat(awayValue.replace('%', ''))
                const total = homeNum + awayNum
                const homePercent = total > 0 ? (homeNum / total) * 100 : 50
                const awayPercent = total > 0 ? (awayNum / total) * 100 : 50

                return (
                  <div key={statType}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold">{homeValue}</span>
                      <span className="font-mono text-xs uppercase text-gray-600">{statType}</span>
                      <span className="font-mono text-sm font-bold">{awayValue}</span>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex h-6 border-thin border-raw-black overflow-hidden">
                      <div
                        className="bg-blue-500 flex items-center justify-end pr-2"
                        style={{ width: `${homePercent}%` }}
                      >
                        <span className="font-mono text-xs text-white">{homePercent.toFixed(0)}%</span>
                      </div>
                      <div
                        className="bg-red-500 flex items-center justify-start pl-2"
                        style={{ width: `${awayPercent}%` }}
                      >
                        <span className="font-mono text-xs text-white">{awayPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {events.length === 0 && lineups.length === 0 && statistics.length === 0 && (
          <Card variant="elevated">
            <div className="text-center py-12">
              <p className="font-body text-xl text-gray-600 mb-2">No detailed match data available</p>
              <p className="font-body text-sm text-gray-500">
                {fixture.status === 'NS'
                  ? 'Match has not started yet'
                  : 'Detailed statistics will be available after the match'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
