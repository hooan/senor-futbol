import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await requestPasswordReset(email)

    if (error) {
      setError(error.message || t('auth.failedToSendResetEmail'))
      setLoading(false)
      return
    }

    setSuccess(t('auth.resetEmailSent'))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-raw-white flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-5xl uppercase mb-4">{t('auth.forgotPassword').toUpperCase()}</h1>
          <p className="font-body text-gray-700">{t('auth.forgotPasswordPrompt')}</p>
        </div>

        <Card variant="elevated">
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
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? t('auth.sendingResetEmail').toUpperCase() : t('auth.sendResetEmail').toUpperCase()}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-thin border-gray-300 text-center">
            <Link to="/login" className="text-raw-blue font-semibold hover:underline">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
