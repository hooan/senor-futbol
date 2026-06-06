import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUserQuinielas } from '@/hooks/useQuinielas'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'

export default function Profile() {
  const { t } = useTranslation()
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const { data: userQuinielas, isLoading: loadingQuinielas } = useUserQuinielas(user?.id)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text={t('auth.loadingProfile')} />
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const username = user.user_metadata?.username || 'User'
  const email = user.email || ''
  const createdAt = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-raw-white">
      {/* Header */}
      <section className="border-b-thick border-raw-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-headline text-5xl md:text-6xl uppercase mb-4">
            {t('auth.profile').toUpperCase()}
          </h1>
          <p className="font-body text-lg text-gray-700">
            {t('auth.manageAccount')}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Account + Actions row */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Account Information */}
            <Card variant="elevated">
              <h2 className="font-headline text-2xl uppercase mb-6">
                {t('auth.accountInfo').toUpperCase()}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    {t('auth.username')}
                  </label>
                  <p className="font-body text-lg font-semibold">{username}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    {t('auth.email')}
                  </label>
                  <p className="font-body text-lg">{email}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    {t('auth.memberSince')}
                  </label>
                  <p className="font-body text-lg">{createdAt}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    {t('auth.status')}
                  </label>
                  <Badge variant="success">{t('auth.active')}</Badge>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <h3 className="font-headline text-xl uppercase mb-4">
                  {t('admin.quickActions').toUpperCase()}
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => navigate('/quinielas/create')}
                  >
                    {t('quinielas.create')}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/quinielas')}
                  >
                    {t('quinielas.browse')}
                  </Button>
                </div>
              </Card>

              <Card className="border-raw-red">
                <h3 className="font-headline text-xl uppercase mb-4 text-raw-red">
                  {t('auth.dangerZone').toUpperCase()}
                </h3>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  {t('auth.signOut')}
                </Button>
              </Card>
            </div>
          </div>

          {/* My Quinielas */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-3xl uppercase">{t('quinielas.myQuinielas').toUpperCase()}</h2>
              <Link to="/quinielas/create">
                <Button size="small">{t('quinielas.create').toUpperCase()}</Button>
              </Link>
            </div>

            {loadingQuinielas ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : !userQuinielas || userQuinielas.length === 0 ? (
              <div className="border-thick border-gray-300 bg-gray-50 p-12 text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="font-headline text-xl uppercase mb-2">
                  {t('quinielas.noQuinielasYet').toUpperCase()}
                </h3>
                <p className="text-gray-600 mb-6">{t('quinielas.noQuinielasYetDesc')}</p>
                <Link to="/quinielas/create">
                  <Button>{t('quinielas.create').toUpperCase()}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userQuinielas.map((quiniela) => {
                  const isPastDeadline = new Date(quiniela.deadline) < new Date()
                  const isCreator = quiniela.creator_id === user.id
                  return (
                    <Link
                      key={quiniela.id}
                      to={`/quinielas/${quiniela.share_code}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 border-thick border-gray-200 hover:border-gray-900 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-headline text-lg uppercase truncate">
                              {quiniela.name}
                            </span>
                            {isCreator && (
                              <Badge variant="info">{t('quinielas.creator').toUpperCase()}</Badge>
                            )}
                            <Badge variant={quiniela.is_public ? 'success' : 'warning'}>
                              {quiniela.is_public ? t('quinielas.public').toUpperCase() : t('quinielas.private').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="font-mono">{quiniela.share_code}</span>
                            <span>•</span>
                            <span>{quiniela.participants_count} {t('quinielas.participants').toLowerCase()}</span>
                            <span>•</span>
                            <span className={isPastDeadline ? 'text-red-600' : ''}>
                              {t('quinielas.deadline')}: {format(new Date(quiniela.deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
