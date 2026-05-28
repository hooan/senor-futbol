import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/ui/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center">
        <Loading size="large" text="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
