import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Loading from '@/components/ui/Loading'
import Badge from '@/components/ui/Badge'

export default function Profile() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text="Loading profile..." />
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
            PROFILE
          </h1>
          <p className="font-body text-lg text-gray-700">
            Manage your account and preferences
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Account Information */}
            <Card variant="elevated">
              <h2 className="font-headline text-2xl uppercase mb-6">
                ACCOUNT INFO
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    Username
                  </label>
                  <p className="font-body text-lg font-semibold">{username}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    Email
                  </label>
                  <p className="font-body text-lg">{email}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    Member Since
                  </label>
                  <p className="font-body text-lg">{createdAt}</p>
                </div>

                <div>
                  <label className="font-mono text-xs uppercase text-gray-600 block mb-1">
                    Status
                  </label>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <h3 className="font-headline text-xl uppercase mb-4">
                  QUICK ACTIONS
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => navigate('/quinielas/create')}
                  >
                    Create Quiniela
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/quinielas')}
                  >
                    My Quinielas
                  </Button>
                </div>
              </Card>

              <Card className="border-raw-red">
                <h3 className="font-headline text-xl uppercase mb-4 text-raw-red">
                  DANGER ZONE
                </h3>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
