import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Register() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength', { count: 6 }))
      return
    }

    if (username.length < 3) {
      setError(t('auth.usernameMinLength', { count: 3 }))
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, username)

    if (error) {
      setError(error.message || t('auth.failedToCreateAccount'))
      setLoading(false)
    } else {
      // Success - redirect to home or show success message
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-raw-white flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-5xl uppercase mb-4">{t('auth.register').toUpperCase()}</h1>
          <p className="font-body text-gray-700">
            {t('auth.registerPrompt')}
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
              label={t('auth.username')}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.chooseUsername')}
              helperText={t('validation.minLength', { count: 3 })}
              required
              disabled={loading}
            />

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
              placeholder={t('auth.createPassword')}
              helperText={t('validation.minLength', { count: 6 })}
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('auth.creatingAccount').toUpperCase() : t('auth.createAccount').toUpperCase()}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-thin border-gray-300 text-center">
            <p className="font-body text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-raw-blue font-semibold hover:underline">
                {t('auth.signInHere')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
