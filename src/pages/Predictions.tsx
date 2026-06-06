import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuiniela, useQuinielaFixtures, useUserPredictions, useMakePrediction } from '@/hooks/useQuinielas'
import { useAuth } from '@/contexts/AuthContext'
import { guestSession } from '@/lib/guestSession'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import { format, isPast } from 'date-fns'
import type { FixtureWithTeams } from '@/types/database'

interface PredictionFormData {
  [fixtureId: string]: {
    home_score: string
    away_score: string
  }
}

export default function Predictions() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  // Resolve guest token: URL param takes precedence (cross-device restore),
  // then fall back to localStorage.
  const guestToken = useMemo(() => {
    const url = searchParams.get('guest_token')
    if (url) return url
    if (id) return guestSession.get(id)?.guest_token ?? null
    return null
  }, [searchParams, id])

  const { data: quiniela, isLoading: loadingQuiniela } = useQuiniela(id)
  const { data: fixtures, isLoading: loadingFixtures } = useQuinielaFixtures(id)
  const { data: existingPredictions, isLoading: loadingPredictions } = useUserPredictions(
    id,
    user?.id || null,
    guestToken
  )
  const makePrediction = useMakePrediction()

  const [predictions, setPredictions] = useState<PredictionFormData>({})
  const [savingFixtureId, setSavingFixtureId] = useState<string | null>(null)
  const [savedFixtures, setSavedFixtures] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string>('')

  // Initialize predictions from existing data
  useEffect(() => {
    if (existingPredictions && fixtures) {
      const initialPredictions: PredictionFormData = {}
      existingPredictions.forEach((pred) => {
        initialPredictions[pred.fixture_id] = {
          home_score: pred.predicted_home_score.toString(),
          away_score: pred.predicted_away_score.toString(),
        }
      })
      setPredictions(initialPredictions)
    }
  }, [existingPredictions, fixtures])

  const handleScoreChange = (fixtureId: string, field: 'home_score' | 'away_score', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return
    if (value.length > 2) return

    setPredictions((prev) => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [field]: value,
      },
    }))

    setSavedFixtures((prev) => {
      const newSet = new Set(prev)
      newSet.delete(fixtureId)
      return newSet
    })
  }

  const handleSavePrediction = async (fixtureId: string) => {
    setError('')
    const prediction = predictions[fixtureId]

    if (!prediction || prediction.home_score === '' || prediction.away_score === '') {
      setError(t('quinielas.pleaseEnterBothScores'))
      return
    }

    const homeScore = parseInt(prediction.home_score, 10)
    const awayScore = parseInt(prediction.away_score, 10)

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      setError(t('quinielas.pleaseEnterValidScores'))
      return
    }

    if (!quiniela) return

    setSavingFixtureId(fixtureId)

    try {
      await makePrediction.mutateAsync({
        userId: user?.id || null,
        guestToken,
        input: {
          quiniela_id: quiniela.id,
          fixture_id: fixtureId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        },
      })

      setSavedFixtures((prev) => new Set(prev).add(fixtureId))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quinielas.failedToSavePrediction'))
    } finally {
      setSavingFixtureId(null)
    }
  }

  // Lock per-match at kick-off — quiniela deadline governs joining only
  const canPredict = (fixture: FixtureWithTeams) => {
    return !isPast(new Date(fixture.match_date))
  }

  const getPredictionStatus = (fixture: FixtureWithTeams): 'saved' | 'partial' | 'empty' | 'locked' => {
    if (!canPredict(fixture)) return 'locked'
    const pred = predictions[fixture.id]
    if (!pred || (pred.home_score === '' && pred.away_score === '')) return 'empty'
    if (savedFixtures.has(fixture.id)) return 'saved'
    if (pred.home_score !== '' && pred.away_score !== '') return 'partial'
    return 'partial'
  }

  const getPointsEarned = (fixture: FixtureWithTeams): number | null => {
    if (fixture.status !== 'FT') return null
    const pred = existingPredictions?.find((p) => p.fixture_id === fixture.id)
    return pred?.points_earned || null
  }

  const groupFixturesByRound = () => {
    if (!fixtures) return {}
    const grouped: Record<string, FixtureWithTeams[]> = {}
    fixtures.forEach((fixture) => {
      if (!grouped[fixture.round]) grouped[fixture.round] = []
      grouped[fixture.round].push(fixture)
    })
    return grouped
  }

  const countPredictions = () => {
    if (!fixtures) return { total: 0, saved: 0, pending: 0 }
    const total = fixtures.length
    const saved = fixtures.filter((f) =>
      savedFixtures.has(f.id) || existingPredictions?.some((p) => p.fixture_id === f.id)
    ).length
    return { total, saved, pending: total - saved }
  }

  if (loadingQuiniela || loadingFixtures || loadingPredictions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!quiniela || !fixtures) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h2 className="font-headline text-2xl uppercase mb-4">{t('quinielas.quinielaNotFound').toUpperCase()}</h2>
          <p className="text-gray-700 mb-6">{t('quinielas.unableToLoad')}</p>
          <Link to="/quinielas">
            <Button>{t('quinielas.backToQuinielas').toUpperCase()}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Guard: unauthenticated visitor with no guest token hasn't joined
  if (!user && !guestToken) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h2 className="font-headline text-2xl uppercase mb-4">
            {t('quinielas.joinThisQuiniela').toUpperCase()}
          </h2>
          <p className="text-gray-700 mb-6">{t('quinielas.youreInDesc')}</p>
          <Link to={`/quinielas/${quiniela.share_code}`}>
            <Button size="large">{t('quinielas.joinNow').toUpperCase()}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const groupedFixtures = groupFixturesByRound()
  const stats = countPredictions()
  const joiningClosed = isPast(new Date(quiniela.deadline))

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <div className="bg-raw-black text-raw-white py-8 border-b-thick border-raw-black sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl uppercase mb-2">{quiniela.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="font-mono">{t('quinielas.predictions')}</span>
                <span>•</span>
                <span>{stats.saved} / {stats.total} {t('quinielas.saved').toLowerCase()}</span>
              </div>
            </div>
            <Link to={`/quinielas/${quiniela.share_code}`}>
              <Button variant="secondary" size="small">
                ← {t('common.back').toUpperCase()}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <Card className="mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-headline mb-1">{stats.total}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">{t('quinielas.totalMatches')}</div>
            </div>
            <div>
              <div className="text-3xl font-headline text-green-600 mb-1">{stats.saved}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">{t('quinielas.saved')}</div>
            </div>
            <div>
              <div className="text-3xl font-headline text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">{t('quinielas.pending')}</div>
            </div>
          </div>
        </Card>

        {/* Info Banner */}
        {joiningClosed ? (
          <div className="bg-yellow-50 border-thick border-yellow-600 p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">{t('quinielas.joiningClosed')}</h3>
                <p className="text-yellow-800 text-sm">
                  {t('quinielas.joiningClosedPredictions')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-thick border-blue-600 p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">{t('quinielas.makePredictionsPrompt')}</h3>
                <p className="text-blue-800 text-sm">
                  {t('quinielas.predictionsLockPerMatch')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-thick border-red-600 p-4 mb-8">
            <p className="text-red-800 font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Fixtures by Round */}
        {Object.entries(groupedFixtures).map(([round, roundFixtures]) => (
          <div key={round} className="mb-12">
            <h2 className="font-headline text-2xl uppercase mb-6 pb-3 border-b-thick border-gray-900">
              {round}
            </h2>
            <div className="space-y-4">
              {roundFixtures.map((fixture) => {
                const status = getPredictionStatus(fixture)
                const pointsEarned = getPointsEarned(fixture)
                const pred = predictions[fixture.id] || { home_score: '', away_score: '' }
                const isLocked = !canPredict(fixture)
                const isSaving = savingFixtureId === fixture.id

                return (
                  <Card key={fixture.id} className={`${status === 'saved' ? 'border-green-600' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Match Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500">
                            {format(new Date(fixture.match_date), 'MMM d, h:mm a')}
                          </span>
                          {fixture.status === 'FT' && (
                            <Badge variant="default">{t('quinielas.final').toUpperCase()}</Badge>
                          )}
                          {fixture.status === 'LIVE' && (
                            <Badge variant="error">{t('quinielas.live').toUpperCase()}</Badge>
                          )}
                          {isLocked && fixture.status === 'NS' && (
                            <Badge variant="warning">{t('quinielas.locked').toUpperCase()}</Badge>
                          )}
                        </div>

                        {/* Teams */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <img
                              src={fixture.home_team.logo_url || ''}
                              alt={fixture.home_team.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="font-semibold">{fixture.home_team.name}</span>
                            {fixture.status === 'FT' && (
                              <span className="font-headline text-xl ml-auto">{fixture.home_score}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1">
                            <img
                              src={fixture.away_team.logo_url || ''}
                              alt={fixture.away_team.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <span className="font-semibold">{fixture.away_team.name}</span>
                            {fixture.status === 'FT' && (
                              <span className="font-headline text-xl ml-auto">{fixture.away_score}</span>
                            )}
                          </div>
                        </div>

                        {/* Points Display */}
                        {pointsEarned !== null && (
                          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-100 border-3 border-yellow-600 px-3 py-1">
                            <span className="font-headline text-lg text-yellow-600">{pointsEarned}</span>
                            <span className="text-xs uppercase font-semibold text-yellow-700">{t('quinielas.pointsEarned').toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      {/* Prediction Input */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={pred.home_score}
                            onChange={(e) => handleScoreChange(fixture.id, 'home_score', e.target.value)}
                            placeholder="0"
                            className="w-16 text-center font-headline text-xl"
                            disabled={isLocked}
                          />
                          <span className="font-headline text-2xl text-gray-400">:</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={pred.away_score}
                            onChange={(e) => handleScoreChange(fixture.id, 'away_score', e.target.value)}
                            placeholder="0"
                            className="w-16 text-center font-headline text-xl"
                            disabled={isLocked}
                          />
                        </div>

                        {!isLocked && (
                          <Button
                            onClick={() => handleSavePrediction(fixture.id)}
                            disabled={isSaving || pred.home_score === '' || pred.away_score === ''}
                            size="small"
                          >
                            {isSaving ? '...' : status === 'saved' ? `✓ ${t('quinielas.saved').toUpperCase()}` : t('common.save').toUpperCase()}
                          </Button>
                        )}

                        {status === 'saved' && !isSaving && (
                          <div className="hidden sm:block text-green-600 text-sm font-semibold">
                            ✓ {t('quinielas.saved')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {/* Bottom Actions */}
        <div className="mt-12 pt-8 border-t-thick border-gray-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/quinielas/${quiniela.id}/leaderboard`}>
              <Button variant="secondary" size="large">
                {t('quinielas.viewLeaderboard').toUpperCase()}
              </Button>
            </Link>
            <Link to={`/quinielas/${quiniela.share_code}`}>
              <Button variant="secondary" size="large">
                {t('quinielas.quinielaDetails').toUpperCase()}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
