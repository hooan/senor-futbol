import { Link, useParams } from 'react-router-dom'
import { useQuiniela, useLeaderboard, useQuinielaFixtures } from '@/hooks/useQuinielas'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'

export default function Leaderboard() {
  const { id } = useParams<{ id: string }>()
  
  const { data: quiniela, isLoading: loadingQuiniela } = useQuiniela(id)
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(id)
  const { data: fixtures, isLoading: loadingFixtures } = useQuinielaFixtures(id)

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-12 h-12 bg-yellow-400 text-yellow-900 border-thick border-yellow-600 font-headline text-2xl flex items-center justify-center">
            1
          </div>
        )
      case 2:
        return (
          <div className="w-12 h-12 bg-gray-300 text-gray-900 border-thick border-gray-500 font-headline text-2xl flex items-center justify-center">
            2
          </div>
        )
      case 3:
        return (
          <div className="w-12 h-12 bg-orange-400 text-orange-900 border-thick border-orange-600 font-headline text-2xl flex items-center justify-center">
            3
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-gray-100 text-gray-700 border-thick border-gray-300 font-headline text-xl flex items-center justify-center">
            {rank}
          </div>
        )
    }
  }

  const getFinishedMatchesCount = () => {
    if (!fixtures) return 0
    return fixtures.filter((f) => f.status === 'FT').length
  }

  if (loadingQuiniela || loadingLeaderboard || loadingFixtures) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!quiniela || !leaderboard) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h2 className="font-headline text-2xl uppercase mb-4">LEADERBOARD NOT FOUND</h2>
          <p className="text-gray-700 mb-6">Unable to load leaderboard.</p>
          <Link to="/quinielas">
            <Button>BACK TO QUINIELAS</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const finishedMatches = getFinishedMatchesCount()
  const totalMatches = fixtures?.length || 0

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <div className="bg-raw-black text-raw-white py-8 border-b-thick border-raw-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl uppercase mb-2">LEADERBOARD</h1>
              <p className="text-gray-300">{quiniela.name}</p>
            </div>
            <Link to={`/quinielas/${quiniela.share_code}`}>
              <Button variant="secondary" size="small">
                ← BACK
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <Card className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-headline mb-1">{leaderboard.length}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Participants</div>
            </div>
            <div>
              <div className="text-3xl font-headline mb-1">{totalMatches}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Total Matches</div>
            </div>
            <div>
              <div className="text-3xl font-headline text-green-600 mb-1">{finishedMatches}</div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-headline text-yellow-600 mb-1">
                {totalMatches - finishedMatches}
              </div>
              <div className="text-xs uppercase text-gray-600 font-semibold">Remaining</div>
            </div>
          </div>
        </Card>

        {/* Info Banner */}
        {finishedMatches === 0 ? (
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
                <h3 className="font-semibold text-blue-900 mb-1">No Matches Completed Yet</h3>
                <p className="text-blue-800 text-sm">
                  The leaderboard will update automatically as matches finish and points are awarded.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-thick border-green-600 p-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Live Standings</h3>
                <p className="text-green-800 text-sm">
                  Based on {finishedMatches} of {totalMatches} completed matches. Rankings update after each match.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <Card>
          <h2 className="font-headline text-2xl uppercase mb-6">RANKINGS</h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={3}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-600">No participants yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 border-thick transition-all ${
                    entry.rank === 1
                      ? 'border-yellow-400 bg-yellow-50'
                      : entry.rank === 2
                      ? 'border-gray-400 bg-gray-50'
                      : entry.rank === 3
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-900'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.user ? (
                        <>
                          <span className="font-semibold font-mono text-lg truncate">
                            @{entry.user.username}
                          </span>
                          <Badge variant="info">USER</Badge>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-lg truncate">{entry.guest_name}</span>
                          <Badge variant="warning">GUEST</Badge>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.predictions_count} predictions made
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-headline text-3xl mb-1">{entry.total_points}</div>
                    <div className="text-xs uppercase text-gray-500 font-semibold">POINTS</div>
                  </div>

                  {/* Trophy for top 3 */}
                  {entry.rank <= 3 && (
                    <div className="flex-shrink-0 hidden sm:block">
                      {entry.rank === 1 && (
                        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {entry.rank === 2 && (
                        <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                      {entry.rank === 3 && (
                        <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Scoring Reference */}
        <Card className="mt-8 bg-yellow-50 border-thick border-yellow-600">
          <h3 className="font-headline text-lg uppercase mb-4">SCORING SYSTEM</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600 w-8">5</span>
              <div>
                <strong className="font-semibold">Exact Score</strong>
                <p className="text-gray-700">Predicted the exact final score (e.g., 2-1)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600 w-8">3</span>
              <div>
                <strong className="font-semibold">Correct Result</strong>
                <p className="text-gray-700">Predicted the winner or draw correctly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-headline text-2xl text-yellow-600 w-8">1</span>
              <div>
                <strong className="font-semibold">Correct Goal Difference</strong>
                <p className="text-gray-700">Got the goal difference right (e.g., +2)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="mt-12 pt-8 border-t-thick border-gray-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={`/quinielas/${quiniela.id}/predictions`}>
              <Button size="large">VIEW MY PREDICTIONS</Button>
            </Link>
            <Link to={`/quinielas/${quiniela.share_code}`}>
              <Button variant="secondary" size="large">
                QUINIELA DETAILS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
