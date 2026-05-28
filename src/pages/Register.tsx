import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Register() {
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
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, username)

    if (error) {
      setError(error.message || 'Failed to create account')
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
          <h1 className="font-headline text-5xl uppercase mb-4">REGISTER</h1>
          <p className="font-body text-gray-700">
            Create an account to access all features
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
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              helperText="Minimum 3 characters"
              required
              disabled={loading}
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              helperText="Minimum 6 characters"
              required
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t-thin border-gray-300 text-center">
            <p className="font-body text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-raw-blue font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
