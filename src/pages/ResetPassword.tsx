import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPassword() {
  const { t } = useTranslation()
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setReady(!!data.session)
    }

    checkRecoverySession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || !!session) {
        setReady(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength', { count: 6 }))
      return
    }

    setLoading(true)

    const { error } = await updatePassword(password)

    if (error) {
      setError(error.message || t('auth.failedToResetPassword'))
      setLoading(false)
      return
    }

    setSuccess(t('auth.passwordUpdated'))
    setLoading(false)

    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-raw-white flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-5xl uppercase mb-4">{t('auth.resetPassword').toUpperCase()}</h1>
          <p className="font-body text-gray-700">{t('auth.resetPasswordPrompt')}</p>
        </div>

        <Card variant="elevated">
          {!ready ? (
            <div className="space-y-4">
              <div className="border-thick border-yellow-700 bg-yellow-50 p-4">
                <p className="font-body text-sm text-yellow-800">{t('auth.resetLinkInvalid')}</p>
              </div>
              <div className="text-center">
                <Link to="/forgot-password" className="text-raw-blue font-semibold hover:underline">
                  {t('auth.requestNewResetLink')}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="border-thick border-raw-red bg-red-50 p-4">
                  <p className="font-body text-sm text-raw-red">{error}</p>
                </div>
              )}

              {success && (
                <div className="border-thick border-green-700 bg-green-50 p-4">
                  <p className="font-body text-sm text-green-800">{success}</p>
                </div>
              )}

              <Input
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.createPassword')}
                required
                disabled={loading}
              />

              <Input
                label={t('auth.confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmYourPassword')}
                required
                disabled={loading}
              />

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? t('auth.updatingPassword').toUpperCase() : t('auth.updatePassword').toUpperCase()}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
