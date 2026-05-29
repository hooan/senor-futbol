import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message || t('auth.failedToSignIn'))
      setLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-raw-white flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-5xl uppercase mb-4">{t('auth.login').toUpperCase()}</h1>
          <p className="font-body text-gray-700">
            {t('auth.signInPrompt')}
          </p>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-thick border-raw-red bg-red-50 p-4">
                <p className="font-body text-sm text-raw-red">{error}</p>
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

            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('auth.signingIn').toUpperCase() : t('auth.signIn').toUpperCase()}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-thin border-gray-300 text-center">
            <p className="font-body text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-raw-blue font-semibold hover:underline">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
