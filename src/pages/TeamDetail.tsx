import { useParams, useNavigate } from 'react-router-dom'
import { useTeam, useTeamFixtures, useTeamPlayers, useTeamStanding, useTeamStats } from '@/hooks/useTeamDetail'
import { useActiveTournament } from '@/hooks/useActiveTournament'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function TeamDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeTournamentId } = useActiveTournament()

  const { data: team, isLoading: teamLoading } = useTeam(id!)
  const { data: fixtures, isLoading: fixturesLoading } = useTeamFixtures(id!, activeTournamentId || undefined)
  const { data: players, isLoading: playersLoading } = useTeamPlayers(id!)
  const { data: standing } = useTeamStanding(id!, activeTournamentId || undefined)
  const { data: stats } = useTeamStats(id!, activeTournamentId || undefined)

  if (teamLoading || fixturesLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text={t('fixtures.loadingTeamDetails')} />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-headline text-2xl uppercase mb-4">{t('fixtures.teamNotFound')}</p>
          <Button onClick={() => navigate('/fixtures')}>{t('fixtures.backToFixtures')}</Button>
        </div>
      </div>
    )
  }

  // Group players by position
  const playersByPosition = {
    Goalkeeper: players?.filter((p) => p.position === 'Goalkeeper') || [],
    Defender: players?.filter((p) => p.position === 'Defender') || [],
    Midfielder: players?.filter((p) => p.position === 'Midfielder') || [],
    Attacker: players?.filter((p) => p.position === 'Attacker') || [],
  }

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button onClick={() => navigate(-1)} size="small" className="mb-6">
            ← {t('common.back').toUpperCase()}
          </Button>

          {/* Team Info */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 border-thick border-raw-black flex items-center justify-center bg-white overflow-hidden">
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="font-mono text-4xl">{team.code}</span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-headline text-5xl uppercase mb-2">{team.name}</h1>
              <p className="font-mono text-sm text-gray-600 uppercase">{t('teams.countryCode')}: {team.code}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Matches Played */}
          <Card variant="elevated">
            <p className="font-mono text-xs uppercase text-gray-600 mb-2">{t('teams.matchesPlayed')}</p>
            <p className="font-headline text-4xl">{stats?.played || 0}</p>
          </Card>

          {/* Record */}
          <Card variant="elevated">
            <p className="font-mono text-xs uppercase text-gray-600 mb-2">{t('teams.recordWDL')}</p>
            <p className="font-headline text-4xl">
              {stats?.wins || 0}-{stats?.draws || 0}-{stats?.losses || 0}
            </p>
          </Card>

          {/* Goals */}
          <Card variant="elevated">
            <p className="font-mono text-xs uppercase text-gray-600 mb-2">{t('teams.goalsForAgainst')}</p>
            <p className="font-headline text-4xl">
              {stats?.goalsFor || 0} / {stats?.goalsAgainst || 0}
            </p>
          </Card>

          {/* Goal Difference */}
          <Card variant="elevated">
            <p className="font-mono text-xs uppercase text-gray-600 mb-2">{t('teams.goalDifference')}</p>
            <p className={`font-headline text-4xl ${(stats?.goalDifference || 0) > 0 ? 'text-green-600' : (stats?.goalDifference || 0) < 0 ? 'text-red-600' : ''}`}>
              {(stats?.goalDifference || 0) > 0 ? '+' : ''}{stats?.goalDifference || 0}
            </p>
          </Card>
        </div>

        {/* Group Standing */}
        {standing && (
          <Card variant="elevated" className="mb-8">
            <h3 className="font-headline text-2xl uppercase mb-4">
              {t('teams.groupStanding', { group: standing.group_name })}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="font-mono text-xs uppercase text-gray-600 mb-1">{t('standings.position')}</p>
                <p className="font-headline text-3xl">{standing.rank}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-gray-600 mb-1">{t('teams.pointsLabel')}</p>
                <p className="font-headline text-3xl">{standing.points}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-gray-600 mb-1">{t('teams.playedLabel')}</p>
                <p className="font-headline text-3xl">{standing.played}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-gray-600 mb-1">{t('teams.goalDiffLabel')}</p>
                <p className={`font-headline text-3xl ${standing.goal_difference > 0 ? 'text-green-600' : standing.goal_difference < 0 ? 'text-red-600' : ''}`}>
                  {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Fixtures */}
        <Card variant="elevated" className="mb-8">
          <h3 className="font-headline text-2xl uppercase mb-6">{t('teams.matches').toUpperCase()}</h3>

          {fixtures && fixtures.length > 0 ? (
            <div className="space-y-3">
              {fixtures.map((fixture) => {
                const isHome = fixture.home_team_id === id
                const opponent = isHome ? fixture.away_team : fixture.home_team
                const teamScore = isHome ? fixture.home_score : fixture.away_score
                const opponentScore = isHome ? fixture.away_score : fixture.home_score

                let result: 'win' | 'draw' | 'loss' | 'pending' = 'pending'
                if (fixture.status === 'FT') {
                  if (teamScore! > opponentScore!) result = 'win'
                  else if (teamScore === opponentScore) result = 'draw'
                  else result = 'loss'
                }

                return (
                  <div
                    key={fixture.id}
                    className={`flex items-center justify-between p-4 border-thin cursor-pointer hover:border-thick transition-all ${
                      result === 'win'
                        ? 'border-green-300 bg-green-50'
                        : result === 'loss'
                        ? 'border-red-300 bg-red-50'
                        : result === 'draw'
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-300'
                    }`}
                    onClick={() => navigate(`/fixtures/${fixture.id}`)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[80px]">
                        <p className="font-mono text-xs text-gray-600">
                          {format(new Date(fixture.match_date), 'MMM d')}
                        </p>
                        <p className="font-mono text-tiny text-gray-500">
                          {format(new Date(fixture.match_date), 'HH:mm')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-body text-sm">{isHome ? t('teams.vs') : t('teams.at')}</span>
                        <div className="w-10 h-10 border-thin border-raw-black flex items-center justify-center bg-white overflow-hidden">
                          {opponent.logo_url ? (
                            <img 
                              src={opponent.logo_url} 
                              alt={opponent.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="font-mono text-xs">{opponent.code}</span>
                          )}
                        </div>
                        <span className="font-body font-semibold">{opponent.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {fixture.status === 'FT' ? (
                        <>
                          <div className="text-right">
                            <span className="font-headline text-2xl">
                              {teamScore} - {opponentScore}
                            </span>
                          </div>
                          {result === 'win' && <Badge variant="success">{t('teams.win')}</Badge>}
                          {result === 'draw' && <Badge variant="warning">{t('teams.draw')}</Badge>}
                          {result === 'loss' && <Badge variant="error">{t('teams.loss')}</Badge>}
                        </>
                      ) : (
                        <Badge variant="default">{fixture.status}</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-600 font-body">{t('teams.noMatchesFound')}</p>
          )}
        </Card>

        {/* Squad/Roster */}
        {players && players.length > 0 && (
          <Card variant="elevated">
            <h3 className="font-headline text-2xl uppercase mb-6">{t('teams.squadPlayers', { count: players.length })}</h3>

            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(playersByPosition).map(([position, positionPlayers]) => {
                if (positionPlayers.length === 0) return null

                return (
                  <div key={position}>
                    <h4 className="font-headline text-lg uppercase mb-4 pb-2 border-b-thick border-raw-black">
                      {t(`teams.positionPlayers`, { position: t(`teams.${position.toLowerCase()}`), count: positionPlayers.length })}
                    </h4>

                    <div className="space-y-2">
                      {positionPlayers.map((player) => (
                        <div key={player.id} className="flex items-center gap-3 p-2 border-thin border-gray-200">
                          <span className="font-mono text-sm font-bold w-8">{player.number || '-'}</span>
                          <div className="flex-1">
                            <p className="font-body text-sm font-semibold">{player.name}</p>
                            {player.age && (
                              <p className="font-mono text-xs text-gray-600">{t('teams.ageLabel')}: {player.age}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {players.length === 0 && (
              <p className="text-center py-8 text-gray-600 font-body">{t('teams.noRosterInfo')}</p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
