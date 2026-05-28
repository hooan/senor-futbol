import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Loading from '@/components/ui/Loading'

interface AdminRouteProps {
  children: React.ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  // Check if user is authenticated and is admin
  const isAdmin = user?.user_metadata?.is_admin === true

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-raw-white flex items-center justify-center px-4">
        <div className="max-w-md text-center p-8 border-thick border-red-600 bg-red-50">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="font-headline text-2xl uppercase mb-4 text-red-900">ACCESS DENIED</h2>
          <p className="text-red-800 mb-6">
            You don't have permission to access the admin panel. This area is restricted to
            administrators only.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white border-thick border-red-700 uppercase font-semibold hover:bg-red-700"
          >
            BACK TO HOME
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
