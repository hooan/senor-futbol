import { useState, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuinielaByShareCode, useJoinQuiniela, useIsParticipant, useParticipants } from '@/hooks/useQuinielas'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'
import CopyButton from '@/components/ui/CopyButton'
import ShareButtons from '@/components/ui/ShareButtons'
import { format } from 'date-fns'

export default function QuinielaDetail() {
  const { t } = useTranslation()
  const { shareCode } = useParams<{ shareCode: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const { data: quiniela, isLoading } = useQuinielaByShareCode(shareCode)
  const { data: isParticipant } = useIsParticipant(quiniela?.id, user?.id || null)
  const { data: participants } = useParticipants(quiniela?.id)
  const joinMutation = useJoinQuiniela()

  const [guestName, setGuestName] = useState('')
  const [error, setError] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)

  const isPastDeadline = quiniela ? new Date(quiniela.deadline) < new Date() : false

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!quiniela) return

    // If not logged in, require guest name
    if (!user && (!guestName || guestName.trim().length < 2)) {
      setError(t('validation.minLength', { count: 2 }))
      return
    }

    try {
      await joinMutation.mutateAsync({
        quinielaId: quiniela.id,
        userId: user?.id || null,
        guestName: !user && guestName ? guestName.trim() : null,
      })
      
      showToast(t('messages.success'), 'success')
      
      // Success! Navigate to predictions page
      navigate(`/quinielas/${quiniela.id}/predictions`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('quinielas.failedToSavePrediction')
      setError(errorMsg)
      showToast(errorMsg, 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!quiniela) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="font-headline text-2xl uppercase mb-4">{t('quinielas.quinielaNotFound').toUpperCase()}</h2>
          <p className="text-gray-700 mb-6">
            {t('quinielas.quinielaNotFoundDesc', { code: shareCode })}
          </p>
          <Link to="/quinielas">
            <Button>{t('quinielas.browseQuinielas').toUpperCase()}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Hero */}
      <div className="bg-raw-black text-raw-white py-12 border-b-thick border-raw-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-4xl sm:text-5xl uppercase mb-2">
                {quiniela.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <span className="font-mono">by @{quiniela.creator.username}</span>
                <span>•</span>
                <span>{participants?.length || 0} {t('quinielas.participants').toLowerCase()}</span>
              </div>
            </div>
            <Badge variant={quiniela.is_public ? 'success' : 'warning'}>
              {quiniela.is_public ? t('quinielas.public').toUpperCase() : t('quinielas.private').toUpperCase()}
            </Badge>
          </div>
          {quiniela.description && (
            <p className="text-gray-200 text-lg max-w-3xl">{quiniela.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Join Section */}
            {!isParticipant && (
              <Card className="bg-gradient-to-br from-blue-50 to-white border-thick border-blue-600">
                <h2 className="font-headline text-2xl uppercase mb-4">{t('quinielas.joinThisQuiniela').toUpperCase()}</h2>
                
                {isPastDeadline ? (
                  <div className="bg-red-50 border-thick border-red-600 p-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-red-900 mb-1">{t('quinielas.deadlineHasPassed')}</h3>
                        <p className="text-red-800 text-sm">
                          {t('quinielas.deadlinePassedDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : showJoinForm || !user ? (
                  <form onSubmit={handleJoin} className="space-y-6">
                    {!user && (
                      <div>
                        <label htmlFor="guestName" className="block font-semibold mb-2 uppercase text-sm">
                          {t('quinielas.yourName').toUpperCase()}
                        </label>
                        <Input
                          id="guestName"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder={t('quinielas.enterYourName')}
                          required
                          minLength={2}
                          maxLength={50}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {t('quinielas.joiningAsGuest')}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border-thick border-red-600 p-4">
                        <p className="text-red-800 font-semibold text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={joinMutation.isPending}
                        size="large"
                      >
                        {joinMutation.isPending ? t('quinielas.joining').toUpperCase() : t('quinielas.joinNow').toUpperCase()}
                      </Button>
                      {user && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowJoinForm(false)}
                        >
                          {t('common.cancel').toUpperCase()}
                        </Button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-6">
                      {t('quinielas.readyToCompete')}
                    </p>
                    <Button onClick={() => setShowJoinForm(true)} size="large">
                      {t('quinielas.joinAsUser', { username: user.user_metadata?.username }).toUpperCase()}
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Already Joined */}
            {isParticipant && (
              <Card className="bg-gradient-to-br from-green-50 to-white border-thick border-green-600">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center border-thick border-green-700">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-headline text-xl uppercase mb-2">{t('quinielas.youreIn').toUpperCase()}</h3>
                    <p className="text-gray-700 mb-4">
                      {t('quinielas.youreInDesc')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/quinielas/${quiniela.id}/predictions`}>
                        <Button>{t('quinielas.makePredictions').toUpperCase()}</Button>
                      </Link>
                      <Link to={`/quinielas/${quiniela.id}/leaderboard`}>
                        <Button variant="secondary">{t('quinielas.viewLeaderboard').toUpperCase()}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Participants List */}
            <Card>
              <h2 className="font-headline text-2xl uppercase mb-6">
                {t('quinielas.participants').toUpperCase()} ({participants?.length || 0})
              </h2>
              {!participants || participants.length === 0 ? (
                <p className="text-gray-600 text-center py-8">{t('quinielas.noParticipantsYet')}</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-4 border-3 border-gray-200 hover:border-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 text-white font-headline text-lg flex items-center justify-center border-3 border-gray-900">
                          {participant.user
                            ? participant.user.username[0].toUpperCase()
                            : participant.guest_name?.[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {participant.user ? (
                              <span className="font-mono">@{participant.user.username}</span>
                            ) : (
                              <span>{participant.guest_name}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t('quinielas.joined')} {format(new Date(participant.joined_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-headline text-2xl">{participant.total_points}</div>
                        <div className="text-xs uppercase text-gray-500">{t('quinielas.points').toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <Card>
              <h3 className="font-headline text-lg uppercase mb-4">{t('quinielas.details').toUpperCase()}</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    {t('quinielas.shareCode')}
                  </div>
                  <div className="font-mono text-xl font-bold bg-gray-100 px-3 py-2 border-3 border-gray-900 text-center mb-2">
                    {quiniela.share_code}
                  </div>
                  <CopyButton
                    text={quiniela.share_code}
                    label={t('quinielas.copyCode').toUpperCase()}
                    successMessage={t('quinielas.shareCodeCopied')}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    {t('quinielas.deadline')}
                  </div>
                  <div className={`font-mono ${isPastDeadline ? 'text-red-600' : 'text-gray-900'}`}>
                    {format(new Date(quiniela.deadline), 'MMM d, yyyy')}
                    <br />
                    {format(new Date(quiniela.deadline), 'h:mm a')}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
                    {t('quinielas.created')}
                  </div>
                  <div className="text-sm text-gray-700">
                    {format(new Date(quiniela.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </Card>

            {/* Scoring Rules */}
            <Card className="bg-yellow-50 border-thick border-yellow-600">
              <h3 className="font-headline text-lg uppercase mb-4">{t('quinielas.scoring').toUpperCase()}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-xl text-yellow-600">5</span>
                  <span>{t('quinielas.exactScore')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-xl text-yellow-600">3</span>
                  <span>{t('quinielas.correctResultScore')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-xl text-yellow-600">1</span>
                  <span>{t('quinielas.correctGoalDifference')}</span>
                </div>
              </div>
            </Card>

            {/* Share Quiniela */}
            <Card>
              <h3 className="font-headline text-lg uppercase mb-4">{t('quinielas.shareQuiniela').toUpperCase()}</h3>
              <p className="text-sm text-gray-700 mb-4">
                {t('quinielas.shareQuinielaDesc')}
              </p>
              <ShareButtons
                url={window.location.href}
                title={`Join "${quiniela.name}" - World Cup 2026 Predictions!`}
                text={`Join my World Cup prediction pool! Use code: ${quiniela.share_code}`}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
