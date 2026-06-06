import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  return (
    <Card variant="elevated">
      <h3 className="font-headline text-2xl uppercase mb-4">{t('standings.group')} {group}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-thick border-raw-black">
              <th className="text-left py-2 px-2 font-mono text-xs uppercase">#</th>
              <th className="text-left py-2 px-2 font-mono text-xs uppercase">{t('standings.team')}</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">{t('standings.abbr.played')}</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">{t('standings.abbr.wins')}</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">{t('standings.abbr.draws')}</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">{t('standings.abbr.losses')}</th>
              <th className="text-center py-2 px-1 font-mono text-xs uppercase">{t('standings.abbr.goalDifference')}</th>
              <th className="text-center py-2 px-2 font-mono text-xs uppercase font-bold">{t('standings.abbr.points')}</th>
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
          {t('standings.qualifiedForKnockout')}
        </p>
      </div>
    </Card>
  )
}

export default function Standings() {
  const { t } = useTranslation()
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
            {t('standings.title')}
          </h1>
          <p className="font-body text-lg text-gray-700">
            {activeTournament?.name || t('standings.tournament')} {t('standings.subtitle')}
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
              <Loading size="large" text={t('common.loading')} />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-xl text-gray-600">
                {t('standings.noData')}
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
          <h3 className="font-body font-semibold uppercase text-sm mb-3">{t('standings.abbreviations')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div><span className="font-bold">{t('standings.abbr.played')}</span> = {t('standings.labels.played')}</div>
            <div><span className="font-bold">{t('standings.abbr.wins')}</span> = {t('standings.labels.wins')}</div>
            <div><span className="font-bold">{t('standings.abbr.draws')}</span> = {t('standings.labels.draws')}</div>
            <div><span className="font-bold">{t('standings.abbr.losses')}</span> = {t('standings.labels.losses')}</div>
            <div><span className="font-bold">{t('standings.abbr.goalDifference')}</span> = {t('standings.labels.goalDifference')}</div>
            <div><span className="font-bold">{t('standings.abbr.points')}</span> = {t('standings.labels.points')}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
